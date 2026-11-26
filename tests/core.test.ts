import test from "node:test";
import assert from "node:assert/strict";
import { Run, row, tuning } from "../src/model";
import { read, equip, save, fresh } from "../src/save";
test("10 000 рядов оставляют достижимую свободную полосу", () => {
  for (let i = 0; i < 10000; i++) {
    const { items, gap } = row(i, 34);
    const free = items.find((o) => o.kind === 12)!.lane;
    assert.ok(items.every((o) => o.kind >= 12 || o.lane !== free));
    assert.ok(gap / 34 > 2 / tuning.change + 0.8);
  }
});
function contact(r: Run, kind: number, lane = 0) {
  r.items = [{ kind, lane, z: 0.01 }];
  r.next = 88;
  r.tick(0.016, () => {});
}
test("погоня, защита после удара, поимка", () => {
  const r = new Run();
  contact(r, 2);
  assert.equal(r.danger, 1);
  contact(r, 2);
  assert.equal(r.dead, false);
  r.immune = 0;
  contact(r, 2);
  assert.equal(r.dead, true);
});
test("прыжок, подкат и смена полосы", () => {
  const r = new Run();
  r.jump = 0.45;
  contact(r, 3);
  r.slide = 0.4;
  contact(r, 11);
  r.action(0);
  for (let i = 0; i < 15; i++) r.tick(0.016, () => {});
  contact(r, 1);
  assert.equal(r.dead, false);
  assert.equal(r.cleared, 3);
});
test("все усиления", () => {
  const r = new Run();
  contact(r, 13);
  contact(r, 12, -1);
  assert.equal(r.coins, 1);
  contact(r, 14);
  contact(r, 1);
  assert.equal(r.effects[1], 0);
  r.immune = 0;
  contact(r, 15);
  contact(r, 1);
  assert.equal(r.dead, false);
  contact(r, 16);
  const before = r.score;
  contact(r, 12);
  assert.ok(r.score - before >= 20);
  contact(r, 17);
  assert.ok(r.danger < 0.1);
});
test("сохранение и покупки", () => {
  assert.deepEqual(read("{"), fresh());
  assert.equal(read('{"version":1,"owned":{},"skin":99}').skin, 0);
  Object.assign(save, fresh(), { bank: 20 });
  equip(1);
  equip(1);
  equip(5);
  assert.equal(save.skin, 1);
  assert.equal(save.bank, 0);
  assert.deepEqual(read(JSON.stringify(save)), save);
});
