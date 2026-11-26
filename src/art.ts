import { Run, colors } from "./model";
import { save } from "./save";
type C = CanvasRenderingContext2D;
function box(c: C, x: number, y: number, w: number, h: number, color: string) {
  c.fillStyle = color;
  c.fillRect(Math.round(x), Math.round(y), w, h);
}
function poly(c: C, color: string, ...pts: number[]) {
  c.fillStyle = color;
  c.beginPath();
  c.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
  c.closePath();
  c.fill();
}
function oval(c: C, x: number, y: number, w: number, h: number, col: string) {
  c.fillStyle = col;
  c.beginPath();
  c.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
  c.fill();
}
let sparkle = 0;
export function pickup() {
  sparkle = 1;
}
const sprites: Record<string, HTMLCanvasElement> = {};
function sprite(id: string, w: number, h: number, paint: (c: C) => void) {
  if (!sprites[id]) {
    const s = document.createElement("canvas");
    s.width = w;
    s.height = h;
    paint(s.getContext("2d")!);
    sprites[id] = s;
  }
  return sprites[id];
}
function tree(seed: number, gold: boolean) {
  return sprite("tree" + seed + gold, 48, 84, (c) => {
    const dark = gold ? "#774339" : "#163f38",
      mid = gold ? "#ba673e" : "#286046",
      light = gold ? "#e6a247" : "#458456";
    box(c, 22, 43, 6, 40, "#523f32");
    box(c, 23, 50, 2, 32, "#956747");
    if (seed % 4 === 0) {
      for (const [x, y, r] of [
        [22, 23, 18],
        [13, 36, 12],
        [33, 37, 14],
        [22, 44, 14],
      ]) {
        oval(c, x, y, r, r, dark);
        oval(c, x - 2, y - 4, r - 2, r - 3, mid);
        oval(c, x - 5, y - 8, r / 2, r / 2, light);
      }
    } else {
      for (let i = 0; i < 4; i++) {
        const y = i * 12 + 2,
          r = 8 + i * 4;
        poly(
          c,
          dark,
          24,
          y,
          24 + r,
          y + 26,
          30,
          y + 24,
          33,
          y + 28,
          21,
          y + 25,
          17,
          y + 29,
          14,
          y + 25,
          24 - r,
          y + 27,
        );
        poly(c, mid, 23, y, 25, y + 12, 20, y + 13, 22, y + 16, 24 - r, y + 24);
        poly(c, light, 23, y + 2, 21, y + 11, 17, y + 14);
      }
    }
  });
}
export function hero(
  c: C,
  x: number,
  y: number,
  scale: number,
  frame: number,
  skin: number,
  front = false,
  slide = false,
  tilt = 0,
) {
  c.save();
  c.translate(x, y);
  c.rotate(tilt);
  c.scale(scale, scale * (slide ? 0.54 : 1));
  const shirt = colors[skin],
    step = Math.sin(frame) > 0 ? 2 : -2;
  const b = (x: number, y: number, w: number, h: number, col: string) =>
    box(c, x, y, w, h, col);
  for (const side of [-1, 1]) {
    const leg = side < 0 ? -7 : 1,
      dy = front ? 0 : step * side;
    b(leg, -12, 6, 10 + dy, "#344953");
    b(leg, -5 + dy, 8, 5, "#392f2a");
    b(leg, -2 + dy, 8, 2, "#735544");
  }
  b(-9, -25, 18, 15, "#512f2d");
  b(-8, -25, 16, 13, shirt);
  for (const xx of [-6, 1, 6]) b(xx, -25, 2, 13, "#0004");
  for (const yy of [-22, -16]) b(-8, yy, 16, 2, "#0004");
  for (const s of [-1, 1]) {
    const xx = s < 0 ? -12 : 8,
      dy = front ? 0 : -s * step;
    b(xx, -24 + dy, 5, 9, shirt);
    b(xx, -16 + dy, 5, 4, "#e6a476");
  }
  b(-8, -13, 16, 3, "#553b2c");
  b(-2, -13, 4, 2, "#eabd61");
  b(-7, -36, 14, 11, "#925937");
  b(-8, -33, 3, 5, "#efb184");
  b(6, -33, 3, 5, "#efb184");
  if (front) {
    b(-6, -34, 12, 5, "#f1bb86");
    b(-4, -33, 2, 2, "#303735");
    b(3, -33, 2, 2, "#303735");
    b(-2, -30, 5, 3, "#e29c6b");
    b(-5, -26, 10, 2, "#68422c");
  }
  b(-7, -41, 13, 7, skin === 5 ? "#74462f" : shirt);
  b(-9, -36, 17, 3, "#573b30");
  b(-5, -40, 8, 2, "#fff3");
  if (skin === 5) {
    b(-9, -42, 4, 5, "#75462f");
    b(4, -42, 4, 5, "#75462f");
  }
  if (!front) {
    poly(c, "#a97a4a", -7, -12, -5, -11, 9, -30, 7, -32);
    poly(c, "#b9cebf", 5, -32, 9, -34, 15, -30, 12, -26, 9, -28);
  }
  c.restore();
}
function bear(c: C, x: number, y: number, s: number, t: number, roar: boolean) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  const brown = "#825235",
    dark = "#513c30";
  for (const a of [-1, 1]) {
    oval(c, a * 8, -4 + Math.sin(t) * a * 2, 5, 6, dark);
    oval(c, a * 13, -15 + Math.cos(t) * a * 2, 5, 9, brown);
  }
  oval(c, 0, -17, 14, 16, dark);
  oval(c, -1, -19, 12, 14, brown);
  oval(c, -8, -36, 5, 5, dark);
  oval(c, 8, -36, 5, 5, dark);
  oval(c, 0, -29, 13, 11, brown);
  oval(c, 0, -25, 8, 5, "#c39761");
  box(c, -3, -28, 6, 3, dark);
  box(c, -7, -32, 3, 2, "#251f24");
  box(c, 4, -32, 3, 2, "#251f24");
  if (roar) oval(c, 0, -22, 4, 3, "#402b29");
  c.restore();
}
const sky = ["#95d0c6", "#61998d", "#e5bd88", "#9dbfc4", "#424f75"],
  land = ["#568754", "#365d47", "#af854d", "#637f70", "#354f55"];
