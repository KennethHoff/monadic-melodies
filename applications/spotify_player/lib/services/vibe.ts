import { Effect, Context } from "effect";

// Declaring a tag for a service that generates random numbers
export class Vibe extends Context.Tag("VibeService")<
  Vibe,
  { current: Effect.Effect<string> }
>() {}

export const vibeService = Vibe.of({
  current: Effect.sync(() => {
    const vibes = ["chill", "energetic", "melancholic", "happy"];
    return vibes[Math.floor(Math.random() * vibes.length)] as string;
  }),
});
