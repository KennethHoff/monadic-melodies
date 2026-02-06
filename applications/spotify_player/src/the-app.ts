import { serve } from "bun";
import homepage from "./index.html";
import spotifyEmbed from "./spotify-embed.html";
import { Effect } from "effect";
import { Vibe } from "../lib/services/vibe";
import { Spotify } from "../lib/services/spotify";
import { context } from "../lib/context";

const server = serve({
  routes: {
    // ** HTML imports **
    // Bundle & route index.html to "/". This uses HTMLRewriter to scan
    // the HTML for `<script>` and `<link>` tags, runs Bun's JavaScript
    // & CSS bundler on them, transpiles any TypeScript, JSX, and TSX,
    // downlevels CSS with Bun's CSS parser and serves the result.
    "/": homepage,
    "/spotify-embed": spotifyEmbed,
    "/hooks/spotify/set-track": {
      async POST(req) {
        if (!req.body) {
          console.log("No body");
          return new Response("No body");
        }

        const json = await req.json();
        const trackUri = json["track-uri"];
        if (!trackUri) {
          console.log("No track uri");
          return new Response("No track uri");
        }

        console.log("Got this uri", trackUri);

        return new Response(
          JSON.stringify({
            success: Math.random() < 0.5,
          }),
        );
      },
    },
    "/api/songs/current": {
      async GET(req) {
        const impl = Effect.gen(function* () {
          const vibeService = yield* Vibe;
          const spotifyService = yield* Spotify;

          const vibe = yield* vibeService.current;
          const song = yield* spotifyService.songFromVibe(vibe);

          yield* Effect.log(`Current vibe: ${vibe}`);

          return yield* Effect.succeed(song.uri);
        });

        const runnable = Effect.provide(impl, context).pipe(Effect.either);

        const res = await Effect.runPromise(runnable);

        return Response.json(res);
      },
    },
  },

  // Enable development mode for:
  // - Detailed error messages
  // - Hot reloading (Bun v1.2.3+ required)
  development: true,
});

console.log(`Listening on ${server.url}`);
