import { Effect, Option, Config, Ref } from "effect";
import { context } from "../../lib/context";
import { SongCache, isStale } from "../../lib/cache";

const triggerWebhook = Effect.gen(function* () {
  yield* Effect.log("Triggering vibe analyzer webhook");
  const webhookUrl = yield* Config.string("VIBE_ANALYZER_WEBHOOK_URI");
  fetch(webhookUrl, { method: "POST" });
}).pipe(Effect.withSpan("triggerWebhook"));

export default {
  async GET(req: Request) {
    const impl = Effect.gen(function* () {
      yield* Effect.log("current-song request received");
      const cache = yield* SongCache;
      const current = yield* Ref.get(cache);

      return yield* Option.match(current, {
        onNone: () =>
          Effect.gen(function* () {
            yield* Effect.log("Cache empty, triggering webhook");
            yield* triggerWebhook;
            return { songUri: null, vibe: null, setAt: null, stale: true };
          }),
        onSome: (data) =>
          Effect.gen(function* () {
            const stale = isStale(data);
            if (stale) {
              yield* Effect.log("Cache stale, triggering webhook", {
                songUri: data.songUri,
                vibe: data.vibe,
                age: Date.now() - data.setAt,
              });
              yield* triggerWebhook;
            } else {
              yield* Effect.log("Serving cached song", {
                songUri: data.songUri,
                vibe: data.vibe,
              });
            }
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
