import { serve } from "bun";
import homepage from "./index.html";
import spotifyEmbed from "./spotify-embed.html";
import { hook as spotifyTrackIdWebhook } from "./webhooks/spotify-track-id.ts";
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
    "/hooks/spotify/set-track": spotifyTrackIdWebhook,
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
