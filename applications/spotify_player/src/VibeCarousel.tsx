import { useEffect, useMemo, useState } from "react";

type Vibe = string;

const AVAILABLE_VIBES: Vibe[] = [
  "Chill",
  "Hype",
  "Focus",
  "Late Night",
  "Lo-fi",
  "Groovy",
  "Melancholy",
  "Sunny",
];

const pickRandom = <T,>(items: T[]): T | undefined => {
  if (items.length === 0) return undefined;
  return items[Math.floor(Math.random() * items.length)];
};

const useVibes = () => {
  const vibes = useMemo(() => AVAILABLE_VIBES, []);
  const [vibeHistory, setVibeHistory] = useState<Vibe[]>(() => {
    const initialVibe = pickRandom(vibes);
    return initialVibe ? [initialVibe] : [];
  });

  useEffect(() => {
    if (vibes.length === 0) return;

    const intervalId = window.setInterval(() => {
      setVibeHistory((previousHistory) => {
        const previousVibe = previousHistory[0];
        if (vibes.length <= 1) return previousHistory;

        let nextVibe = pickRandom(vibes);
        while (nextVibe === previousVibe) {
          nextVibe = pickRandom(vibes);
        }

        return [nextVibe as Vibe, ...previousHistory].slice(0, 5);
      });
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [vibes]);

  return vibeHistory;
};

export const VibeCarousel = () => {
  const history = useVibes();
  return (
    <div className="">
      {history.map((x, index) => {
        return <span style={{
                marginRight: index * 200,
                transition: 'all 0.5s'
        }}>{x}</span>
      })}
    </div>
  );
  // return (
  //         <>
  //                 <div>{history.at(0)}</div>
  //                 <ul>
  //                         {history.map((vibe, index) => (
  //                                 <li key={`${vibe}-${index}`}>{vibe}</li>
  //                         ))}
  //                 </ul>
  //         </>
  // );
};
