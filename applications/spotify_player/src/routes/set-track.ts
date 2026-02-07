import { Effect, Schema, Option, Ref } from "effect";
import { Spotify } from "../../lib/services/spotify";
import { context } from "../../lib/context";
import { SongCache, isStale } from "../../lib/cache";
import { SetTrackPayload } from "../../lib/schemas";

export default {
  async POST(req: Request) {
    const payload = await req.json();

    const impl = Effect.gen(function* () {
      yield* Effect.log("set-track request received", { payload });
      const cache = yield* SongCache;
      const current = yield* Ref.get(cache);

      const shouldUpdate = Option.match(current, {
        onNone: () => true,
        onSome: (data) => isStale(data),
      });

      if (!shouldUpdate) {
        yield* Effect.log("Cache is fresh, skipping update");
        return;
      }

      const { artist, song, vibe } =
        yield* Schema.decodeUnknown(SetTrackPayload)(payload);

      yield* Effect.log("Searching for track", { artist, song, vibe });
      const spotify = yield* Spotify;
      const result = yield* spotify.search(`${artist} ${song}`);

      yield* Ref.set(
        cache,
        Option.some({ songUri: result.uri, vibe, setAt: Date.now() }),
      );
      yield* Effect.log("Cache updated with new track", { songUri: result.uri, vibe });
    }).pipe(
      Effect.withSpan("route.setTrack"),
      Effect.tapError((err) =>
        Effect.log("Error processing set-track request", err),
      ),
    );

    const runnable = Effect.provide(impl, context);
    await Effect.runPromise(runnable);

    return Response.json(null);
  },
};
