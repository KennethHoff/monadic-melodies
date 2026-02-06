{
  inputs = {
    flake-parts.url = "github:hercules-ci/flake-parts";
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = inputs @ {
    flake-parts,
    self,
    ...
  }:
    flake-parts.lib.mkFlake {inherit inputs;} {
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];

      perSystem = {pkgs, ...}: let
        flyAppName = "applications-morning-thunder-4195";

        localImageName = flyAppName;
        localImageTag = self.dirtyRev;
        flyImageRef = "registry.fly.io/${flyAppName}:${localImageTag}";

        outDir = ".nix";
        imageOut = "${outDir}/fly-image-${localImageTag}.tar";

        mkOutDir = ''
          mkdir -p ${outDir}
        '';

        loadImage = pkgs.writeShellApplication {
          name = "load-fly-image";
          runtimeInputs = [pkgs.docker];
          text = ''
            set -euo pipefail
            ${mkOutDir}

            nix build .#flyImage -o ${imageOut}
            ${imageOut} | docker image load

            docker image ls ${localImageName} --format '{{.Repository}}:{{.Tag}}'
          '';
        };

        flyPush = pkgs.writeShellApplication {
          name = "fly-push";
          runtimeInputs = [
            pkgs.docker
            pkgs.flyctl
          ];
          text = ''
            set -euo pipefail
            ${mkOutDir}

            nix build .#flyImage -o ${imageOut}
            ${imageOut} | docker image load

            flyctl auth docker

            docker image tag ${localImageName}:${localImageTag} ${flyImageRef}
            docker push ${flyImageRef}
          '';
        };

        flyDeploy = pkgs.writeShellApplication {
          name = "fly-deploy";
          runtimeInputs = [pkgs.flyctl];
          text = ''
            set -euo pipefail
            flyctl deploy -c fly.toml -a ${flyAppName}
          '';
        };

        flyImage = pkgs.dockerTools.streamLayeredImage {
          name = localImageName;
          tag = localImageTag;

          contents = [
            pkgs.bashInteractive
            pkgs.coreutils
            pkgs.cacert
            pkgs.zsh
          ];

          config = {
            Cmd = ["${pkgs.bashInteractive}/bin/bash"];
          };
        };
      in {
        packages.flyImage = flyImage;

        apps = {
          loadImage = {
            type = "app";
            program = "${loadImage}/bin/load-fly-image";
          };

          flyPush = {
            type = "app";
            program = "${flyPush}/bin/fly-push";
          };

          flyDeploy = {
            type = "app";
            program = "${flyDeploy}/bin/fly-deploy";
          };
        };

        devShells.default = pkgs.mkShell {
          packages = [
            pkgs.elixir
            pkgs.erlang
            pkgs.flyctl
            pkgs.docker
          ];

          shellHook = ''
            export MIX_HOME="$PWD/.mix"
            yes | mix archive.install hex phx_new
          '';
        };
      };
    };
}
