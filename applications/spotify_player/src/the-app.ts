import { serve } from "bun";
import homepage from "./index.html";
import currentSong from "./routes/current-song";
import searchSongs from "./routes/search-songs";
import setTrack from "./routes/set-track";

const server = serve({
  routes: {
    "/": homepage,
    "/hooks/spotify/set-track": setTrack,
    "/api/songs/current": currentSong,
    "/api/songs/search": searchSongs,
  },

  development: true,
});

console.log(`Listening on ${server.url}`);
