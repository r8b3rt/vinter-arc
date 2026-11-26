import { test, expect } from "@playwright/test";
for (const mobile of [false, true])
  test(
    mobile ? "Свайпы и мобильное меню" : "Клавиатура и меню",
    async ({ page }) => {
      await page.setViewportSize(
        mobile ? { width: 390, height: 844 } : { width: 1240, height: 820 },
      );
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("console", (m) => {
        if (m.type() === "error") errors.push(m.text());
      });
      await page.goto("http://127.0.0.1:4173");
      const button = (name: string) =>
        page.getByRole("button", { name, exact: true });
      await button("Магазин").click();
      await expect(button("Выбран")).toBeDisabled();
      await button("Назад").click();
      await button("Настройки").click();
      await page.getByLabel("Без звука").check();
      await button("Назад").click();
      await page.screenshot({
        path: mobile ? "/tmp/lumber-mobile.png" : "/tmp/lumber-home.png",
      });
      await button("▶ Играть").click();
      for (const [i, k] of [
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
      ].entries()) {
        if (mobile) {
          const x = 180,
            y = 300;
          await page.mouse.move(x, y);
          await page.mouse.down();
          await page.mouse.move(x + [-65, 65, 0, 0][i], y + [0, 0, -65, 65][i]);
          await page.mouse.up();
        } else await page.keyboard.press(k);
      }
      await expect(page.locator(".teach")).toHaveCount(0);
      await page.waitForTimeout(1300);
      await expect(page.locator("#hud span")).not.toContainText("　0 м");
      await button("Пауза").click();
      await button("Продолжить").click();
      await button("Пауза").click();
      await button("Заново").click();
      await button("Пауза").click();
      await button("В главное меню").click();
      await page.reload();
      await button("Рекорды").click();
      await expect(page.getByText("Забеги · 2")).toBeVisible();
      expect(errors).toEqual([]);
    },
  );
