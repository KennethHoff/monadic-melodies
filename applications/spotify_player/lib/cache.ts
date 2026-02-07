import { Cache, Context, Duration, Effect, Option } from "effect";

const CACHE_KEY = "currentSongUri";

export class SongCache extends Context.Tag("SongCache")<
  SongCache,
  Cache.Cache<string, Option.Option<string>, never>
>() {}

export const songCacheInstance = Effect.runSync(
  Cache.make({
    capacity: 10,
    timeToLive: Duration.minutes(1),
    lookup: (_key: string) => Effect.succeed(Option.none<string>()),
  }),
);

export { CACHE_KEY };