function blend(a: string, b: string, v: number) {
  const rgb = [1, 3, 5].map((i) =>
    Math.round(
      parseInt(a.slice(i, i + 2), 16) * (1 - v) +
        parseInt(b.slice(i, i + 2), 16) * v,
    ),
  );
  return "rgb(" + rgb.join(",") + ")";
}
function obstacle(c: C, k: number, t: number) {
  const b = (x: number, y: number, w: number, h: number, col: string) =>
    box(c, x, y, w, h, col);
  if (k === 12) {
    oval(c, 0, -7, 5, 6, "#ba7325");
    oval(c, -1, -8, 4, 5, "#ffca50");
    b(-5, -13, 10, 3, "#8b572f");
    b(1, -16, 2, 3, "#79532e");
    b(-3, -10, 2, 3, "#fff1a1");
    return;
  }
  if (k > 12) {
    oval(
      c,
      0,
      -10,
      9,
      9,
      ["#a65455", "#4595aa", "#d2853a", "#8e639c", "#7c9851"][k - 13],
    );
    c.fillStyle = "#fff3bc";
    c.font = "bold 11px monospace";
    c.textAlign = "center";
    c.fillText(["∩", "◆", "ϟ", "×2", "♪"][k - 13], 0, -6);
    return;
  }
  if (k === 0 || k === 1) {
    const s = k ? 1.5 : 0.65;
    c.scale(s, s);
    poly(
      c,
      "#55635b",
      -12,
      0,
      -14,
      -6,
      -8,
      -16,
      1,
      -20,
      10,
      -15,
      15,
      -4,
      11,
      0,
    );
    poly(c, "#93a399", -13, -6, -7, -15, 1, -18, 6, -14, -1, -9);
    return;
  }
  if (k === 2 || k === 3) {
    const w = k === 2 ? 9 : 20,
      h = k === 2 ? 14 : 9;
    b(-w, -h, w * 2, h, "#785034");
    b(-w + 2, -h + 3, w, 2, "#a87747");
    oval(
      c,
      k === 2 ? 0 : w - 3,
      -h + 2,
      k === 2 ? w : 4,
      k === 2 ? 3 : 6,
      "#deb779",
    );
    return;
  }
  if (k === 4 || k === 11 || k === 10) {
    const h = k === 10 ? 13 : 35;
    b(-16, -h, 4, h, "#6c5038");
    if (k !== 4) b(13, -h, 4, h, "#775238");
    b(-17, -h, 35, 5, "#9c7045");
    b(-12, -h, 22, 2, "#c69b62");
    if (k !== 10) oval(c, 6, -h, 9, 3, "#4a7747");
    return;
  }
  if (k === 5) {
    b(-10, -3, 20, 3, "#573c2f");
    poly(
      c,
      "#e66831",
      -9,
      -3,
      -8,
      -18,
      -3,
      -12,
      1,
      -25 + Math.sin(t) * 4,
      9,
      -8,
      7,
      -2,
    );
    poly(c, "#ffd55d", -4, -3, 1, -15, 5, -3);
    return;
  }
  if (k === 6 || k === 9) {
    oval(c, 0, -7, 16, 12, k === 6 ? "#73583c" : "#406a3d");
    oval(c, -4, -10, 9, 8, k === 6 ? "#8d734e" : "#69954e");
    if (k === 6) oval(c, 1, -4, 7, 7, "#352e29");
    return;
  }
  oval(c, 0, -2, 17, 5, k === 7 ? "#674e39" : "#ae875b");
  oval(c, 0, -2, 13, 3, k === 7 ? "#3c3630" : "#7d6145");
}
export function paint(
  c: C,
  w: number,
  h: number,
  t: number,
  r: Run,
  menu: boolean,
  catchTime: number,
) {
  const d = menu ? t * 1.8 : r.distance,
    hz = h * 0.33,
    center = w * (menu && w > h ? 0.68 : 0.5),
    road = Math.min(w * 0.44, h * 0.55),
    id = Math.floor(d / 500) % 5,
    f = Math.min(1, Math.max(0, ((d % 500) - 420) / 80));
  c.imageSmoothingEnabled = false;
  box(c, 0, 0, w, h, blend(sky[id], sky[(id + 1) % 5], f));
  oval(c, w * 0.76, h * 0.13, 16, 16, "#f4eab2");
  for (let j = 0; j < 3; j++) {
    const pts = [-50, hz + 12];
    for (let i = -2; i <= w / 6 + 3; i++) {
      const a = i + Math.floor(d / (70 - j * 15));
      pts.push(
        i * 6 - ((d / (70 - j * 15)) % 1) * 6,
        hz -
          9 -
          j * 4 -
          (2 - j) * 9 -
          Math.abs(Math.sin(a * 0.13 + j) * Math.cos(a * 0.06)) * 32 -
          (j === 2 ? Math.abs(Math.sin(a * 4)) * 10 : 0),
      );
    }
    pts.push(w + 30, hz + 20);
    poly(c, ["#92b6a2", "#799e87", "#497a63"][j], ...pts);
  }
  box(c, 0, hz, w, h, blend(land[id], land[(id + 1) % 5], f));
  poly(
    c,
    "#82b7ae",
    center + 3,
    hz,
    center + road * 0.9,
    h * 0.55,
    center + road * 1.24,
    h * 0.66,
    w,
    h * 0.74,
    w,
    h * 0.8,
    center + road * 1.15,
    h * 0.7,
    center + road * 0.82,
    h * 0.57,
  );
  const project = (z: number) => 14 / (14 + z);
  const at = (p: number) => hz + (h * 0.81 - hz) * p;
  poly(
    c,
    "#957349",
    center - 2,
    hz,
    center + 2,
    hz,
    center + road * 1.53,
    h,
    center - road * 1.53,
    h,
  );
  poly(
    c,
    "#cfaa72",
    center,
    hz,
    center + road * 1.44,
    h,
    center - road * 1.44,
    h,
  );
  for (let i = 0; i < 46; i++) {
    const z = ((i * 3.2 + 147.2 - (d % 147.2)) % 147.2) - 3,
      p = project(z),
      y = at(p),
      side = i % 2 ? 1 : -1;
    box(
      c,
      center + side * road * p * (0.12 + ((i * 17) % 72) / 100),
      y,
      Math.max(1, 7 * p),
      Math.max(1, p * 2),
      "#b68d5c",
    );
  }
  const trees = [];
  for (let i = 0; i < (save.detail ? 100 : 55); i++) {
    const z = ((i * 3.17 + 317 - (d % 317)) % 317) - 5;
    trees.push({ z, i });
  }
  for (const { z, i } of trees.sort((a, b) => b.z - a.z)) {
    const p = project(z),
      s = (p * h) / 145,
      x = center + (i % 2 ? 1 : -1) * road * p * (1.14 + ((i * 13) % 17) / 9),
      y = at(p);
    c.drawImage(tree(i % 7, id === 2), x - 24 * s, y - 80 * s, 48 * s, 84 * s);
    if (i % 5 === 0) {
      box(c, x - 7 * s, y, 2 * s, 4 * s, "#f4d799");
      box(c, x - 9 * s, y - s, 6 * s, 2 * s, i % 3 ? "#eb7850" : "#eec56a");
    }
    if (i % 17 === 0) {
      box(c, x + 5 * s, y - 14 * s, 15 * s, 14 * s, "#ad7950");
      poly(
        c,
        "#644334",
        x + s,
        y - 13 * s,
        x + 12 * s,
        y - 24 * s,
        x + 24 * s,
        y - 13 * s,
      );
      box(c, x + 10 * s, y - 7 * s, 4 * s, 7 * s, "#453830");
    }
    if (i % 13 === 0) {
      box(c, x - 13 * s, y - 14 * s, 2 * s, 14 * s, "#674c36");
      box(c, x - 18 * s, y - 15 * s, 12 * s, 4 * s, "#cc9b63");
    }
  }
  if (save.fx) {
    for (let i = 0; i < 4; i++)
      poly(
        c,
        "#fff3ad13",
        w * (0.2 + i * 0.23),
        0,
        w * (0.23 + i * 0.23),
        0,
        w * (i * 0.23 - 0.1),
        h,
        w * (i * 0.23 - 0.22),
        h,
      );
    for (let i = 0; i < 12; i++)
      box(
        c,
        (i * 79 + t * (3 + (i % 4))) % w,
        (i * 37 + t * (2 + (i % 3))) % h,
        2,
        1,
        i % 2 ? "#e4bd76" : "#eae7ae",
      );
  }
  if (save.fx) {
    for (let i = 0; i < 3; i++) {
      const x = (w + i * 21 - ((t * 4) % w)) % w,
        y = h * 0.16 + Math.sin(t + i) * 3;
      poly(c, "#42685b", x - 4, y - 2, x, y, x + 4, y - 2, x, y + 2);
    }
    const x = w * 0.82 + Math.sin(t) * 8,
      y = h * 0.69 + Math.cos(t * 2) * 5;
    box(c, x - 3, y, 2, 3, "#ffcf64");
    box(c, x, y - 1, 2, 3, "#e79751");
  }
  const s = h / (menu ? 135 : 190),
    xx = center + r.x * road * 0.61,
    yy = at(1),
    jump = r.height * h * 0.17;
  for (const o of [...r.items].sort((a, b) => b.z - a.z)) {
    const p = project(o.z),
      pull = o.kind === 12 && r.effects[0] ? Math.max(0, 1 - o.z / 12) : 0;
    c.save();
    c.translate(
      center + (o.lane + (r.x - o.lane) * pull) * road * 0.61 * p,
      at(p) + (o.kind >= 12 ? Math.sin(t * 4 + o.z) * 1.5 * p : 0),
    );
    c.scale(p * s, p * s);
    obstacle(c, o.kind, t * 8);
    c.restore();
  }
  if (menu) {
    const feet = w < h ? h * 0.51 : yy,
      scale = w < h ? s * 0.78 : s;
    bear(c, center + road * 0.48, feet - h * 0.09, scale * 0.8, t * 4, false);
    hero(c, center, feet + Math.sin(t * 2), scale, t, save.skin, true);
    return;
  }
  oval(c, xx, yy, 11 * s * (1 - 0.45 * r.height), 3 * s, "#694f3659");
  if (save.fx)
    for (let i = 0; i < 4; i++) {
      const f = (t * 2 + i * 0.25) % 1;
      box(c, xx + Math.sin(i * 7) * s * f * 12, yy + f * 6, s, s, "#e7cb99");
    }
  if (save.fx && sparkle > 0) {
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      box(
        c,
        xx + Math.cos(a) * s * (1 - sparkle) * 23,
        yy - 18 * s + Math.sin(a) * s * (1 - sparkle) * 23,
        2 * s,
        s,
        "#ffe98d",
      );
    }
    sparkle = Math.max(0, sparkle - 0.045);
  }
  if (save.fx && r.effects[2])
    for (let i = 0; i < 8; i++) {
      const y = (t * 100 + i * 27) % h;
      box(c, i % 2 ? w - 9 - i : 6 + i, y, 1, 8, "#fff2bb");
    }
  if (r.effects.some((v) => v > 0)) {
    c.strokeStyle = "#fff4a8";
    c.beginPath();
    c.ellipse(xx, yy - jump - 17 * s, 18 * s, 24 * s, 0, 0, 7);
    c.stroke();
  }
  hero(
    c,
    xx,
    yy - jump,
    s,
    t * 13,
    save.skin,
    false,
    r.slide > 0,
    catchTime
      ? Math.min(1, catchTime) * 1.25
      : r.immune
        ? Math.sin(t * 24) * 0.16
        : (r.lane - r.x) * 0.18,
  );
  bear(
    c,
    xx + Math.sin(t * 6) * s,
    yy + h * (0.4 - 0.21 * r.danger) - Math.min(1, catchTime) * h * 0.18,
    s * 1.12,
    t * 12,
    r.danger > 0.77 || catchTime > 0,
  );
}
