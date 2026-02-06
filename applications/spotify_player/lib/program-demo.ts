import { Effect } from "effect";
import { Vibe } from "./services/vibe";
import { Spotify } from "./services/spotify";
import { context } from "./context";

const program = Effect.gen(function* () {
  const vibe = yield* Vibe;
  const spotify = yield* Spotify;

  const currentVibe = yield* vibe.current;
  const song = yield* spotify.songFromVibe(currentVibe);

  yield* Effect.log(`Current vibe: ${currentVibe}`);

  return yield* Effect.succeed(
    `Recommended song: ${song.name} by ${song.artists.join(", ")}`,
  );
});

const runnable = Effect.provide(program, context);

const run = () => Effect.runPromise(runnable.pipe(Effect.either));
