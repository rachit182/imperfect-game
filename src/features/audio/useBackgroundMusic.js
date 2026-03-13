import { useEffect, useMemo, useState } from "react";
import bgMusicUrl from "../../assets/audio/imperfect-bg-music.wav";

let sharedAudio = null;

function getAudio() {
  if (typeof window === "undefined") return null;
  if (!sharedAudio) {
    sharedAudio = new Audio(bgMusicUrl);
    sharedAudio.loop = true;
    sharedAudio.preload = "auto";
  }
  return sharedAudio;
}

export function useBackgroundMusic({ unlocked, enabled, initialVolume = 0.35 }) {
  const [volume, setVolume] = useState(initialVolume);
  const audio = useMemo(() => getAudio(), []);

  useEffect(() => {
    if (!audio) return;
    audio.volume = volume;
  }, [audio, volume]);

  useEffect(() => {
    if (!audio) return;

    if (!unlocked || !enabled) {
      audio.pause();
      return;
    }

    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }

    return () => {
      if (!enabled) audio.pause();
    };
  }, [audio, unlocked, enabled]);

  return {
    volume,
    setVolume
  };
}
