import { Effect, Context, Data } from "effect";

type SpotifySong = {
  artists: string[];
  name: string;
  uri: string;
  link: string;
};

class Authfailure extends Data.TaggedError("Authfailure")<{}> {}

// Declaring a tag for the Spotify service
export class Spotify extends Context.Tag("SpotifyService")<
  Spotify,
  {
    readonly songFromVibe: (
      vibe: string,
    ) => Effect.Effect<SpotifySong, Authfailure>;
  }
>() {}

export const spotifyService = Spotify.of({
  songFromVibe: (vibe) =>
    Effect.gen(function* () {
      if (Math.random() < 0.2) {
        yield* new Authfailure();
      }

      return {
        artists: ["Artist 1", "Artist 2"],
        name: `Song for vibe: ${vibe}`,
        uri: "spotify:track:5NEKjqTQPKiqOiOG8YxLdS",
        link: "https://open.spotify.com/track/5NEKjqTQPKiqOiOG8YxLdS",
      };
    }),
});
