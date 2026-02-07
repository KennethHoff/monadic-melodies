import { SpotifyApi, type PartialSearchResult } from "@spotify/web-api-ts-sdk";
import { Effect, Context, Data, Config } from "effect";
import type { ConfigError } from "effect/ConfigError";
import { ServiceError, type AuthError } from "../errors";

type SpotifySong = {
  artists: string[];
  name: string;
  uri: string;
  link: string;
};

// Declaring a tag for the Spotify service
export class Spotify extends Context.Tag("SpotifyService")<
  Spotify,
  {
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
  search: (query: string) =>
    Effect.gen(function* () {
      yield* Effect.log("Searching Spotify", { query });
      const client = yield* getClient;

      const res = yield* Effect.promise(() => client.search(query, ["track"]));

      const track = res.tracks.items[0];

      if (!track) {
        yield* Effect.log("No track found for query", { query });
        return yield* new ServiceError();
      }

      const song = {
        artists: track.artists.map((artist) => artist.name),
        name: track.name,
        uri: track.uri,
        link: track.external_urls.spotify,
      } satisfies SpotifySong;

      yield* Effect.log("Track found", {
        query,
        songName: song.name,
        uri: song.uri,
      });
      return song;
    }).pipe(Effect.withSpan("Spotify.search", { attributes: { query } })),
});
