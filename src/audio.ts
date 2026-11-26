import { save } from "./save";
let ctx: AudioContext | undefined,
  beat = 0,
  next = 0;
export function wake() {
  try {
    ctx ??= new AudioContext();
    void ctx.resume();
  } catch {}
}
function tone(
  f: number,
  t: number,
  v: number,
  w: OscillatorType = "triangle",
  end = f,
) {
  if (!ctx || save.mute || !v || ctx.state !== "running") return;
  const o = ctx.createOscillator(),
    g = ctx.createGain(),
    n = ctx.currentTime;
  o.type = w;
  o.frequency.setValueAtTime(f, n);
  o.frequency.exponentialRampToValueAtTime(end, n + t);
  g.gain.setValueAtTime(v * 0.09, n);
  g.gain.exponentialRampToValueAtTime(0.0001, n + t);
  o.connect(g);
  g.connect(ctx.destination);
  o.start(n);
  o.stop(n + t);
}
export function sound(name: string) {
  const notes: Record<string, number[]> = {
    coin: [660, 1320],
    jump: [180, 420],
    hit: [120, 45],
    catch: [95, 32],
    bonus: [440, 990],
    record: [523, 1568],
    ui: [320, 480],
    shield: [720, 220],
  };
  const [a, b] = notes[name] || notes.ui;
  tone(a, 0.22, save.sfx, name === "catch" ? "sawtooth" : "triangle", b);
}
export function music(t: number, run: boolean) {
  if (t < next) return;
  next = t + (run ? 0.26 : 0.47);
  tone(
    [196, 294, 392, 330, 220, 330, 440, 294][beat % 8],
    0.28,
    save.music * 0.6,
  );
  if (run && beat % 2 === 0) tone(64, 0.06, save.sfx * 0.45, "sine", 36);
  if (beat++ % 17 === 0) tone(1400, 0.12, save.sfx * 0.22, "sine", 2200);
}
