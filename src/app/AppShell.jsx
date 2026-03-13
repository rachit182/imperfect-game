import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { GameContext } from "../features/game/state/GameContext";
import { initialState } from "../features/game/state/initialState";
import { useBackgroundMusic } from "../features/audio/useBackgroundMusic";
import { clearSlot, listSlots, loadSlot, saveSlot } from "../features/save/saveSlots";
import DashboardScreen from "../screens/DashboardScreen";
import EndScreen from "../screens/EndScreen";
import GameScreen from "../screens/GameScreen";
import StartScreen from "../screens/StartScreen";

function clone(obj) {
  return structuredClone(obj);
}

export default function AppShell() {
  const { state, hydrateState } = useContext(GameContext);
  const [screen, setScreen] = useState("start");
  const [activeSlotId, setActiveSlotId] = useState(null);
  const [paused, setPaused] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [slots, setSlots] = useState(() => listSlots());

  const prevDayRef = useRef(state.meta.day);
  const prevGameOverRef = useRef(state.meta.gameOver);

  const musicEnabled = useMemo(() => audioUnlocked, [audioUnlocked]);

  const { volume, setVolume } = useBackgroundMusic({
    unlocked: audioUnlocked,
    enabled: musicEnabled,
    initialVolume: 0.35
  });

  const refreshSlots = useCallback(() => {
    setSlots(listSlots());
  }, []);

  const handleStart = useCallback(() => {
    setAudioUnlocked(true);
    refreshSlots();
    setScreen("dashboard");
  }, [refreshSlots]);

  const handleSelectSlot = useCallback(
    (slotId) => {
      const loaded = loadSlot(slotId);

      if (loaded) {
        hydrateState(loaded);
        prevDayRef.current = loaded.meta.day;
        prevGameOverRef.current = loaded.meta.gameOver;
      } else {
        const fresh = clone(initialState);
        hydrateState(fresh);
        saveSlot(slotId, fresh);
        prevDayRef.current = fresh.meta.day;
        prevGameOverRef.current = fresh.meta.gameOver;
      }

      setActiveSlotId(slotId);
      setPaused(false);
      setScreen("game");
      refreshSlots();
    },
    [hydrateState, refreshSlots]
  );

  const handleReturnToDashboard = useCallback(() => {
    setPaused(false);
    setScreen("dashboard");
    setActiveSlotId(null);
    refreshSlots();
  }, [refreshSlots]);

  const handleBackToStart = useCallback(() => {
    setPaused(false);
    setScreen("start");
    setActiveSlotId(null);
  }, []);

  const handlePauseToggle = useCallback(() => {
    setPaused((prev) => !prev);
  }, []);

  const handleResumeGame = useCallback(() => {
    setPaused(false);
  }, []);

  const handleSaveAndQuit = useCallback(() => {
    if (activeSlotId) {
      saveSlot(activeSlotId, state);
    }
    setPaused(false);
    setScreen("dashboard");
    setActiveSlotId(null);
    refreshSlots();
  }, [activeSlotId, refreshSlots, state]);

  const handleDeleteSlot = useCallback(
    (slotId) => {
      clearSlot(slotId);
      if (activeSlotId === slotId) {
        setActiveSlotId(null);
      }
      refreshSlots();
    },
    [activeSlotId, refreshSlots]
  );

  useEffect(() => {
    if (screen === "game" && state.meta.gameOver) {
      setPaused(false);
      setScreen("end");
    }
  }, [screen, state.meta.gameOver]);

  useEffect(() => {
    if (!activeSlotId) return;

    const dayChanged = state.meta.day !== prevDayRef.current;
    const justGameOver = !prevGameOverRef.current && state.meta.gameOver;

    if (dayChanged || justGameOver) {
      saveSlot(activeSlotId, state);
      refreshSlots();
    }

    prevDayRef.current = state.meta.day;
    prevGameOverRef.current = state.meta.gameOver;
  }, [activeSlotId, refreshSlots, state]);

  if (screen === "start") {
    return <StartScreen onStart={handleStart} />;
  }

  if (screen === "dashboard") {
    return (
      <DashboardScreen
        slots={slots}
        onSelectSlot={handleSelectSlot}
        onDeleteSlot={handleDeleteSlot}
        onBackToStart={handleBackToStart}
        volume={volume}
        onVolumeChange={setVolume}
      />
    );
  }

  if (screen === "end") {
    return <EndScreen state={state} onReturnToDashboard={handleReturnToDashboard} />;
  }

  return (
    <GameScreen
      paused={paused}
      onPauseToggle={handlePauseToggle}
      onResume={handleResumeGame}
      onSaveAndQuit={handleSaveAndQuit}
      canSaveAndQuit={Boolean(activeSlotId)}
    />
  );
}
