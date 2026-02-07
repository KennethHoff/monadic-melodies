import { useEffect, useState, useCallback, useRef } from "react";

type SongData = {
  songUri: string | null;
  vibe: string | null;
  setAt: number | null;
  stale: boolean;
};

type HistoryEntry = {
  songUri: string;
  vibe: string;
  setAt: number;
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

const useVibeHistory = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/vibes/history");
      const json: HistoryEntry[] = await res.json();
      setHistory(json);
    } catch {
      // silently ignore history fetch errors
    }
  }, []);

  useEffect(() => {
    fetchHistory();
    const id = setInterval(fetchHistory, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchHistory]);

  return history;
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
    <div className="rounded-xl overflow-hidden animate-[fadeIn_0.5s_ease-out] border border-neon-purple/30 neon-border">
      <iframe
        src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`}
        width="100%"
        height="152"
        style={{ border: 0 }}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="rounded-xl"
      />
    </div>
  );
};

const Pulse = () => (
  <span className="relative inline-block w-2.5 h-2.5 rounded-full bg-neon-cyan">
    <span className="absolute inset-[-4px] rounded-full border-2 border-neon-cyan animate-ping opacity-60" />
  </span>
);

const RetroSun = () => (
  <div className="flex justify-center py-4">
    <div className="retro-sun w-16 h-16 rounded-full" />
  </div>
);

export const VibeCarousel = () => {
  const { data, loading, error, justUpdated } = useCurrentSong();
  const history = useVibeHistory();
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
        <div className="flex flex-col items-center gap-4 py-16">
          <div className="w-10 h-10 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
          <p className="neon-text-cyan text-sm font-mono tracking-widest animate-pulse">
            INITIALIZING...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div className="border border-neon-pink/50 neon-border-pink rounded-lg p-4 bg-neon-pink/5 animate-[fadeIn_0.4s_ease-out]">
          <p className="neon-text-pink font-mono text-sm">
            ERROR: {error}
          </p>
        </div>
      </div>
    );
  }

  const isStale =
    data?.setAt != null && Date.now() - data.setAt > STALE_THRESHOLD_MS;
  const isEmpty = !data?.vibe && !data?.songUri;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <header className="text-center pb-5 border-b border-neon-purple/20">
        <h1 className="text-3xl font-extrabold tracking-tight neon-text-cyan glitch-text font-mono">
          MONADIC MELODIES
        </h1>
        <p className="text-neon-purple/50 text-xs font-mono tracking-[0.3em] mt-1">
          HEXATHON VIBE SYSTEM v0.69
        </p>
      </header>

      {/* Empty state */}
      {isEmpty ? (
        <div className="animate-[fadeIn_0.4s_ease-out]">
          <RetroSun />
          <div className="border border-dashed border-neon-pink/30 rounded-lg bg-retro-card/80 p-8 text-center">
            <p className="neon-text-pink text-lg font-mono font-bold mb-2 animate-[flicker_3s_infinite]">
              NO SIGNAL
            </p>
            <p className="text-neon-cyan/60 font-mono text-sm leading-relaxed">
              Post a message in the Slack channel to activate the vibe analyzer
              and set the mood.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Current vibe card */}
          <div
            className={`rounded-lg border border-neon-purple/30 neon-border bg-retro-card/80 relative overflow-hidden animate-[fadeIn_0.4s_ease-out] ${
              justUpdated ? "animate-[vibePop_0.5s_ease-out]" : ""
            }`}
          >
            {/* Top neon stripe */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-neon-cyan to-transparent" />

            <div className="flex flex-col items-center gap-3 p-6">
              <div className="flex items-center gap-2">
                <Pulse />
                <span className="text-xs uppercase tracking-[0.3em] neon-text-cyan font-mono">
                  Current Vibe
                </span>
              </div>
              <span className="text-4xl font-extrabold tracking-tight neon-text-pink font-mono text-center">
                {data?.vibe}
              </span>
            </div>
          </div>

          {/* Stale warning */}
          {isStale && (
            <div className="border border-neon-yellow/40 rounded-lg bg-neon-yellow/5 p-3 animate-[slideDown_0.4s_ease-out]">
              <p className="text-neon-yellow font-mono text-sm text-center">
                <span className="animate-[flicker_2s_infinite] inline-block">
                  WARNING:
                </span>{" "}
                Vibe decaying ({ageText}). Post in the channel to refresh.
              </p>
            </div>
          )}

          {/* Age indicator */}
          {!isStale && data?.setAt && (
            <p className="text-center text-xs text-neon-purple/40 font-mono tracking-widest animate-[fadeIn_0.4s_ease-out]">
              SYNCED {ageText}
            </p>
          )}

          {/* Spotify player */}
          {data?.songUri && <SpotifyEmbed uri={data.songUri} />}

          {/* Toast */}
          {justUpdated && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
              <div className="border border-neon-cyan/50 neon-border-cyan rounded-lg bg-retro-card px-5 py-3 animate-[slideDown_0.3s_ease-out]">
                <span className="neon-text-cyan font-mono font-bold text-sm">
                  NEW VIBE DETECTED
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="animate-[fadeIn_0.4s_ease-out]">
          <h2 className="text-xs font-mono font-bold uppercase tracking-[0.3em] neon-text-purple mb-3">
            Vibe Log
          </h2>
          <ul className="flex flex-col gap-2">
            {history.map((entry) => (
              <li
                key={entry.setAt}
                className="rounded-lg bg-retro-card/60 border border-retro-border px-4 py-3 flex items-center gap-3"
              >
                <span className="text-neon-pink/80 font-mono font-bold text-sm flex-1">
                  {entry.vibe}
                </span>
                <span className="text-neon-purple/50 font-mono text-xs shrink-0">
                  {formatAge(entry.setAt)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
