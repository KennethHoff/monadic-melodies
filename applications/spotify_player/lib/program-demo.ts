import { Effect, Either } from "effect";
import { Vibe } from "./services/vibe";
import { Spotify } from "./services/spotify";
import { context } from "./context";

const program = Effect.gen(function* () {
  const vibeService = yield* Vibe;
  const spotifyService = yield* Spotify;

  const vibe = yield* vibeService.current;
  const song = yield* spotifyService.songFromVibe(vibe);

  yield* Effect.log(`Current vibe: ${vibe}`);

  return yield* Effect.succeed(
    `Recommended song: ${song.name} by ${song.artists.join(", ")}`,
  );
});


const runnable = Effect.provide(program, context);

export const runner = Effect.runPromise(runnable)
