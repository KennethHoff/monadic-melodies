import { SpotifyApi, type PartialSearchResult } from "@spotify/web-api-ts-sdk";
import { Effect, Context, Data, Config } from "effect";
import type { ConfigError } from "effect/ConfigError";

type SpotifySong = {
  artists: string[];
  name: string;
  uri: string;
  link: string;
};

type searchResult = Required<Pick<PartialSearchResult, "tracks">>;

class AuthError extends Data.TaggedError("Authfailure")<{}> {}
class ServiceError extends Data.TaggedError("ServiceFailure")<{}> {}

// Declaring a tag for the Spotify service
export class Spotify extends Context.Tag("SpotifyService")<
  Spotify,
  {
    readonly songFromVibe: (
      vibe: string,
    ) => Effect.Effect<SpotifySong, ConfigError | AuthError, never>;
    readonly search: (
      query: string,
    ) => Effect.Effect<SpotifySong, ServiceError | ConfigError, never>;
  }
>() {}

const getClient = Effect.gen(function* () {
  const clientId = yield* Config.string("SPOTIFY_CLIENT_ID");
  const secret = yield* Config.string("SPOTIFY_CLIENT_SECRET");

  return SpotifyApi.withClientCredentials(clientId, secret, [
    "user-read-private",
  ]);
});

export const spotifyService = Spotify.of({
  songFromVibe: (vibe) =>
    Effect.gen(function* () {
      const client = yield* getClient;

      return {
        artists: ["Artist 1", "Artist 2"],
        name: `Song for vibe: ${vibe}`,
        uri: "spotify:track:5NEKjqTQPKiqOiOG8YxLdS",
        link: "https://open.spotify.com/track/5NEKjqTQPKiqOiOG8YxLdS",
      };
    }),
  search: (query: string) =>
    Effect.gen(function* () {
      const client = yield* getClient;

      const res = yield* Effect.promise(() => client.search(query, ["track"]));

      const track = res.tracks.items[0];

      if (!track) {
        return yield* new ServiceError();
      }

      return {
        artists: track.artists.map((artist) => artist.name),
        name: track.name,
        uri: track.uri,
        link: track.external_urls.spotify,
      } satisfies SpotifySong;
    }),
});
