import Phaser from "phaser";
import "./style.css";
import { Run, skins, prices, colors, powers } from "./model";
import { save, persist, equip, fresh } from "./save";
import { music, wake, sound } from "./audio";
import { paint, pickup } from "./art";
const overlay = document.querySelector<HTMLElement>("#overlay")!,
  hud = document.querySelector<HTMLElement>("#hud")!,
  world = document.querySelector<HTMLElement>("#world")!;
let mode = "home",
  back = "home",
  run = new Run(),
  tutorial = -1,
  caught = 0,
  record = false,
  credited = false,
  clock = 0;
const btn = (label: string, id: string, cls = "") =>
  '<button class="' + cls + '" data-id="' + id + '">' + label + "</button>";
const panel = (title: string, body: string) =>
  '<section class="panel"><h2>' + title + "</h2>" + body + "</section>";
const actions = ["Влево", "Вправо", "Прыжок", "Подкат"],
  keys = ["← / A", "→ / D", "↑ / W", "↓ / S"];
function screen(m: string) {
  mode = m;
  hud.hidden = m !== "run";
  overlay.innerHTML = "";
  const ret = btn("Назад", "back");
  if (m === "home") {
    overlay.innerHTML =
      '<section class="home"><div class="eyebrow">✦ ЛЕСНОЙ РАННЕР</div><h1>LUMBER <br>RUN</h1><h2>Побег из леса</h2><div class="stats"><span>Рекорд <b>' +
      save.best +
      "</b></span><span>Жёлуди <b>" +
      save.bank +
      "</b></span></div>" +
      btn("▶　Играть", "start", "primary") +
      '<div class="grid">' +
      btn("Магазин", "shop") +
      btn("Рекорды", "records") +
      btn("Настройки", "settings") +
      btn("Как играть", "help") +
      "</div></section>";
  }
  if (m === "pause")
    overlay.innerHTML = panel(
      "Пауза",
      btn("Продолжить", "resume", "primary") +
        btn("Заново", "restart") +
        btn("Настройки", "settings") +
        btn("В главное меню", "home"),
    );
  if (m === "end")
    overlay.innerHTML = panel(
      record ? "Новый рекорд!" : "Медведь догнал!",
      "<p>Очки <b>" +
        Math.floor(run.score) +
        "</b> · " +
        Math.floor(run.distance) +
        " м · " +
        run.coins +
        " желудей</p><p>Лучший результат · " +
        save.best +
        "</p>" +
        btn("Играть снова", "restart", "primary") +
        btn("В главное меню", "home"),
    );
  if (m === "shop")
    overlay.innerHTML = panel(
      "Магазин",
      "<p>Баланс · " +
        save.bank +
        " желудей</p>" +
        skins
          .map(
            (s, i) =>
              '<div class="line"><i class="swatch" style="background:' +
              colors[i] +
              '"></i><strong>' +
              s +
              '</strong><button data-id="skin' +
              i +
              '" ' +
              (save.skin === i ||
              (!save.owned.includes(i) && save.bank < prices[i])
                ? "disabled"
                : "") +
              ">" +
              (save.skin === i
                ? "Выбран"
                : save.owned.includes(i)
                  ? "Надеть"
                  : prices[i] + " 🌰") +
              "</button></div>",
          )
          .join("") +
        ret,
    );
  if (m === "records")
    overlay.innerHTML = panel(
      "Рекорды",
      [
        "Лучший счёт · " + save.best,
        "Дистанция · " + save.far + " м",
        "Забеги · " + save.runs,
        "Собрано желудей · " + save.total,
        "Пройдено препятствий · " + save.cleared,
        "Время в лесу · " + Math.floor(save.time) + " с",
      ]
        .map((s) => "<p>" + s + "</p>")
        .join("") + ret,
    );
  if (m === "help")
    overlay.innerHTML = panel(
      "Как играть",
      "<p>Стрелки или WASD управляют бегом. Пробел — прыжок, Esc — пауза. На телефоне проведи пальцем в нужную сторону.</p><p>Перепрыгивай пни, пригибайся под ветками. Обходи валуны, костры и берлоги. Жёлуди ведут по свободной дорожке.</p><p>После ошибки медведь приблизится. Продержись несколько секунд, чтобы оторваться.</p>" +
        btn("Пройти обучение", "train") +
        ret,
    );
  if (m === "settings")
    overlay.innerHTML = panel(
      "Настройки",
      (["music", "sfx"] as const)
        .map(
          (k, i) =>
            "<label>" +
            ["Музыка", "Эффекты"][i] +
            '<input type="range" min="0" max="1" step=".05" data-key="' +
            k +
            '" value="' +
            save[k] +
            '"></label>',
        )
        .join("") +
        (["mute", "detail", "shake", "fx"] as const)
          .map(
            (k, i) =>
              "<label>" +
              [
                "Без звука",
                "Детальная графика",
                "Тряска камеры",
                "Частицы и лучи",
              ][i] +
              '<input type="checkbox" data-key="' +
              k +
              '" ' +
              (save[k] ? "checked" : "") +
              "></label>",
          )
          .join("") +
        (document.fullscreenEnabled ? btn("Полный экран", "full") : "") +
        btn("Сброс прогресса", "reset") +
        ret,
    );
  if (m === "confirm")
    overlay.innerHTML = panel(
      "Сбросить прогресс?",
      "<p>Рекорды, жёлуди и облики будут удалены.</p>" +
        btn("Отмена", "settings") +
        btn("Сбросить", "erase"),
    );
  if (m === "run" && tutorial >= 0)
    overlay.innerHTML =
      '<div class="teach">' +
      actions[tutorial] +
      " · " +
      keys[tutorial] +
      " или свайп</div>";
}
function credit() {
  if (credited) return;
  credited = true;
  record = Math.floor(run.score) > save.best;
  save.best = Math.max(save.best, Math.floor(run.score));
  save.far = Math.max(save.far, Math.floor(run.distance));
  save.bank += run.coins;
  save.total += run.coins;
  save.runs++;
  save.time += run.time;
  save.cleared += run.cleared;
  persist();
}
function start(train = false) {
  if (mode === "pause") credit();
  run = new Run();
  caught = 0;
  credited = false;
  record = false;
  tutorial = train || !save.trained ? 0 : -1;
  screen("run");
}
overlay.onclick = (e) => {
  const id = (e.target as HTMLElement).closest("button")?.dataset.id;
  if (!id) return;
  wake();
  sound("ui");
  if (id === "start" || id === "restart" || id === "train")
    start(id === "train");
  else if (id === "resume") screen("run");
  else if (id === "home") {
    if (mode === "pause") credit();
    run = new Run();
    screen("home");
  } else if (id === "back") screen(mode === "settings" ? back : "home");
  else if (id.startsWith("skin")) {
    equip(Number(id.slice(4)));
    screen("shop");
  } else if (id === "full") {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen().catch(() => {});
  } else if (id === "reset") screen("confirm");
  else if (id === "erase") {
    Object.assign(save, fresh());
    persist();
    credited = true;
    run = new Run();
    screen("home");
  } else {
    if (id === "settings" && mode !== "confirm") back = mode;
    screen(id);
  }
};
overlay.oninput = (e) => {
  const el = e.target as HTMLInputElement;
  if (el.dataset.key) {
    Object.assign(save, {
      [el.dataset.key]: el.type === "checkbox" ? el.checked : Number(el.value),
    });
    persist();
  }
};
function action(k: number) {
  if (mode !== "run" || run.dead || (tutorial >= 0 && tutorial !== k)) return;
  run.action(k);
  if (k === 2) sound("jump");
  if (tutorial >= 0) {
    if (++tutorial === 4) {
      tutorial = -1;
      save.trained = true;
      persist();
    }
    screen("run");
  }
}
function pause() {
  if (mode === "pause") screen("run");
  else if (mode === "run" && !run.dead) screen("pause");
}
document.addEventListener("keydown", (e) => {
  if (e.code === "Escape" && !e.repeat) {
    pause();
    return;
  }
  if (mode !== "run") return;
  const k = [
    ["ArrowLeft", "KeyA"],
    ["ArrowRight", "KeyD"],
    ["ArrowUp", "KeyW", "Space"],
    ["ArrowDown", "KeyS"],
  ].findIndex((a) => a.includes(e.code));
  if (k >= 0) {
    e.preventDefault();
    if (!e.repeat) action(k);
  }
});
let sx = 0,
  sy = 0;
