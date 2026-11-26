export const tuning = {
  start: 13,
  max: 27,
  ramp: 420,
  first: 30,
  gap: 1.7,
  minGap: 1.12,
  change: 7,
  jump: 0.85,
  slide: 0.8,
};
export const hazards = [
  "Камни",
  "Валун",
  "Пень",
  "Бревно",
  "Ветка",
  "Костёр",
  "Берлога",
  "Яма",
  "Грязь",
  "Куст",
  "Изгородь",
  "Арка",
];
export const powers = ["Магнит", "Щит", "Ускорение", "×2", "Приманка"];
export const skins = [
  "Классический",
  "Лесник",
  "Охотник",
  "Зимний",
  "Золотой",
  "Костюм медведя",
];
export const prices = [0, 20, 45, 75, 120, 180];
export const colors = [
  "#d44c39",
  "#478654",
  "#b66d37",
  "#64bacc",
  "#edab36",
  "#825138",
];
export type Item = { z: number; lane: number; kind: number };
export function row(distance: number, speed: number, rng = Math.random) {
  const lanes = [-1, 0, 1],
    safe = lanes.splice(Math.floor(rng() * 3), 1)[0];
  const items: Item[] = [];
  if (rng() < 0.5) lanes.reverse();
  const count = distance > 160 && rng() < 0.65 ? 2 : 1;
  for (const lane of lanes.slice(0, count))
    items.push({ lane, z: 85, kind: Math.floor(rng() * 12) });
  for (let i = 0; i < 3; i++)
    items.push({
      lane: safe,
      z: 85 + i * 2.2,
      kind: i === 2 && rng() < 0.16 ? 13 + Math.floor(rng() * 5) : 12,
    });
  // Allow two complete lane changes plus a recovery margin at every speed.
  const gap =
    speed *
    Math.max(
      2 / tuning.change + 0.65,
      tuning.minGap,
      tuning.gap - distance / 2500,
    );
  return { items, gap };
}
export class Run {
  distance = 0;
  score = 0;
  coins = 0;
  time = 0;
  cleared = 0;
  x = 0;
  lane = 0;
  jump = 0;
  slide = 0;
  danger = 0.65;
  immune = 0;
  dead = false;
  next = 0;
  effects = [0, 0, 0, 0, 0];
  items: Item[] = [];
  action(k: number) {
    if (k < 2) this.lane = Math.max(-1, Math.min(1, this.lane + (k ? 1 : -1)));
    else if (!this.jump && !this.slide) {
      if (k === 2) this.jump = tuning.jump;
      else this.slide = tuning.slide;
    }
  }
  get height() {
    return Math.sin((Math.PI * this.jump) / tuning.jump);
  }
  tick(dt: number, event: (s: string) => void) {
    if (this.dead) return;
    this.time += dt;
    const speed =
        Math.min(tuning.max, tuning.start + this.distance / tuning.ramp) *
        (this.effects[2] ? 1.25 : 1),
      step = speed * dt;
    this.distance += step;
    this.score += step * (this.effects[3] ? 2 : 1);
    this.next -= step;
    if (this.next <= 0) {
      const r = row(this.distance, speed);
      this.items.push(...r.items);
      this.next += r.gap;
    }
    this.x +=
      Math.sign(this.lane - this.x) *
      Math.min(Math.abs(this.lane - this.x), dt * tuning.change);
    this.jump = Math.max(0, this.jump - dt);
    this.slide = Math.max(0, this.slide - dt);
    this.immune = Math.max(0, this.immune - dt);
    this.danger = Math.max(0.06, this.danger - dt * 0.037);
    this.effects = this.effects.map((v) => Math.max(0, v - dt));
    for (const o of this.items) {
      const old = o.z;
      o.z -= step;
      if (old <= 0 || o.z > 0) continue;
      const same = Math.abs(o.lane - this.x) < 0.55;
      if (o.kind === 12) {
        if (same || this.effects[0]) {
          this.coins++;
          this.score += 10 * (this.effects[3] ? 2 : 1);
          event("coin");
        }
        continue;
      }
      if (o.kind > 12) {
        if (same) {
          const i = o.kind - 13;
          this.effects[i] = [9, 15, 5, 9, 5][i];
          if (i === 4) this.danger = 0.06;
          event("bonus");
        }
        continue;
      }
      if (
        !same ||
        this.immune ||
        this.effects[2] ||
        ([4, 11].includes(o.kind) && this.slide > 0) ||
        ([0, 2, 3, 7, 8, 10].includes(o.kind) && this.height > 0.33)
      ) {
        this.cleared++;
        continue;
      }
      if (this.effects[1]) {
        this.effects[1] = 0;
        this.immune = 1;
        event("shield");
        continue;
      }
      if (this.danger > 0.78 || [1, 5, 6].includes(o.kind)) {
        this.dead = true;
        event("catch");
        break;
      }
      this.danger = 1;
      this.immune = 1.2;
      event("hit");
    }
    this.items = this.items.filter((o) => o.z > 0);
  }
}
