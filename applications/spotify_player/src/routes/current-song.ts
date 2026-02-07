import { Effect, Option, Ref } from "effect";
import { context } from "../../lib/context";
import { SongCache, isStale } from "../../lib/cache";

export default {
  async GET(req: Request) {
    const impl = Effect.gen(function* () {
      yield* Effect.log("current-song request received");
      const cache = yield* SongCache;
      const current = yield* Ref.get(cache);

      return yield* Option.match(current, {
        onNone: () =>
          Effect.gen(function* () {
            yield* Effect.log("Cache empty, no vibe set");
            return { songUri: null, vibe: null, setAt: null, stale: true };
          }),
        onSome: (data) =>
          Effect.gen(function* () {
            const stale = isStale(data);
            yield* Effect.log("Serving cached song", {
              songUri: data.songUri,
              vibe: data.vibe,
              stale,
            });
            return {
              songUri: data.songUri,
              vibe: data.vibe,
              setAt: data.setAt,
              stale,
            };
          }),
      });
    }).pipe(Effect.withSpan("route.currentSong"));

    const runnable = Effect.provide(impl, context);
    const res = await Effect.runPromise(runnable);

    return Response.json(res);
  },
};