world.onpointerdown = (e) => {
  world.setPointerCapture(e.pointerId);
  sx = e.clientX;
  sy = e.clientY;
};
world.onpointerup = (e) => {
  const x = e.clientX - sx,
    y = e.clientY - sy;
  if (Math.max(Math.abs(x), Math.abs(y)) > 14)
    action(Math.abs(x) > Math.abs(y) ? Number(x > 0) : y < 0 ? 2 : 3);
};
document.addEventListener("visibilitychange", () => {
  if (document.hidden && mode === "run") pause();
});
window.addEventListener("pagehide", () => {
  if (run.time > 0 && !credited) credit();
});
const audio = document.querySelector<HTMLButtonElement>("#audio")!;
audio.onclick = () => {
  wake();
  save.mute = !save.mute;
  persist();
  audio.textContent = save.mute ? "♩" : "♫";
  sound("ui");
};
hud.innerHTML = btn("Ⅱ", "pause") + "<div><span></span><small></small></div>";
hud.querySelector("button")!.setAttribute("aria-label", "Пауза");
hud.onclick = pause;
class Forest extends Phaser.Scene {
  tex!: Phaser.Textures.CanvasTexture;
  img!: Phaser.GameObjects.Image;
  create() {
    this.tex = this.textures.createCanvas("forest", 480, 270)!;
    this.img = this.add.image(0, 0, "forest").setOrigin(0);
    screen("home");
  }
  update(time: number, delta: number) {
    const dt = Math.min(delta / 1000, 0.06),
      menu =
        !["run", "pause", "end"].includes(mode) &&
        !(mode === "settings" && back === "pause");
    if (menu || mode === "run") clock += dt;
    if (!document.hidden && (menu || mode === "run")) music(time / 1000, !menu);
    if (mode === "run") {
      if (run.dead) {
        caught += dt;
        if (caught > 1.15) {
          credit();
          if (record) sound("record");
          screen("end");
        }
      } else if (tutorial < 0)
        run.tick(dt, (s) => {
          sound(s);
          if (s === "coin" || s === "bonus") pickup();
          if (s === "hit" && save.shake) this.cameras.main.shake(140, 0.003);
        });
      else {
        run.x += (run.lane - run.x) * Math.min(1, dt * 10);
        run.jump = Math.max(0, run.jump - dt);
        run.slide = Math.max(0, run.slide - dt);
      }
      hud.querySelector("span")!.textContent =
        Math.floor(run.score) +
        " очк.　" +
        Math.floor(run.distance) +
        " м　🌰 " +
        run.coins;
      hud.querySelector("small")!.textContent =
        (run.danger > 0.78
          ? "Медведь близко!"
          : "След медведя " + Math.round(run.danger * 100) + "%") +
        "　" +
        run.effects
          .map((v, i) => (v ? powers[i] + " " + Math.ceil(v) + "с" : ""))
          .filter(Boolean)
          .join(" · ");
    }
    const W = this.scale.width,
      H = this.scale.height,
      h = 288,
      w = Math.max(100, Math.round((W / H) * h));
    if (!Number.isFinite(w)) return;
    if (this.tex.width !== w || this.tex.height !== h) {
      this.tex.setSize(w, h);
      this.img.setSize(w, h);
    }
    this.img.setDisplaySize(W, H);
    paint(this.tex.context, w, h, clock, run, menu, caught);
    this.tex.refresh();
  }
}
new Phaser.Game({
  type: Phaser.CANVAS,
  parent: world,
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: world.clientWidth,
    height: world.clientHeight,
  },
  pixelArt: true,
  audio: { noAudio: true },
  scene: Forest,
  banner: false,
});
