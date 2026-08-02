/**
 * usePlayback — Phase 9.4
 *
 * Generic step-player hook reused by both WorkspacePage (DSA) and
 * PythonWorkspacePage (code visualizer).
 *
 * Drives: Play/Pause, Step Forward, Step Backward, Restart, Speed, Seek.
 */

import { useCallback, useEffect, useRef, useState } from "react";

export interface UsePlaybackReturn {
  /** 0-based index of the currently displayed step. */
  index: number;
  /** Whether the player is currently auto-advancing. */
  playing: boolean;
  /** Speed 1–10 (matches the PlaybackBar slider). */
  speed: number;
  /** True when on the first step. */
  atStart: boolean;
  /** True when on the last step. */
  atEnd: boolean;
  /** True when there are no steps at all. */
  isEmpty: boolean;

  // Controls
  play: () => void;
  pause: () => void;
  toggle: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  restart: () => void;
  seek: (i: number) => void;
  setSpeed: (s: number) => void;
}

export function usePlayback(totalSteps: number): UsePlaybackReturn {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(5);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isEmpty = totalSteps === 0;
  const atStart = index === 0;
  const atEnd = index >= totalSteps - 1;

  // Auto-advance timer
  useEffect(() => {
    if (!playing) return;
    if (atEnd) { setPlaying(false); return; }

    const delay = 1050 - speed * 95; // matches WorkspacePage formula
    timerRef.current = setTimeout(
      () => setIndex((i) => Math.min(i + 1, totalSteps - 1)),
      delay,
    );
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [playing, index, speed, atEnd, totalSteps]);

  // Reset index when total steps shrinks (e.g. new code submitted)
  useEffect(() => {
    setIndex(0);
    setPlaying(false);
  }, [totalSteps]);

  const play = useCallback(() => { if (!isEmpty) setPlaying(true); }, [isEmpty]);
  const pause = useCallback(() => setPlaying(false), []);

  const toggle = useCallback(() => {
    if (isEmpty) return;
    if (atEnd) { setIndex(0); setPlaying(true); }
    else setPlaying((p) => !p);
  }, [isEmpty, atEnd]);

  const stepForward = useCallback(() => {
    setPlaying(false);
    setIndex((i) => Math.min(i + 1, totalSteps - 1));
  }, [totalSteps]);

  const stepBackward = useCallback(() => {
    setPlaying(false);
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  const restart = useCallback(() => {
    setPlaying(false);
    setIndex(0);
  }, []);

  const seek = useCallback((i: number) => {
    setPlaying(false);
    setIndex(Math.max(0, Math.min(i, totalSteps - 1)));
  }, [totalSteps]);

  const handleSetSpeed = useCallback((s: number) => setSpeed(s), []);

  return {
    index,
    playing,
    speed,
    atStart,
    atEnd,
    isEmpty,
    play,
    pause,
    toggle,
    stepForward,
    stepBackward,
    restart,
    seek,
    setSpeed: handleSetSpeed,
  };
}
