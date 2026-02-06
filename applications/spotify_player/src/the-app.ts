import { serve } from "bun";
import homepage from "./index.html";
import spotifyEmbed from "./spotify-embed.html";
import { Effect } from "effect";
import { Vibe } from "../lib/services/vibe";
import { Spotify } from "../lib/services/spotify";
import { context } from "../lib/context";
import { getCurrentUri } from "../lib/cache.ts";

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
        const current = getCurrentUri();

        return Response.json(current);
      },
    },
    "/api/songs/search": {
      async GET(req) {
        const url = new URL(req.url);
        const query = url.searchParams.get("q");

        if (!query) {
          return new Response("Missing query parameter 'q'", { status: 400 });
        }

        const impl = Effect.gen(function* () {
          const spotifyService = yield* Spotify;

          const song = yield* spotifyService.search(query);

          return yield* Effect.succeed(song);
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
