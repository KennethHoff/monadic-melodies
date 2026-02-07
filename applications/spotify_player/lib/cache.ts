import { Context, Effect, Option, Ref } from "effect";

export type CachedSongData = {
  songUri: string;
  vibe: string;
  setAt: number;
};

export const STALE_AFTER_MS = 60_000; // 1 minute

export class SongCache extends Context.Tag("SongCache")<
  SongCache,
  Ref.Ref<Option.Option<CachedSongData>>
>() {}

export const songCacheInstance = Effect.runSync(
  Ref.make(Option.none<CachedSongData>()),
);

export const isStale = (data: CachedSongData): boolean =>
  Date.now() - data.setAt > STALE_AFTER_MS;