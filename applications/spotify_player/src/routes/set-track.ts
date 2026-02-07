import { Effect, Schema, Option, Ref } from "effect";
import { Spotify } from "../../lib/services/spotify";
import { context } from "../../lib/context";
import { SongCache, VibeHistory } from "../../lib/cache";
import { SetTrackPayload } from "../../lib/schemas";

export default {
  async POST(req: Request) {
    const payload = await req.json();

    const impl = Effect.gen(function* () {
      yield* Effect.log("set-track request received", { payload });
      const cache = yield* SongCache;
      const current = yield* Ref.get(cache);

      const { artist, song, vibe } =
        yield* Schema.decodeUnknown(SetTrackPayload)(payload);

      yield* Effect.log("Searching for track", { artist, song, vibe });
      const spotify = yield* Spotify;
      const result = yield* spotify.search(`${artist} ${song}`);

      const history = yield* VibeHistory;
      yield* Option.match(current, {
        onNone: () => Effect.void,
        onSome: (prev) => Ref.update(history, (h) => [prev, ...h]),
      });

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
