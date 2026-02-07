import { Context } from "effect";
import { Spotify, spotifyService } from "./services/spotify";
import { SongCache, songCacheInstance, VibeHistory, vibeHistoryInstance } from "./cache";

export const context = Context.empty().pipe(
  Context.add(Spotify, spotifyService),
  Context.add(SongCache, songCacheInstance),
  Context.add(VibeHistory, vibeHistoryInstance),
);
