import { prices } from "./model";
export const fresh = () => ({
  version: 1,
  best: 0,
  far: 0,
  runs: 0,
  total: 0,
  bank: 0,
  cleared: 0,
  time: 0,
  skin: 0,
  owned: [0],
  trained: false,
  mute: false,
  music: 0.35,
  sfx: 0.65,
  shake: true,
  fx: true,
  detail: true,
});
export function read(raw: string | null) {
  const d = fresh();
  try {
    const v = JSON.parse(raw || "null");
    if (v?.version !== 1) return d;
    for (const key of Object.keys(d) as (keyof typeof d)[]) {
      const val = v[key];
      if (
        (typeof d[key] === "boolean" && typeof val === "boolean") ||
        (typeof d[key] === "number" && Number.isFinite(val) && val >= 0)
      )
        Object.assign(d, { [key]: val });
    }
    d.owned = [
      ...new Set<number>([
        0,
        ...(Array.isArray(v.owned) ? v.owned : []).filter(
          (i: number) => Number.isInteger(i) && i >= 0 && i < prices.length,
        ),
      ]),
    ];
    if (!d.owned.includes(d.skin)) d.skin = 0;
    d.music = Math.min(1, d.music);
    d.sfx = Math.min(1, d.sfx);
  } catch {}
  return d;
}
export const key = "lumber-run-v1";
export function load() {
  try {
    return read(localStorage.getItem(key));
  } catch {
    return fresh();
  }
}
export const save = load();
export function persist() {
  try {
    localStorage.setItem(key, JSON.stringify(save));
  } catch {}
}
export function equip(i: number) {
  if (!save.owned.includes(i)) {
    if (save.bank < prices[i]) return;
    save.bank -= prices[i];
    save.owned.push(i);
  }
  save.skin = i;
  persist();
}
