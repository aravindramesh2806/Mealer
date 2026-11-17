import type { Template } from "./types";

// Meal patterns. A template is a set of slots; the user fills each slot with a dish.
// Works across cultures: one-dish meals, main + sides, rice + several dishes.
export const TEMPLATES: Template[] = [
  {
    id: "breakfast-one",
    name: "One breakfast dish",
    meals: ["breakfast"],
    example: "Cereal, eggs & toast, idli, overnight oats",
    slots: [{ id: "b", label: "Breakfast", categories: ["breakfast"] }],
  },
  {
    id: "one-dish",
    name: "One-dish meal",
    meals: ["lunch", "dinner"],
    example: "Wrap, sandwich, pasta, burrito bowl, biryani",
    slots: [{ id: "m", label: "Dish", categories: ["main"] }],
  },
  {
    id: "salad",
    name: "Salad",
    meals: ["lunch", "dinner"],
    example: "Chicken Caesar, Greek salad",
    slots: [{ id: "s", label: "Salad", categories: ["salad"] }],
  },
  {
    id: "main-sides",
    name: "Main + side",
    meals: ["lunch", "dinner"],
    example: "Grilled steak + mashed potatoes + green beans",
    slots: [
      { id: "p", label: "Main", categories: ["protein"] },
      { id: "st", label: "Starch", categories: ["starch"] },
      { id: "v", label: "Vegetable", categories: ["veg", "salad"] },
    ],
  },
  {
    id: "indian-veg-lunch",
    name: "Rice + 2 veg + dal",
    meals: ["lunch", "dinner"],
    example: "Beans poriyal + potato fry + sambar + rice",
    slots: [
      { id: "v1", label: "Vegetable 1", categories: ["veg"] },
      { id: "v2", label: "Vegetable 2", categories: ["veg"] },
      { id: "d", label: "Dal / kuzhambu", categories: ["dal"] },
      { id: "r", label: "Rice", categories: ["starch"], defaultDishId: "steamed-rice" },
    ],
  },
  {
    id: "indian-nonveg-lunch",
    name: "Rice + protein + veg + rasam",
    meals: ["lunch", "dinner"],
    example: "Fish fry + cabbage poriyal + rasam + rice",
    slots: [
      { id: "p", label: "Protein", categories: ["protein"] },
      { id: "v", label: "Vegetable", categories: ["veg"] },
      { id: "d", label: "Rasam / dal", categories: ["dal"] },
      { id: "r", label: "Rice", categories: ["starch"], defaultDishId: "steamed-rice" },
    ],
  },
  {
    id: "roti-curry",
    name: "Roti + curry",
    meals: ["lunch", "dinner"],
    example: "Chapati + paneer butter masala, roti + chana masala",
    slots: [
      { id: "st", label: "Bread", categories: ["starch"], defaultDishId: "chapati" },
      { id: "c", label: "Curry", categories: ["veg", "protein", "dal"] },
    ],
  },
  {
    id: "rice-and-dishes",
    name: "Rice/noodles + main + veg",
    meals: ["lunch", "dinner"],
    example: "Rice + kung pao chicken + garlic bok choy",
    slots: [
      { id: "st", label: "Rice / noodles", categories: ["starch"], defaultDishId: "steamed-rice" },
      { id: "p", label: "Main", categories: ["protein"] },
      { id: "v", label: "Vegetable", categories: ["veg"] },
    ],
  },
];

export const templateById = (id: string) => TEMPLATES.find((t) => t.id === id);
