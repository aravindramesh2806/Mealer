# Mealer

Plan your week of home meals on Sunday, get one shopping list, and shop once.

- **Your meals, not random ones.** You pick the cuisines you grew up with or love (American, South/North Indian, Chinese, Mexican, Italian, Mediterranean) and tick the dishes you actually eat. Mealer only plans from that list.
- **Meal patterns.** Each meal follows a pattern: one breakfast dish, one-dish meal, main + side, rice + 2 veg + dal, roti + curry, rice/noodles + main + veg.
- **Rotation.** The weekly draft puts dishes you haven't had in a while first and avoids repeats within N days (you choose N).
- **Add-ons.** Chutney and vada with idli, almonds on oats, garlic bread with pasta. They go on the list too.
- **One shopping list.** Scaled by people × times eaten, duplicates merged, grouped by store section, pantry staples shown separately, shareable to WhatsApp.
- **Private and free.** Everything is stored on the phone. No account, no server.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # logic tests
npm run build    # production build in dist/
```

## Deploy for free (Cloudflare Pages)

1. dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git → pick `mealer`.
2. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.
3. Deploy. You get a link like `mealer.pages.dev`; every push to `main` redeploys.

On a phone, open the link and use **Add to Home Screen** (Safari share menu on iPhone, ⋮ menu in Chrome on Android).

## Code map

| Path | What it is |
|---|---|
| `src/data/types.ts` | Data model: dishes, templates, plans, profile |
| `src/data/dishes.ts` | Starter catalog (~100 dishes, per-serving quantities) |
| `src/data/templates.ts` | Meal patterns |
| `src/logic/draft.ts` | Week drafting and swap ranking (rules + history, no AI) |
| `src/logic/shopping.ts` | Shopping list: scaling, merging, formatting, share text |
| `src/logic/storage.ts` | Saves to the device (localStorage), backup/restore |
| `src/components/` | Onboarding, Week, List, Dishes, Settings screens |

## Roadmap

- **v1.5:** pack-size rounding, pantry memory, leftovers, family sync
- **v2:** "Make it at home": family recipes and restaurant-style favourites, recipe steps, rating after cooking
- **v3:** photo/voice recipe capture, grocery ordering links, nutrition
