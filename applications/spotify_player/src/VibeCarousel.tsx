import { useEffect, useState, useCallback, useRef } from "react";

type SongData = {
  songUri: string | null;
  vibe: string | null;
  setAt: number | null;
  stale: boolean;
};

const POLL_INTERVAL_MS = 5_000;
const STALE_THRESHOLD_MS = 60_000;

const useCurrentSong = () => {
  const [data, setData] = useState<SongData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const prevSetAtRef = useRef<number | null>(null);
  const [justUpdated, setJustUpdated] = useState(false);

  const fetchCurrent = useCallback(async () => {
    try {
      const res = await fetch("/api/songs/current");
      const json: SongData = await res.json();
      setData(json);
      setError(null);

      if (
        prevSetAtRef.current !== null &&
        json.setAt !== null &&
        json.setAt !== prevSetAtRef.current
      ) {
        setJustUpdated(true);
        setTimeout(() => setJustUpdated(false), 3000);
      }
      prevSetAtRef.current = json.setAt;
    } catch {
      setError("Could not reach the server");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrent();
    const id = setInterval(fetchCurrent, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchCurrent]);

  return { data, loading, error, justUpdated, refetch: fetchCurrent };
};

const formatAge = (setAt: number): string => {
  const seconds = Math.floor((Date.now() - setAt) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
};

const SpotifyEmbed = ({ uri }: { uri: string }) => {
  const trackId = uri.replace("spotify:track:", "");
  return (
    <div className="rounded-2xl overflow-hidden animate-[fadeIn_0.5s_ease-out]">
      <iframe
        src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`}
        width="100%"
        height="152"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="rounded-xl"
      />
    </div>
  );
};

const Pulse = () => (
  <span className="relative inline-block w-2 h-2 rounded-full bg-success">
    <span className="absolute inset-[-4px] rounded-full border-2 border-success animate-ping" />
  </span>
);

export const VibeCarousel = () => {
  const { data, loading, error, justUpdated } = useCurrentSong();
  const [ageText, setAgeText] = useState("");

  useEffect(() => {
    if (!data?.setAt) return;
    const update = () => setAgeText(formatAge(data.setAt!));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [data?.setAt]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-4 py-12">
          <span className="loading loading-spinner loading-lg text-primary" />
          <p className="text-base-content/50 text-sm animate-pulse">
            Tuning in...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div role="alert" className="alert alert-error">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const isStale =
    data?.setAt != null && Date.now() - data.setAt > STALE_THRESHOLD_MS;
  const isEmpty = !data?.vibe && !data?.songUri;

  return (
    <div className="flex flex-col gap-6">
      <header className="text-center pb-4 border-b border-base-300">
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          &#9835; Monadic Melodies
        </h1>
      </header>

      {isEmpty ? (
        <div className="card bg-base-200 border border-dashed border-base-300 animate-[fadeIn_0.4s_ease-out]">
          <div className="card-body items-center text-center">
            <p className="text-base-content/50">
              No vibe set yet. Say something in the channel to set the mood!
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div
            className={`card bg-base-200 border border-primary/15 relative overflow-hidden animate-[fadeIn_0.4s_ease-out] ${
              justUpdated ? "animate-[vibePop_0.5s_ease-out]" : ""
            }`}
          >
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
            <div className="card-body items-center gap-3">
              <Pulse />
              <span className="text-xs uppercase tracking-widest text-base-content/40">
                Current Vibe
              </span>
              <span className="text-4xl font-extrabold tracking-tight bg-gradient-to-br from-white to-primary bg-clip-text text-transparent">
                {data?.vibe}
              </span>
            </div>
          </div>

          {isStale && (
            <div
              role="alert"
              className="alert alert-warning animate-[slideDown_0.4s_ease-out]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>
                This vibe is getting old ({ageText}). Write something in the
                channel to refresh it!
              </span>
            </div>
          )}

          {!isStale && data?.setAt && (
            <p className="text-center text-xs text-base-content/40 animate-[fadeIn_0.4s_ease-out]">
              Updated {ageText}
            </p>
          )}

          {data?.songUri && <SpotifyEmbed uri={data.songUri} />}

          {justUpdated && (
            <div className="toast toast-center toast-bottom z-50">
              <div className="alert alert-info shadow-lg">
                <span className="font-semibold">New vibe just dropped!</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
