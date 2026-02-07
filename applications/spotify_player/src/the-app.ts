import { serve } from "bun";
import homepage from "./index.html";
import spotifyEmbed from "./spotify-embed.html";
import { Effect, Schema, Option, Config } from "effect";
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
        const payload = await req.json();

        const impl = Effect.gen(function* () {
          // Parse and Validate
          const cache = yield* appCache;
          const cacheKey = "currentSongUri";

          //   req.json().then((payload) => {
          //     console.log("Received set-track request with payload:", payload);
          //   });

          // sleep 1 sec
          //   yield* Effect.sleep(1000)

          return yield* cache.get(cacheKey).pipe(
            Effect.flatMap((cachedUri) =>
              Effect.gen(function* () {
                // Set cache if not set
                if (Option.isNone(cachedUri)) {
                  //   const payload = yield* Effect.tryPromise({
                  //     try: () => req.json(),
                  //     catch: () => Effect.fail(JsonParseError),
                  //   });

                  const { artist, song, vibe } =
                    yield* Schema.decodeUnknown(SetTrackPayload)(payload);

                  const spotify = yield* Spotify;
                  const result = yield* spotify.search(`${artist} ${song}`);
                  yield* cache.set(cacheKey, Option.some(result.uri));
                }
              }),
            ),
          );
        }).pipe(
          Effect.tapError((err) =>
            Effect.log("Error processing set-track request", err),
          ),
        );

        const runnable = Effect.provide(impl, context); //.pipe(Effect.either);

        await Effect.runPromise(runnable);

        return Response.json(null);
      },
    },
    "/api/songs/current": {
      async GET(req) {
        const impl = Effect.gen(function* () {
          const cache = yield* appCache;
          const cacheKey = "currentSongUri";

          const current = yield* cache.get(cacheKey);

          return yield* Option.match(current, {
            onNone: () =>
              Effect.gen(function* () {
                const webhookUrl = yield* Config.string(
                  "VIBE_ANALYZER_WEBHOOK_URI",
                );
                fetch(webhookUrl, { method: "POST" });
                return yield* Effect.succeed(null);
              }),
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
