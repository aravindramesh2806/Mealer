// Core data model for Mealer. Kept small and serializable (plain JSON in localStorage).

export type Meal = "breakfast" | "lunch" | "dinner";
export const MEALS: Meal[] = ["breakfast", "lunch", "dinner"];

export type Day = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export const DAYS: Day[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
export const DAY_LABEL: Record<Day, string> = {
  mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday",
  fri: "Friday", sat: "Saturday", sun: "Sunday",
};

/** What role a dish plays in a meal. Universal across cuisines. */
export type Category =
  | "breakfast" // a complete breakfast: cereal, idli, omelette
  | "main"      // a complete one-dish meal: wrap, pasta, biryani, burrito
  | "protein"   // a protein dish eaten with sides: steak, fish fry, chicken curry
  | "veg"       // a vegetable side/curry: poriyal, roasted broccoli, stir-fried greens
  | "dal"       // dal, sambar, kuzhambu, rasam, soup
  | "starch"    // rice, roti, noodles, mashed potatoes
  | "salad";

export const CATEGORY_LABEL: Record<Category, string> = {
  breakfast: "Breakfast", main: "One-dish meal", protein: "Protein",
  veg: "Vegetable", dal: "Dal / soup", starch: "Rice / bread", salad: "Salad",
};

export type Cuisine =
  | "american" | "south-indian" | "north-indian" | "chinese"
  | "mexican" | "italian" | "mediterranean";

export const CUISINE_LABEL: Record<Cuisine, string> = {
  american: "American", "south-indian": "South Indian", "north-indian": "North Indian",
  chinese: "Chinese", mexican: "Mexican", italian: "Italian", mediterranean: "Mediterranean",
};

/** veg = no meat/fish/egg; egg = contains egg but no meat; nonveg = meat or fish. */
export type Diet = "veg" | "egg" | "nonveg";

export type Unit = "g" | "ml" | "pc" | "slice";

export type Section =
  | "produce" | "meat & fish" | "dairy & eggs" | "grains & bread"
  | "pantry" | "frozen" | "other";

export const SECTIONS: Section[] = [
  "produce", "meat & fish", "dairy & eggs", "grains & bread", "pantry", "frozen", "other",
];

export interface Ingredient {
  item: string;
  qty: number;      // per serving
  unit: Unit;
  section: Section;
}

export interface AddOn {
  id: string;
  name: string;
  perServing: Ingredient[];
}

export interface Dish {
  id: string;
  name: string;
  cuisine: Cuisine;
  category: Category;
  meals: Meal[];
  diet: Diet;
  perServing: Ingredient[];
  /** Staples most kitchens already have (spices, oil, salt). Shown as a pantry check, not bought by quantity. */
  pantry: string[];
  addOns: AddOn[];
  popular?: boolean;   // pre-ticked in onboarding
  custom?: boolean;    // added by the user
  // Reserved for v2 "Make it at home": recipe steps, source, rating.
  steps?: string[];
  source?: "catalog" | "family" | "restaurant-style" | "own";
}

export interface TemplateSlot {
  id: string;
  label: string;
  categories: Category[];
  /** Dish used by default if the user has it (e.g. steamed rice). */
  defaultDishId?: string;
}

export interface Template {
  id: string;
  name: string;
  meals: Meal[];
  example: string;
  slots: TemplateSlot[];
}

export interface PlannedItem {
  slotId: string;
  dishId: string | null;
  addOnIds: string[];
}

export interface MealEntry {
  templateId: string;
  items: PlannedItem[];
  /** Overrides household size for this one meal (guests, eating alone). */
  people?: number;
}

/** key: `${day}-${meal}`; null = skipped (eating out, leftovers). */
export type WeekSlots = Partial<Record<string, MealEntry | null>>;

export interface WeekPlan {
  weekStart: string; // ISO date (Monday)
  slots: WeekSlots;
  haveItems: string[]; // shopping-list keys the user already has
}

export type DietPref = "everything" | "eggetarian" | "vegetarian";

export interface Profile {
  household: number;
  dietPref: DietPref;
  cuisines: Cuisine[];
  /** Default template per meal; null = usually skip this meal. */
  defaults: Record<Meal, string | null>;
  /** Per-day template overrides, e.g. non-veg lunch on Wednesday. key `${day}-${meal}`. */
  dayOverrides: Record<string, string>;
  /** Don't repeat the same dish within this many days. */
  noRepeatDays: number;
  library: string[]; // dish ids the user eats
}

export interface AppState {
  version: 1;
  profile: Profile | null;
  customDishes: Dish[];
  plans: Record<string, WeekPlan>; // by weekStart
}

export const slotKey = (day: Day, meal: Meal) => `${day}-${meal}`;
