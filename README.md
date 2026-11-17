# Mealer

Plan your week of home meals on Sunday, get one shopping list, and shop once.

- **Two-minute setup, no account.** Welcome screen, four short steps (who's eating, cuisines, how you eat, optional goals), then a preview of your first week. Popular dishes are picked for you; ticking dishes yourself is optional.
- **Your meals, not random ones.** You pick the cuisines you grew up with or love (American, South/North Indian, Chinese, Mexican, Italian, Mediterranean, Thai, Japanese, Korean, Vietnamese) and tick the dishes you actually eat. Mealer only plans from that list.
- **Meal patterns.** Each meal follows a pattern: one breakfast dish, one-dish meal, main + side, rice + 2 veg + dal, roti + curry, rice/noodles + main + veg.
- **Rotation.** The weekly draft puts dishes you haven't had in a while first and avoids repeats within N days (you choose N).
- **Add-ons.** Chutney and vada with idli, almonds on oats, garlic bread with pasta. They go on the list too.
- **One shopping list.** Scaled by people × times eaten, duplicates merged, grouped by store section, pantry staples shown separately, shareable to WhatsApp.
- **Nutrition and goals.** Estimated calories, protein, carbs and fat per dish, meal and day. Optional diet goals (high protein, low fat, low carb, lighter meals) and an optional calorie target from height, weight, age and activity steer the weekly draft.
- **Private and free.** Everything is stored on the phone. No account, no server.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # logic tests
npm run test:e2e # flow tests in a phone-sized browser
npm run test:e2e # 36 click-through flow tests on a phone-sized screen
npm run build    # production build in dist/
```

Every pull request and push to `main` runs the same checks on GitHub Actions (`.github/workflows/ci.yml`): type check, logic tests, build and flow tests.

## Deploy for free (Cloudflare Pages)

1. dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git → pick `mealer`.
2. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.
3. Deploy. You get a link like `mealer.pages.dev`; every push to `main` redeploys.

On a phone, open the link and use **Add to Home Screen** (Safari share menu on iPhone, ⋮ menu in Chrome on Android).

## Code map

| Path | What it is |
|---|---|
| `src/data/types.ts` | Data model: dishes, templates, plans, profile |
| `src/data/dishes.ts` | Starter catalog (~200 dishes, per-serving quantities) |
| `src/data/templates.ts` | Meal patterns |
| `src/logic/draft.ts` | Week drafting and swap ranking (rules + history, no AI) |
| `src/data/nutrition.ts` | Approximate nutrition per ingredient (per 100 g/ml or per piece) |
| `src/logic/nutrition.ts` | Dish/meal/day estimates, goal tags, calorie target (Mifflin–St Jeor), per-slot calorie budget |
| `src/logic/shopping.ts` | Shopping list: scaling, merging, formatting, share text |
| `src/logic/setup.ts` | First-time setup: meal styles to patterns, style guess, starter dish list |
| `src/logic/storage.ts` | Saves to the device (localStorage), backup/restore |
| `src/components/` | Onboarding, Week, List, Dishes, Settings screens |

## Roadmap

- **v1.5:** pack-size rounding, pantry memory, leftovers, family sync, per-person targets
- **v2:** "Make it at home": family recipes and restaurant-style favourites, recipe steps, rating after cooking
- **v3:** photo/voice recipe capture, grocery ordering links
