import { serve } from "bun";
import homepage from "./index.html";
import spotifyEmbed from "./spotify-embed.html";
import { Effect, Schema, Option } from "effect";
import { Vibe } from "../lib/services/vibe";
import { Spotify } from "../lib/services/spotify";
import { context } from "../lib/context";
import { appCache } from "../lib/cache";
import { JsonParseError } from "../lib/errors";
import { SetTrackPayload } from "../lib/schemas";

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
        const impl = Effect.gen(function* () {
          // Parse and Validate
          const { song, artist } = yield* Effect.tryPromise({
            try: () => req.json(),
            catch: () => new JsonParseError(),
          }).pipe(Effect.flatMap(Schema.decodeUnknown(SetTrackPayload)));

          const cache = yield* appCache;
          const cacheKey = "currentSongUri";

          return yield* cache.get(cacheKey).pipe(
            Effect.flatMap((cachedUri) =>
              Effect.gen(function* () {
                // Set cache if not set
                if (Option.isNone(cachedUri)) {
                  const spotify = yield* Spotify;
                  const result = yield* spotify.search(`${artist} ${song}`);
                  yield* cache.set(cacheKey, Option.some(result.uri));
                }
              }),
            ),
          );
        });

        const runnable = Effect.provide(impl, context).pipe(Effect.either);

        const res = await Effect.runPromise(runnable);

        return Response.json(res);
      },
    },
    "/api/songs/current": {
      async GET(req) {
        const impl = Effect.gen(function* () {
          const cache = yield* appCache;
          const cacheKey = "currentSongUri";

          const current = yield* cache.get(cacheKey);

          return yield* Option.match(current, {
            onNone: () => Effect.succeed(undefined),
            onSome: (uri) => Effect.succeed(uri),
          });
        });

        const runnable = Effect.provide(impl, context);

        const res = await Effect.runPromise(runnable);

        return Response.json(res);
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
