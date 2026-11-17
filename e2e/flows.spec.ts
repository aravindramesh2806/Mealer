import { expect, test, type Page } from "@playwright/test";

// Flow tests: each test starts from a fresh phone (empty storage).

const CUISINES = ["American", "South Indian", "North Indian", "Chinese", "Mexican", "Italian", "Mediterranean",
  "Thai", "Japanese", "Korean", "Vietnamese", "French", "Caribbean"];
const DIETS = ["Everything", "Vegetarian + eggs", "Vegetarian"];

interface Setup {
  diet?: string;
  cuisines?: string[];
  /** Card name per meal (breakfast, lunch, dinner); omitted = keep the suggested one. */
  patterns?: (string | undefined)[];
  goals?: string[];
  /** Fill the calorie step (metric); omitted = Skip. */
  body?: { height: string; weight: string; age: string; sex: "Female" | "Male"; aim: "Lose" | "Keep" | "Gain" };
}

/** Watch for crashes so a test fails on any uncaught page error. */
function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

async function onboard(page: Page, s: Setup = {}) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Who are you cooking for?" })).toBeVisible();
  await page.getByRole("button", { name: s.diet ?? "Everything", exact: true }).click();
  for (const g of s.goals ?? []) await page.getByRole("button", { name: g, exact: true }).click();
  await page.getByRole("button", { name: "Next" }).click();

  await expect(page.getByRole("heading", { name: "Want a calorie target?" })).toBeVisible();
  if (s.body) {
    await page.getByLabel("Height (cm)").fill(s.body.height);
    await page.getByLabel("Weight (kg)").fill(s.body.weight);
    await page.getByLabel("Age").fill(s.body.age);
    await page.getByLabel("Sex (for the formula)").selectOption({ label: s.body.sex });
    await page.getByRole("button", { name: s.body.aim, exact: true }).click();
    await page.getByRole("button", { name: "Next" }).click();
  } else {
    await page.getByRole("button", { name: "Skip" }).click();
  }

  for (const c of s.cuisines ?? ["South Indian", "American"]) {
    await page.getByRole("button", { name: c, exact: true }).click();
  }
  await page.getByRole("button", { name: "Next" }).click();

  await expect(page.getByRole("heading", { name: "How do your meals usually look?" })).toBeVisible();
  const fields = page.locator(".field");
  for (const [k, name] of (s.patterns ?? []).entries()) {
    if (name) await fields.nth(k).locator(".card", { hasText: name }).click();
  }
  await page.getByRole("button", { name: "Next" }).click();

  await expect(page.getByRole("heading", { name: "Tick the dishes you eat" })).toBeVisible();
  const plan = page.getByRole("button", { name: /Plan my week/ });
  await expect(plan).toBeEnabled();
  await plan.click();
  await expect(page.locator(".tabs")).toBeVisible({ timeout: 5000 });
}

test.describe("onboarding creates a plan", () => {
  for (const diet of DIETS) {
    for (const cuisine of CUISINES) {
      test(`${diet} · ${cuisine}`, async ({ page }) => {
        const errors = trackErrors(page);
        await onboard(page, { diet, cuisines: [cuisine] });
        await expect(page.locator(".day")).toHaveCount(7);
        expect(errors).toEqual([]);
      });
    }
  }

  const patternSets: [string, (string | undefined)[]][] = [
    ["indian lunch, roti dinner", [undefined, "Rice + 2 veg + dal", "Roti + curry"]],
    ["non-veg lunch, rice-and-dishes dinner", [undefined, "Rice + protein + veg + rasam", "Rice/noodles + main + veg"]],
    ["one-dish lunch, salad dinner", [undefined, "One-dish meal", "Salad"]],
    ["main + side both", [undefined, "Main + side", "Main + side"]],
    ["skip everything", ["Usually skip", "Usually skip", "Usually skip"]],
  ];
  for (const [name, patterns] of patternSets) {
    test(`patterns: ${name}`, async ({ page }) => {
      const errors = trackErrors(page);
      await onboard(page, { cuisines: CUISINES, patterns });
      await expect(page.locator(".day")).toHaveCount(7);
      expect(errors).toEqual([]);
    });
  }

  test("going back and changing cuisines still works", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/");
    await page.getByRole("button", { name: "Next" }).click();
    await page.getByRole("button", { name: "Skip" }).click();
    await page.getByRole("button", { name: "Italian", exact: true }).click();
    await page.getByRole("button", { name: "Next" }).click();
    await page.getByRole("button", { name: "Next" }).click();
    await page.getByRole("button", { name: "Back" }).click();
    await page.getByRole("button", { name: "Back" }).click();
    await page.getByRole("button", { name: "Mexican", exact: true }).click();
    await page.getByRole("button", { name: "Next" }).click();
    await page.getByRole("button", { name: "Next" }).click();
    await expect(page.getByRole("button", { name: "Chicken burrito bowl" })).toBeVisible();
    await page.getByRole("button", { name: /Plan my week/ }).click();
    await expect(page.locator(".tabs")).toBeVisible();
    expect(errors).toEqual([]);
  });
});

