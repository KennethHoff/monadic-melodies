import { Effect, Ref } from "effect";
import { context } from "../../lib/context";
import { VibeHistory } from "../../lib/cache";

export default {
  async GET(req: Request) {
    const impl = Effect.gen(function* () {
      const history = yield* VibeHistory;
      return yield* Ref.get(history);
    }).pipe(Effect.withSpan("route.vibeHistory"));

    const runnable = Effect.provide(impl, context);
    const res = await Effect.runPromise(runnable);

    return Response.json(res);
  },
};
