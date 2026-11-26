import { useCallback } from "react";
import { useSelector } from "react-redux";
import { selectMuted } from "../features/cafe/cafeSelectors.js";

// Sounds are made with the Web Audio API (no audio files).
let audio = null;
function getAudio() {
  if (!audio) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    audio = new AudioContext();
  }
  return audio;
}

// A short "mrrreow": the pitch slides up and down through a soft filter
function playMeow(pitch) {
  const ctx = getAudio();
  if (!ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  osc.type = "sawtooth";
  filter.type = "bandpass";
  filter.frequency.value = 1300;
  filter.Q.value = 1.8;
  osc.frequency.setValueAtTime(430 * pitch, t);
  osc.frequency.exponentialRampToValueAtTime(820 * pitch, t + 0.12);
  osc.frequency.exponentialRampToValueAtTime(360 * pitch, t + 0.45);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.22, t + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
  osc.connect(filter).connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.55);
}

function playBlip(from, to) {
  const ctx = getAudio();
  if (!ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(from, t);
  osc.frequency.exponentialRampToValueAtTime(to, t + 0.12);
  gain.gain.setValueAtTime(0.15, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.22);
}

/** meow(catId) — every cat has its own voice; coin() — a happy shop sound. */
export function useSound() {
  const muted = useSelector(selectMuted);

  const meow = useCallback(
    (catId = 1) => {
      if (!muted) playMeow(0.85 + ((catId * 37) % 40) / 100);
    },
    [muted],
  );
  const coin = useCallback(() => {
    if (!muted) playBlip(880, 1500);
  }, [muted]);
  const nope = useCallback(() => {
    if (!muted) playBlip(300, 180);
  }, [muted]);

  return { meow, coin, nope };
}
