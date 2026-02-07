import { Effect, Schema, Option, Ref } from "effect";
import { Spotify } from "../../lib/services/spotify";
import { context } from "../../lib/context";
import { SongCache } from "../../lib/cache";

const VibePayload = Schema.Struct({
  vibe: Schema.NonEmptyString,
});

export default {
  async POST(req: Request) {
    const payload = await req.json();

    const impl = Effect.gen(function* () {
      yield* Effect.log("new-vibe request received", { payload });
      const { vibe } = yield* Schema.decodeUnknown(VibePayload)(payload);

      const spotify = yield* Spotify;
      const result = yield* spotify.search(`${vibe} vibes music`);

      const cache = yield* SongCache;
      yield* Ref.set(
        cache,
        Option.some({ songUri: result.uri, vibe, setAt: Date.now() }),
      );

      yield* Effect.log("Cache updated from new-vibe", {
        songUri: result.uri,
        vibe,
      });

      return { songUri: result.uri, vibe, unlocked: true };
    }).pipe(
      Effect.withSpan("route.newVibe"),
      Effect.tapError((err) =>
        Effect.log("Error processing new-vibe request", err),
      ),
    );

    const runnable = Effect.provide(impl, context);
    const res = await Effect.runPromise(runnable).catch(() => ({
      unlocked: false,
      error: "Failed to process vibe",
    }));

    return Response.json(res);
  },
};
