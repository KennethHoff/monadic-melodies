import { Cache, Duration, Effect, Option } from "effect";

export const cachekeys = {
  currentSongUri: "currentSongUri",
};

type CacheKey = keyof typeof cachekeys;

export const appCache = Cache.make({
  capacity: 10,
  timeToLive: Duration.minutes(1),
  // Since we are "pushing" data manually, we tell the lookup to return None
  lookup: (key: CacheKey) => Effect.succeed(Option.none<string>()),
});


