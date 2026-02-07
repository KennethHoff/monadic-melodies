import { serve } from "bun";
import homepage from "./index.html";
import currentSong from "./routes/current-song";
import searchSongs from "./routes/search-songs";
import setTrack from "./routes/set-track";
import vibeHistory from "./routes/vibe-history";

const server = serve({
  routes: {
    "/": homepage,
    "/hooks/spotify/set-track": setTrack,
    "/api/songs/current": currentSong,
    "/api/songs/search": searchSongs,
    "/api/vibes/history": vibeHistory,
  },

  development: process.env.NODE_ENV !== "production",
});

console.log(`Listening on ${server.url}`);
