import { Context } from "effect";
import { Spotify, spotifyService } from "./services/spotify";
import { SongCache, songCacheInstance } from "./cache";

export const context = Context.empty().pipe(
  Context.add(Spotify, spotifyService),
  Context.add(SongCache, songCacheInstance),
);
