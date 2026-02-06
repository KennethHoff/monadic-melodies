import { Context, Effect } from "effect";
import { Spotify, spotifyService } from "./services/spotify";
import { Vibe, vibeService } from "./services/vibe";

export const context = Context.empty().pipe(
  Context.add(Spotify, spotifyService),
  Context.add(Vibe, vibeService),
);
