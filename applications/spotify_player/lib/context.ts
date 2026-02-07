import { Context } from "effect";
import { Spotify, spotifyService } from "./services/spotify";
import { Vibe, vibeService } from "./services/vibe";
import { SongCache, songCacheInstance } from "./cache";

export const context = Context.empty().pipe(
  Context.add(Spotify, spotifyService),
  Context.add(Vibe, vibeService),
  Context.add(SongCache, songCacheInstance),
);
