import { Context, Effect, Option, Ref } from "effect";

export class SongCache extends Context.Tag("SongCache")<
  SongCache,
  Ref.Ref<Option.Option<string>>
>() {}

export const songCacheInstance = Effect.runSync(
  Ref.make(Option.none<string>()),
);
