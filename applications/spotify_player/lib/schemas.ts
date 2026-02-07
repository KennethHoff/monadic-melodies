import { Schema } from "effect";

export const SetTrackPayload = Schema.Struct({
  song: Schema.NonEmptyString,
  artist: Schema.NonEmptyString,
  vibe: Schema.NonEmptyString,
});
