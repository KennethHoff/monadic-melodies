import { serve } from "bun";
import homepage from "./index.html";
import spotifyEmbed from "./spotify-embed.html";
import { Effect, Schema, Option, Config, Ref } from "effect";
import { Spotify } from "../lib/services/spotify";
import { context } from "../lib/context";
import { SongCache } from "../lib/cache";
import { SetTrackPayload } from "../lib/schemas";

const server = serve({
  routes: {
    "/": homepage,
    "/spotify-embed": spotifyEmbed,
    "/hooks/spotify/set-track": {
      async POST(req) {
        const payload = await req.json();

        const impl = Effect.gen(function* () {
          const ref = yield* SongCache;
          const current = yield* Ref.get(ref);

          if (Option.isNone(current)) {
            const { artist, song } =
              yield* Schema.decodeUnknown(SetTrackPayload)(payload);

            const spotify = yield* Spotify;
            const result = yield* spotify.search(`${artist} ${song}`);
            yield* Ref.set(ref, Option.some(result.uri));
          }
        }).pipe(
          Effect.tapError((err) =>
            Effect.log("Error processing set-track request", err),
          ),
        );

        const runnable = Effect.provide(impl, context);
        await Effect.runPromise(runnable);

        return Response.json(null);
      },
    },
    "/api/songs/current": {
      async GET(req) {
        const impl = Effect.gen(function* () {
          const ref = yield* SongCache;
          const current = yield* Ref.get(ref);

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

  development: true,
});

console.log(`Listening on ${server.url}`);
