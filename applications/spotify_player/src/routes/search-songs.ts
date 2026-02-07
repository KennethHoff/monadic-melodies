import { Effect } from "effect";
import { Spotify } from "../../lib/services/spotify";
import { context } from "../../lib/context";

export default {
  async GET(req: Request) {
    const url = new URL(req.url);
    const query = url.searchParams.get("q");

    if (!query) {
      return new Response("Missing query parameter 'q'", { status: 400 });
    }

    const impl = Effect.gen(function* () {
      yield* Effect.log("search-songs request received", { query });
      const spotifyService = yield* Spotify;
      const song = yield* spotifyService.search(query);
      yield* Effect.log("search-songs result", { query, songName: song.name });
      return song;
    }).pipe(Effect.withSpan("route.searchSongs", { attributes: { query } }));

    const runnable = Effect.provide(impl, context).pipe(Effect.either);
    const res = await Effect.runPromise(runnable);

    return Response.json(res);
  },
};
