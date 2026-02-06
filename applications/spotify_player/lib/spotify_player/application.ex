defmodule SpotifyPlayer.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      SpotifyPlayerWeb.Telemetry,
      SpotifyPlayer.Repo,
      {DNSCluster, query: Application.get_env(:spotify_player, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: SpotifyPlayer.PubSub},
      # Start a worker by calling: SpotifyPlayer.Worker.start_link(arg)
      # {SpotifyPlayer.Worker, arg},
      # Start to serve requests, typically the last entry
      SpotifyPlayerWeb.Endpoint
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: SpotifyPlayer.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    SpotifyPlayerWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