test("everyday basics are on by default with any cuisine", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Skip" }).click();
  await expect(page.getByRole("button", { name: "Everyday basics", exact: true })).toHaveClass(/sel/);
  await page.getByRole("button", { name: "Thai", exact: true }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("button", { name: "Overnight oats" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Scrambled eggs & toast" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Bagel & cream cheese" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Croissant & jam" })).toBeVisible();
});

test("non-Indian setup does not add chapati", async ({ page }) => {
  await onboard(page, { cuisines: ["American", "Italian"] });
  await page.locator(".tabs button", { hasText: "Dishes" }).click();
  await expect(page.getByText("Chapati / roti")).toHaveCount(0);
});

test("Indian setup still adds chapati", async ({ page }) => {
  await onboard(page, { cuisines: ["North Indian"] });
  await page.locator(".tabs button", { hasText: "Dishes" }).click();
  await expect(page.getByText("Chapati / roti").first()).toBeVisible();
});

test.describe("using the plan", () => {
  test("swap a dish", async ({ page }) => {
    await onboard(page, { patterns: [undefined, "Rice + 2 veg + dal"] });
    const first = page.locator(".dish").nth(1);
    const before = await first.locator("span").innerText();
    await first.click();
    await expect(page.locator(".sheet")).toBeVisible();
    const choice = page.locator(".pick:not(.sel):not(.ghost)").first();
    const picked = await choice.locator("span").innerText();
    await choice.click();
    await expect(page.locator(".sheet")).toHaveCount(0);
    await expect(first.locator("span")).toHaveText(picked);
    expect(picked).not.toBe(before);
  });

  test("add-on goes on the shopping list", async ({ page }) => {
    await onboard(page, { cuisines: ["American"] });
    // Make Monday breakfast overnight oats, then add almonds.
    await page.locator(".dish").first().click();
    await page.locator(".pick", { hasText: "Overnight oats" }).click();
    await page.locator(".addons .chip", { hasText: "Almonds" }).first().click();
    await page.locator(".tabs button", { hasText: "List" }).click();
    await expect(page.locator(".li", { hasText: "Almonds" })).toBeVisible();
    await expect(page.locator(".li", { hasText: "Rolled oats" })).toBeVisible();
  });

  test("people count changes quantities", async ({ page }) => {
    await onboard(page, { cuisines: ["American"], patterns: ["Usually skip", "Salad", "Usually skip"] });
    await page.locator(".tabs button", { hasText: "List" }).click();
    const head = page.locator(".list-head");
    await expect(head).toContainText("for 2");
    await page.locator(".tabs button", { hasText: "Settings" }).click();
    await page.locator(".li", { hasText: "People" }).getByRole("button", { name: "+" }).click();
    await page.locator(".tabs button", { hasText: "List" }).click();
    await expect(head).toContainText("for 3");
  });

  test("ticking an item marks it as had", async ({ page }) => {
    await onboard(page);
    await page.locator(".tabs button", { hasText: "List" }).click();
    const text = await page.locator(".list-head b").innerText();
    const n = Number(text.split(" ")[0]);
    await page.locator(".li input[type=checkbox]").first().check();
    await expect(page.locator(".list-head b")).toHaveText(`${n - 1} to buy`);
  });

  test("skip a meal from the week", async ({ page }) => {
    await onboard(page);
    const mondayLunch = page.locator(".day").first().locator(".meal").nth(1);
    await mondayLunch.locator("select").selectOption("skip");
    await expect(mondayLunch).toHaveClass(/skipped/);
  });

  test("add your own dish and plan with it", async ({ page }) => {
    await onboard(page, { cuisines: ["South Indian"], patterns: [undefined, "One-dish meal"] });
    await page.locator(".tabs button", { hasText: "Dishes" }).click();
    await page.getByRole("button", { name: "+ Add your own" }).click();
    await page.getByPlaceholder("e.g. Amma's lemon rice").fill("Amma's puliyodarai");
    await page.getByPlaceholder("Ingredient").fill("Tamarind");
    await page.getByRole("button", { name: "Save dish" }).click();
    await expect(page.locator(".li", { hasText: "Amma's puliyodarai" })).toBeVisible();
    await page.locator(".tabs button", { hasText: "Week" }).click();
    await page.locator(".day").first().locator(".meal").nth(1).locator(".dish").click();
    await expect(page.locator(".pick", { hasText: "Amma's puliyodarai" })).toBeVisible();
  });

  test("day rule skips Friday dinner after re-draft", async ({ page }) => {
    page.on("dialog", (d) => d.accept());
    await onboard(page);
    await page.locator(".tabs button", { hasText: "Settings" }).click();
    await page.getByLabel("Friday dinner").selectOption("skip");
    await page.locator(".tabs button", { hasText: "Week" }).click();
    await page.getByRole("button", { name: "Re-draft" }).click();
    const fridayDinner = page.locator(".day").nth(4).locator(".meal").nth(2);
    await expect(fridayDinner.locator("select")).toHaveValue("skip");
  });

  test("plan survives a reload", async ({ page }) => {
    await onboard(page);
    const dish = await page.locator(".dish span").first().innerText();
    await page.reload();
    await expect(page.locator(".dish span").first()).toHaveText(dish);
  });

  test("empty next week can be drafted", async ({ page }) => {
    await onboard(page);
    await page.getByRole("button", { name: "Next week" }).click();
    await page.getByRole("button", { name: "Draft this week for me" }).click();
    await expect(page.locator(".day")).toHaveCount(7);
  });
});

test.describe("nutrition, goals and calorie target", () => {
  const body = { height: "175", weight: "75", age: "30", sex: "Male", aim: "Lose" } as const;

  test("calorie step shows the target and the week tracks it", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/");
    await page.getByRole("button", { name: "Next" }).click();
    const next = page.getByRole("button", { name: "Next" });
    await expect(next).toBeDisabled();
    await expect(page.getByText("Enter height, weight and age")).toBeVisible();
    await page.getByLabel("Height (cm)").fill("175");
    await page.getByLabel("Weight (kg)").fill("75");
    await page.getByLabel("Age").fill("30");
    await page.getByLabel("Sex (for the formula)").selectOption("male");
    await page.getByLabel("How active are you?").selectOption("moderate");
    await page.getByRole("button", { name: "Lose", exact: true }).click();
    await expect(page.locator(".target-num")).toHaveText("≈ 2,130 kcal · 120 g protein");
    await page.getByRole("button", { name: "lb · in" }).click();
    await expect(page.getByLabel("Weight (lb)")).toHaveValue("165");
    await expect(page.locator(".target-num")).toContainText("2,130");
    await next.click();
    await page.getByRole("button", { name: "Next" }).click();
    await page.getByRole("button", { name: "Next" }).click();
    await page.getByRole("button", { name: /Plan my week/ }).click();
    const monday = page.getByLabel("Monday nutrition per person");
    await expect(monday).toContainText("of 2,130");
    await expect(monday).toContainText("of 120 g");
    await expect(monday).toContainText("Carbs");
    await expect(monday).toContainText("Fat");
    await expect(monday.getByRole("img")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("skipping the calorie step still shows estimates, no target", async ({ page }) => {
    await onboard(page);
    const monday = page.getByLabel("Monday nutrition per person");
    await expect(monday).toContainText("Calories");
    await expect(monday).not.toContainText("of ");
    await expect(page.locator(".dish .kcal").first()).toContainText("g carbs");
  });

  test("goals and calorie aim show in the swap sheet", async ({ page }) => {
    await onboard(page, { goals: ["High protein"], body });
    await page.locator(".dish").first().click();
    await expect(page.locator(".aim")).toContainText("Aim here: about");
    await expect(page.locator(".aim")).toContainText("High protein");
    await expect(page.locator(".pick small").first()).toContainText("kcal");
  });

  test("dishes can be filtered by goal", async ({ page }) => {
    await onboard(page, { cuisines: ["American"] });
    await page.locator(".tabs button", { hasText: "Dishes" }).click();
    const all = await page.locator(".dishes .li").count();
    await page.getByRole("group", { name: "Filter by goal" }).getByRole("button", { name: "High protein" }).click();
    const rows = page.locator(".dishes .li");
    const n = await rows.count();
    expect(n).toBeGreaterThan(0);
    expect(n).toBeLessThan(all);
    for (let k = 0; k < n; k++) await expect(rows.nth(k).locator(".tag", { hasText: "High protein" })).toHaveCount(1);
  });

  test("settings can add, change and remove the target", async ({ page }) => {
    page.on("dialog", (d) => d.accept());
    await onboard(page);
    await page.locator(".tabs button", { hasText: "Settings" }).click();
    await page.getByLabel("Height (cm)").fill("160");
    await page.getByLabel("Weight (kg)").fill("60");
    await page.getByLabel("Age").fill("40");
    await expect(page.locator(".target-num")).toContainText("kcal");
    await page.getByRole("button", { name: "Re-draft this week" }).click();
    await expect(page.getByLabel("Monday nutrition per person")).toContainText("of ");
    await page.locator(".tabs button", { hasText: "Settings" }).click();
    await page.getByRole("button", { name: "Remove my details" }).click();
    await page.locator(".tabs button", { hasText: "Week" }).click();
    await expect(page.getByLabel("Monday nutrition per person")).not.toContainText("of ");
  });
});
