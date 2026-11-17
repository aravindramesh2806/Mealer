import type { AddOn, Category, Cuisine, Diet, Dish, Ingredient, Meal, Section, Unit } from "./types";

// Starter catalog. Quantities are per serving for a typical adult and are a first draft:
// check them against how your own household cooks and adjust.

const i = (item: string, qty: number, unit: Unit, section: Section): Ingredient => ({ item, qty, unit, section });
const P = "produce", M = "meat & fish", D = "dairy & eggs", G = "grains & bread", PA = "pantry", F = "frozen";
const LD: Meal[] = ["lunch", "dinner"];
const B: Meal[] = ["breakfast"];

const add = (id: string, name: string, ...perServing: Ingredient[]): AddOn => ({ id, name, perServing });

function dish(
  id: string, name: string, cuisine: Cuisine, category: Category, meals: Meal[], diet: Diet,
  perServing: Ingredient[], pantry: string[] = [], addOns: AddOn[] = [], popular = false,
): Dish {
  return { id, name, cuisine, category, meals, diet, perServing, pantry, addOns, popular, source: "catalog" };
}

// Shared add-ons
const coconutChutney = add("coconut-chutney", "Coconut chutney", i("Grated coconut", 25, "g", P), i("Roasted chana dal", 8, "g", PA), i("Green chili", 0.5, "pc", P));
const tomatoChutney = add("tomato-chutney", "Tomato chutney", i("Tomato", 0.5, "pc", P), i("Onion", 0.25, "pc", P));
const sambarSide = add("sambar-side", "Sambar", i("Toor dal", 25, "g", PA), i("Mixed vegetables", 50, "g", P), i("Tamarind", 3, "g", PA));
const vada = add("medu-vada", "Medu vada (2)", i("Urad dal", 30, "g", PA));
const curd = add("curd", "Curd / yogurt", i("Plain yogurt", 100, "g", D));
const papad = add("papad", "Papad", i("Papad", 1, "pc", PA));
const pickle = add("pickle", "Pickle", i("Pickle", 10, "g", PA));
const ghee = add("ghee", "Ghee", i("Ghee", 5, "g", D));
const raita = add("raita", "Raita", i("Plain yogurt", 80, "g", D), i("Cucumber", 0.25, "pc", P));
const sideSalad = add("side-salad", "Side salad", i("Mixed greens", 40, "g", P), i("Tomato", 0.5, "pc", P));
const garlicBread = add("garlic-bread", "Garlic bread", i("Baguette", 2, "slice", G), i("Butter", 10, "g", D));
const cheese = add("cheese", "Extra cheese", i("Shredded cheese", 25, "g", D));
const avocado = add("avocado", "Avocado", i("Avocado", 0.5, "pc", P));
const fruit = add("fruit", "Fruit (banana/berries)", i("Banana", 1, "pc", P));
const friedEgg = add("fried-egg", "Fried egg", i("Eggs", 1, "pc", D));

export const CATALOG: Dish[] = [
  // ---------- American ----------
  dish("cereal-milk", "Cereal with milk", "american", "breakfast", B, "veg",
    [i("Breakfast cereal", 45, "g", G), i("Milk", 200, "ml", D)], [], [fruit, add("almonds", "Almonds", i("Almonds", 15, "g", PA))], true),
  dish("eggs-toast", "Scrambled eggs & toast", "american", "breakfast", B, "egg",
    [i("Eggs", 2, "pc", D), i("Bread", 2, "slice", G), i("Butter", 10, "g", D)], ["salt", "pepper"], [avocado, add("bacon", "Bacon", i("Bacon", 2, "slice", M))], true),
  dish("overnight-oats", "Overnight oats", "american", "breakfast", B, "veg",
    [i("Rolled oats", 50, "g", G), i("Milk", 150, "ml", D), i("Chia seeds", 10, "g", PA)], ["honey"],
    [add("choc-chips", "Chocolate chips", i("Chocolate chips", 10, "g", PA)), add("almonds", "Almonds", i("Almonds", 15, "g", PA)),
     add("protein-powder", "Protein powder", i("Protein powder", 30, "g", PA)), fruit], true),
  dish("pancakes", "Pancakes", "american", "breakfast", B, "egg",
    [i("Pancake mix", 70, "g", G), i("Milk", 100, "ml", D), i("Eggs", 0.5, "pc", D)], ["oil"], [add("maple-syrup", "Maple syrup", i("Maple syrup", 20, "ml", PA)), fruit]),
  dish("greek-yogurt-bowl", "Greek yogurt & granola", "american", "breakfast", B, "veg",
    [i("Greek yogurt", 170, "g", D), i("Granola", 40, "g", G), i("Berries", 60, "g", P)], ["honey"]),
  dish("avocado-toast", "Avocado toast", "american", "breakfast", B, "veg",
    [i("Bread", 2, "slice", G), i("Avocado", 0.5, "pc", P)], ["salt", "chili flakes"], [friedEgg]),
  dish("breakfast-sandwich", "Egg & cheese breakfast sandwich", "american", "breakfast", B, "egg",
    [i("English muffin", 1, "pc", G), i("Eggs", 1, "pc", D), i("Cheese slices", 1, "slice", D)], [], [add("sausage", "Sausage patty", i("Breakfast sausage", 1, "pc", M))], true),
  dish("turkey-wrap", "Turkey & cheese wrap", "american", "main", LD, "nonveg",
    [i("Tortillas (large)", 1, "pc", G), i("Deli turkey", 80, "g", M), i("Cheese slices", 1, "slice", D), i("Lettuce", 30, "g", P), i("Tomato", 0.5, "pc", P)], ["mayo", "mustard"], [], true),
  dish("chicken-wrap", "Grilled chicken wrap", "american", "main", LD, "nonveg",
    [i("Tortillas (large)", 1, "pc", G), i("Chicken breast", 120, "g", M), i("Lettuce", 30, "g", P), i("Shredded cheese", 20, "g", D)], ["ranch or mayo", "oil"], [avocado], true),
  dish("blt", "BLT sandwich", "american", "main", LD, "nonveg",
    [i("Bread", 2, "slice", G), i("Bacon", 3, "slice", M), i("Lettuce", 20, "g", P), i("Tomato", 0.5, "pc", P)], ["mayo"]),
  dish("grilled-cheese-soup", "Grilled cheese & tomato soup", "american", "main", LD, "veg",
    [i("Bread", 2, "slice", G), i("Cheese slices", 2, "slice", D), i("Tomato soup (carton)", 250, "ml", PA), i("Butter", 10, "g", D)]),
  dish("burger", "Cheeseburger", "american", "main", LD, "nonveg",
    [i("Burger buns", 1, "pc", G), i("Ground beef", 150, "g", M), i("Cheese slices", 1, "slice", D), i("Lettuce", 15, "g", P), i("Onion", 0.25, "pc", P)], ["ketchup", "mustard"], [add("fries", "Frozen fries", i("Frozen fries", 120, "g", F))], true),
  dish("mac-cheese", "Mac & cheese", "american", "main", LD, "veg",
    [i("Elbow macaroni", 90, "g", G), i("Shredded cheese", 60, "g", D), i("Milk", 100, "ml", D), i("Butter", 10, "g", D)], ["flour", "salt"]),
  dish("grilled-steak", "Grilled steak", "american", "protein", LD, "nonveg",
    [i("Steak (sirloin/ribeye)", 200, "g", M)], ["salt", "pepper", "garlic", "oil"], [], true),
  dish("baked-salmon", "Baked salmon", "american", "protein", LD, "nonveg",
    [i("Salmon fillet", 170, "g", M), i("Lemon", 0.25, "pc", P)], ["salt", "pepper", "olive oil"], [], true),
  dish("roast-chicken", "Roast chicken thighs", "american", "protein", LD, "nonveg",
    [i("Chicken thighs", 220, "g", M)], ["salt", "pepper", "paprika", "oil"], [], true),
  dish("bbq-chicken", "BBQ chicken", "american", "protein", LD, "nonveg",
    [i("Chicken breast", 180, "g", M), i("BBQ sauce", 30, "ml", PA)], ["salt", "oil"]),
  dish("meatloaf", "Meatloaf", "american", "protein", LD, "nonveg",
    [i("Ground beef", 150, "g", M), i("Breadcrumbs", 15, "g", G), i("Eggs", 0.25, "pc", D), i("Onion", 0.25, "pc", P)], ["ketchup", "salt"]),
  dish("mashed-potatoes", "Mashed potatoes", "american", "starch", LD, "veg",
    [i("Potatoes", 200, "g", P), i("Butter", 10, "g", D), i("Milk", 40, "ml", D)], ["salt"], [], true),
  dish("roasted-potatoes", "Roasted potatoes", "american", "starch", LD, "veg",
    [i("Baby potatoes", 200, "g", P)], ["olive oil", "salt", "rosemary"]),
  dish("brown-rice", "Brown rice", "american", "starch", LD, "veg", [i("Brown rice", 70, "g", G)]),
  dish("green-beans", "Garlic green beans", "american", "veg", LD, "veg",
    [i("Green beans", 120, "g", P)], ["garlic", "butter or oil", "salt"], [], true),
  dish("roasted-broccoli", "Roasted broccoli", "american", "veg", LD, "veg",
    [i("Broccoli", 150, "g", P)], ["olive oil", "garlic", "salt"], [], true),
  dish("corn-on-cob", "Corn on the cob", "american", "veg", LD, "veg", [i("Corn on the cob", 1, "pc", P), i("Butter", 8, "g", D)], ["salt"]),
  dish("roasted-carrots", "Honey roasted carrots", "american", "veg", LD, "veg", [i("Carrots", 130, "g", P)], ["honey", "olive oil", "salt"]),
  dish("chicken-caesar", "Chicken Caesar salad", "american", "salad", LD, "nonveg",
    [i("Romaine lettuce", 120, "g", P), i("Chicken breast", 120, "g", M), i("Parmesan", 15, "g", D), i("Croutons", 20, "g", G), i("Caesar dressing", 30, "ml", PA)], [], [], true),
  dish("cobb-salad", "Cobb salad", "american", "salad", LD, "nonveg",
    [i("Romaine lettuce", 100, "g", P), i("Chicken breast", 100, "g", M), i("Eggs", 1, "pc", D), i("Bacon", 2, "slice", M), i("Avocado", 0.5, "pc", P), i("Tomato", 0.5, "pc", P)], ["ranch dressing"]),
  dish("garden-salad", "Simple garden salad", "american", "salad", LD, "veg",
    [i("Mixed greens", 80, "g", P), i("Cucumber", 0.33, "pc", P), i("Tomato", 0.5, "pc", P), i("Carrots", 30, "g", P)], ["dressing"], [add("grilled-chicken", "Grilled chicken", i("Chicken breast", 120, "g", M))]),

  // ---------- South Indian ----------
  dish("idli", "Idli", "south-indian", "breakfast", B, "veg",
    [i("Idli batter", 200, "g", D)], [], [coconutChutney, sambarSide, vada, tomatoChutney], true),
  dish("dosa", "Dosa", "south-indian", "breakfast", B, "veg",
    [i("Dosa batter", 220, "g", D)], ["oil"], [coconutChutney, sambarSide, tomatoChutney, add("potato-masala", "Potato masala (masala dosa)", i("Potatoes", 100, "g", P), i("Onion", 0.5, "pc", P))], true),
  dish("pongal", "Ven pongal", "south-indian", "breakfast", B, "veg",
    [i("Raw rice", 50, "g", G), i("Moong dal", 25, "g", PA), i("Ghee", 10, "g", D)], ["black pepper", "cumin", "ginger", "cashews"], [coconutChutney, sambarSide, vada]),
  dish("upma", "Rava upma", "south-indian", "breakfast", B, "veg",
    [i("Rava (sooji)", 60, "g", G), i("Onion", 0.5, "pc", P)], ["mustard seeds", "urad dal", "curry leaves", "green chili", "oil"], [coconutChutney], true),
  dish("poha", "Poha", "south-indian", "breakfast", B, "veg",
    [i("Poha (flattened rice)", 60, "g", G), i("Onion", 0.5, "pc", P), i("Peanuts", 10, "g", PA)], ["mustard seeds", "turmeric", "curry leaves", "lemon"]),
  dish("egg-dosa", "Egg dosa", "south-indian", "breakfast", B, "egg",
    [i("Dosa batter", 200, "g", D), i("Eggs", 1, "pc", D)], ["pepper", "oil"], [coconutChutney, tomatoChutney]),
  dish("steamed-rice", "Steamed rice", "south-indian", "starch", LD, "veg", [i("Rice (sona masoori/basmati)", 80, "g", G)], [], [ghee, papad, curd, pickle], true),
  dish("curd-rice", "Curd rice", "south-indian", "main", LD, "veg",
    [i("Rice (sona masoori/basmati)", 70, "g", G), i("Plain yogurt", 150, "g", D)], ["mustard seeds", "curry leaves", "ginger", "salt"], [pickle]),
  dish("lemon-rice", "Lemon rice", "south-indian", "main", LD, "veg",
    [i("Rice (sona masoori/basmati)", 80, "g", G), i("Lemon", 0.5, "pc", P), i("Peanuts", 10, "g", PA)], ["mustard seeds", "chana dal", "turmeric", "curry leaves"], [papad, add("potato-fry-side", "Potato fry", i("Potatoes", 100, "g", P))]),
  dish("sambar", "Sambar", "south-indian", "dal", LD, "veg",
    [i("Toor dal", 30, "g", PA), i("Mixed vegetables", 80, "g", P), i("Tamarind", 5, "g", PA), i("Tomato", 0.5, "pc", P)], ["sambar powder", "mustard seeds", "curry leaves", "asafoetida"], [], true),
  dish("rasam", "Tomato rasam", "south-indian", "dal", LD, "veg",
    [i("Tomato", 1, "pc", P), i("Toor dal", 10, "g", PA), i("Tamarind", 3, "g", PA)], ["rasam powder", "pepper", "cumin", "garlic", "curry leaves"], [], true),
  dish("moor-kuzhambu", "Moor kuzhambu", "south-indian", "dal", LD, "veg",
    [i("Plain yogurt", 120, "g", D), i("Grated coconut", 15, "g", P), i("Ash gourd or okra", 60, "g", P)], ["green chili", "cumin", "turmeric", "curry leaves"]),
  dish("vathal-kuzhambu", "Vathal kuzhambu", "south-indian", "dal", LD, "veg",
    [i("Tamarind", 10, "g", PA), i("Shallots", 40, "g", P)], ["sambar powder", "sundakkai vathal", "mustard seeds", "gingelly oil"]),
  dish("dal-tadka-south", "Paruppu (plain dal)", "south-indian", "dal", LD, "veg",
    [i("Moong dal", 35, "g", PA)], ["turmeric", "cumin", "ghee", "garlic"]),
  dish("beans-poriyal", "Beans poriyal", "south-indian", "veg", LD, "veg",
    [i("French beans", 100, "g", P), i("Grated coconut", 10, "g", P)], ["mustard seeds", "urad dal", "curry leaves", "oil"], [], true),
  dish("cabbage-poriyal", "Cabbage poriyal", "south-indian", "veg", LD, "veg",
    [i("Cabbage", 120, "g", P), i("Grated coconut", 10, "g", P)], ["mustard seeds", "urad dal", "green chili", "curry leaves"], [], true),
  dish("carrot-poriyal", "Carrot poriyal", "south-indian", "veg", LD, "veg",
    [i("Carrots", 110, "g", P), i("Grated coconut", 10, "g", P)], ["mustard seeds", "urad dal", "curry leaves"]),
  dish("potato-fry", "Potato roast", "south-indian", "veg", LD, "veg",
    [i("Potatoes", 130, "g", P)], ["chili powder", "turmeric", "mustard seeds", "oil"], [], true),
  dish("okra-fry", "Vendakkai (okra) fry", "south-indian", "veg", LD, "veg",
    [i("Okra", 120, "g", P)], ["chili powder", "turmeric", "oil"], [], true),
  dish("brinjal-curry", "Brinjal (eggplant) curry", "south-indian", "veg", LD, "veg",
    [i("Eggplant (small)", 130, "g", P), i("Onion", 0.25, "pc", P)], ["sambar powder", "tamarind", "oil"]),
  dish("avial", "Avial", "south-indian", "veg", LD, "veg",
    [i("Mixed vegetables", 130, "g", P), i("Grated coconut", 25, "g", P), i("Plain yogurt", 30, "g", D)], ["green chili", "cumin", "coconut oil", "curry leaves"]),
  dish("beetroot-poriyal", "Beetroot poriyal", "south-indian", "veg", LD, "veg",
    [i("Beetroot", 120, "g", P), i("Grated coconut", 10, "g", P)], ["mustard seeds", "urad dal", "curry leaves"]),
  dish("keerai-masiyal", "Keerai (spinach) masiyal", "south-indian", "veg", LD, "veg",
    [i("Spinach", 120, "g", P)], ["garlic", "cumin", "green chili"]),
  dish("chow-chow-kootu", "Chow chow kootu", "south-indian", "veg", LD, "veg",
    [i("Chayote (chow chow)", 120, "g", P), i("Moong dal", 15, "g", PA), i("Grated coconut", 10, "g", P)], ["cumin", "green chili"]),
  dish("fish-fry", "Fish fry", "south-indian", "protein", LD, "nonveg",
    [i("Fish (kingfish/tilapia)", 150, "g", M)], ["chili powder", "turmeric", "ginger-garlic paste", "lemon", "oil"], [], true),
  dish("fish-curry", "Fish curry (meen kuzhambu)", "south-indian", "protein", LD, "nonveg",
    [i("Fish (kingfish/tilapia)", 150, "g", M), i("Tamarind", 8, "g", PA), i("Tomato", 0.5, "pc", P), i("Shallots", 30, "g", P)], ["fish curry masala", "fenugreek", "gingelly oil"]),
  dish("chicken-chettinad", "Chicken chettinad", "south-indian", "protein", LD, "nonveg",
    [i("Chicken (bone-in)", 200, "g", M), i("Onion", 0.5, "pc", P), i("Tomato", 0.5, "pc", P)], ["chettinad masala", "pepper", "fennel", "curry leaves", "oil"], [], true),
  dish("pepper-chicken", "Pepper chicken", "south-indian", "protein", LD, "nonveg",
    [i("Chicken (boneless)", 180, "g", M), i("Onion", 0.5, "pc", P)], ["black pepper", "ginger-garlic paste", "curry leaves", "oil"]),
  dish("prawn-masala", "Prawn masala", "south-indian", "protein", LD, "nonveg",
    [i("Prawns (shrimp)", 150, "g", M), i("Onion", 0.5, "pc", P), i("Tomato", 0.5, "pc", P)], ["chili powder", "turmeric", "garam masala", "oil"], [], true),
  dish("egg-curry", "Egg curry", "south-indian", "protein", LD, "egg",
    [i("Eggs", 2, "pc", D), i("Onion", 0.5, "pc", P), i("Tomato", 0.5, "pc", P)], ["chili powder", "coriander powder", "garam masala"]),
  dish("mutton-kuzhambu", "Mutton kuzhambu", "south-indian", "protein", LD, "nonveg",
    [i("Mutton (goat)", 180, "g", M), i("Onion", 0.5, "pc", P), i("Tomato", 0.5, "pc", P)], ["kuzhambu masala", "ginger-garlic paste", "oil"]),

  // ---------- North Indian ----------
  dish("aloo-paratha", "Aloo paratha", "north-indian", "breakfast", B, "veg",
    [i("Atta (whole wheat flour)", 70, "g", G), i("Potatoes", 100, "g", P)], ["ghee", "cumin", "green chili"], [curd, pickle, add("butter", "Butter", i("Butter", 10, "g", D))], true),
  dish("chapati", "Chapati / roti", "north-indian", "starch", LD, "veg", [i("Atta (whole wheat flour)", 70, "g", G)], ["ghee or oil"], [], true),
  dish("naan", "Naan (store-bought)", "north-indian", "starch", LD, "veg", [i("Naan", 1.5, "pc", G)]),
  dish("jeera-rice", "Jeera rice", "north-indian", "starch", LD, "veg", [i("Basmati rice", 75, "g", G)], ["cumin", "ghee"]),
  dish("dal-tadka", "Dal tadka", "north-indian", "dal", LD, "veg",
    [i("Toor dal", 40, "g", PA), i("Tomato", 0.5, "pc", P), i("Onion", 0.25, "pc", P)], ["cumin", "garlic", "ghee", "chili powder"], [], true),
  dish("rajma", "Rajma", "north-indian", "dal", LD, "veg",
    [i("Kidney beans (dry)", 50, "g", PA), i("Onion", 0.5, "pc", P), i("Tomato", 1, "pc", P)], ["ginger-garlic paste", "garam masala"]),
  dish("chana-masala", "Chana masala", "north-indian", "veg", LD, "veg",
    [i("Chickpeas (dry)", 50, "g", PA), i("Onion", 0.5, "pc", P), i("Tomato", 1, "pc", P)], ["chana masala powder", "ginger-garlic paste"], [], true),
  dish("paneer-butter-masala", "Paneer butter masala", "north-indian", "veg", LD, "veg",
    [i("Paneer", 100, "g", D), i("Tomato", 1, "pc", P), i("Cream", 20, "ml", D), i("Butter", 10, "g", D)], ["kasuri methi", "garam masala"], [], true),
  dish("palak-paneer", "Palak paneer", "north-indian", "veg", LD, "veg",
    [i("Spinach", 150, "g", P), i("Paneer", 90, "g", D)], ["garlic", "cumin", "garam masala"]),
  dish("aloo-gobi", "Aloo gobi", "north-indian", "veg", LD, "veg",
    [i("Cauliflower", 120, "g", P), i("Potatoes", 70, "g", P)], ["turmeric", "cumin", "coriander powder"], [], true),
  dish("bhindi-masala", "Bhindi masala", "north-indian", "veg", LD, "veg",
    [i("Okra", 120, "g", P), i("Onion", 0.5, "pc", P)], ["amchur", "chili powder", "oil"]),
  dish("butter-chicken", "Butter chicken", "north-indian", "protein", LD, "nonveg",
    [i("Chicken (boneless)", 180, "g", M), i("Tomato", 1, "pc", P), i("Cream", 25, "ml", D), i("Butter", 10, "g", D)], ["kasuri methi", "garam masala", "ginger-garlic paste"], [], true),
  dish("chicken-biryani", "Chicken biryani", "north-indian", "main", LD, "nonveg",
    [i("Basmati rice", 90, "g", G), i("Chicken (bone-in)", 180, "g", M), i("Onion", 0.75, "pc", P), i("Plain yogurt", 40, "g", D)], ["biryani masala", "ghee", "mint", "ginger-garlic paste"], [raita], true),
  dish("veg-pulao", "Veg pulao", "north-indian", "main", LD, "veg",
    [i("Basmati rice", 80, "g", G), i("Mixed vegetables", 80, "g", P)], ["whole spices", "ghee"], [raita]),

  // ---------- Chinese ----------
  dish("veg-fried-rice", "Veg fried rice", "chinese", "starch", LD, "veg",
    [i("Rice (sona masoori/basmati)", 75, "g", G), i("Mixed vegetables", 70, "g", P), i("Spring onions", 10, "g", P)], ["soy sauce", "oil", "garlic"], [friedEgg], true),
  dish("plain-noodles", "Garlic noodles", "chinese", "starch", LD, "veg", [i("Noodles", 80, "g", G)], ["soy sauce", "garlic", "oil"]),
  dish("chicken-fried-rice", "Chicken fried rice", "chinese", "main", LD, "nonveg",
    [i("Rice (sona masoori/basmati)", 80, "g", G), i("Chicken (boneless)", 100, "g", M), i("Eggs", 1, "pc", D), i("Mixed vegetables", 50, "g", P)], ["soy sauce", "oil"], [], true),
  dish("hakka-noodles", "Veg hakka noodles", "chinese", "main", LD, "veg",
    [i("Noodles", 90, "g", G), i("Cabbage", 40, "g", P), i("Bell pepper", 0.33, "pc", P), i("Carrots", 30, "g", P)], ["soy sauce", "vinegar", "chili sauce"], [], true),
  dish("kung-pao-chicken", "Kung pao chicken", "chinese", "protein", LD, "nonveg",
    [i("Chicken (boneless)", 170, "g", M), i("Peanuts", 15, "g", PA), i("Bell pepper", 0.33, "pc", P)], ["soy sauce", "dried red chilies", "cornstarch", "sugar", "vinegar"], [], true),
  dish("orange-chicken", "Orange chicken", "chinese", "protein", LD, "nonveg",
    [i("Chicken (boneless)", 170, "g", M), i("Orange", 0.5, "pc", P)], ["cornstarch", "soy sauce", "sugar", "oil"]),
  dish("beef-broccoli", "Beef & broccoli", "chinese", "protein", LD, "nonveg",
    [i("Beef (flank)", 150, "g", M), i("Broccoli", 100, "g", P)], ["soy sauce", "oyster sauce", "garlic", "cornstarch"], [], true),
  dish("chili-paneer", "Chili paneer", "chinese", "protein", LD, "veg",
    [i("Paneer", 100, "g", D), i("Bell pepper", 0.5, "pc", P), i("Onion", 0.5, "pc", P)], ["soy sauce", "chili sauce", "cornstarch"]),
  dish("mapo-tofu", "Mapo tofu", "chinese", "protein", LD, "veg",
    [i("Firm tofu", 150, "g", D)], ["chili bean paste", "Sichuan pepper", "garlic", "soy sauce"]),
  dish("garlic-bok-choy", "Garlic bok choy", "chinese", "veg", LD, "veg", [i("Bok choy", 150, "g", P)], ["garlic", "soy sauce", "oil"], [], true),
  dish("veg-stir-fry", "Mixed veg stir-fry", "chinese", "veg", LD, "veg",
    [i("Mixed vegetables", 150, "g", P)], ["soy sauce", "garlic", "ginger", "oil"]),
  dish("hot-sour-soup", "Hot & sour soup", "chinese", "dal", LD, "veg",
    [i("Mushrooms", 40, "g", P), i("Firm tofu", 40, "g", D)], ["soy sauce", "vinegar", "white pepper", "cornstarch"]),

  // ---------- Mexican ----------
  dish("breakfast-burrito", "Breakfast burrito", "mexican", "breakfast", B, "egg",
    [i("Tortillas (large)", 1, "pc", G), i("Eggs", 2, "pc", D), i("Shredded cheese", 20, "g", D)], ["salsa"], [avocado]),
  dish("chicken-burrito-bowl", "Chicken burrito bowl", "mexican", "main", LD, "nonveg",
    [i("Rice (sona masoori/basmati)", 60, "g", G), i("Chicken breast", 130, "g", M), i("Black beans (can)", 80, "g", PA), i("Corn (frozen)", 40, "g", F), i("Shredded cheese", 20, "g", D)], ["taco seasoning", "salsa", "lime"], [avocado, add("sour-cream", "Sour cream", i("Sour cream", 30, "g", D))], true),
  dish("tacos", "Ground beef tacos", "mexican", "main", LD, "nonveg",
    [i("Taco shells / small tortillas", 3, "pc", G), i("Ground beef", 120, "g", M), i("Lettuce", 20, "g", P), i("Shredded cheese", 20, "g", D), i("Tomato", 0.5, "pc", P)], ["taco seasoning", "salsa"], [avocado], true),
  dish("bean-quesadilla", "Bean & cheese quesadilla", "mexican", "main", LD, "veg",
    [i("Tortillas (large)", 1, "pc", G), i("Black beans (can)", 70, "g", PA), i("Shredded cheese", 40, "g", D)], ["salsa"], [add("sour-cream", "Sour cream", i("Sour cream", 30, "g", D))], true),
  dish("chicken-fajitas", "Chicken fajitas", "mexican", "main", LD, "nonveg",
    [i("Tortillas (small)", 3, "pc", G), i("Chicken breast", 140, "g", M), i("Bell pepper", 0.75, "pc", P), i("Onion", 0.5, "pc", P)], ["fajita seasoning", "lime", "oil"], [avocado, cheese]),

  // ---------- Italian ----------
  dish("spaghetti-marinara", "Spaghetti marinara", "italian", "main", LD, "veg",
    [i("Spaghetti", 100, "g", G), i("Marinara sauce (jar)", 120, "ml", PA), i("Parmesan", 10, "g", D)], ["olive oil", "garlic"], [garlicBread, sideSalad], true),
  dish("spaghetti-meatballs", "Spaghetti & meatballs", "italian", "main", LD, "nonveg",
    [i("Spaghetti", 100, "g", G), i("Frozen meatballs", 120, "g", F), i("Marinara sauce (jar)", 120, "ml", PA)], [], [garlicBread]),
  dish("chicken-alfredo", "Chicken Alfredo", "italian", "main", LD, "nonveg",
    [i("Fettuccine", 100, "g", G), i("Chicken breast", 120, "g", M), i("Alfredo sauce (jar)", 100, "ml", PA)], [], [garlicBread, add("broccoli-add", "Broccoli", i("Broccoli", 60, "g", P))], true),
  dish("pesto-pasta", "Pesto pasta", "italian", "main", LD, "veg",
    [i("Penne", 100, "g", G), i("Pesto (jar)", 40, "g", PA), i("Cherry tomatoes", 60, "g", P)], ["olive oil"]),
  dish("homemade-pizza", "Homemade pizza", "italian", "main", LD, "veg",
    [i("Pizza dough / base", 0.5, "pc", G), i("Mozzarella", 60, "g", D), i("Pizza sauce", 50, "ml", PA), i("Bell pepper", 0.25, "pc", P)], ["oregano"], [add("pepperoni", "Pepperoni", i("Pepperoni", 30, "g", M))]),
  dish("caprese-salad", "Caprese salad", "italian", "salad", LD, "veg",
    [i("Fresh mozzarella", 80, "g", D), i("Tomato", 1, "pc", P), i("Basil", 5, "g", P)], ["olive oil", "balsamic"]),

  // ---------- Mediterranean ----------
  dish("greek-salad", "Greek salad", "mediterranean", "salad", LD, "veg",
    [i("Cucumber", 0.5, "pc", P), i("Tomato", 1, "pc", P), i("Feta", 40, "g", D), i("Olives", 20, "g", PA), i("Red onion", 0.25, "pc", P)], ["olive oil", "oregano"], [add("grilled-chicken", "Grilled chicken", i("Chicken breast", 120, "g", M))], true),
  dish("falafel-wrap", "Falafel wrap", "mediterranean", "main", LD, "veg",
    [i("Pita bread", 1, "pc", G), i("Frozen falafel", 5, "pc", F), i("Hummus", 40, "g", D), i("Lettuce", 20, "g", P), i("Tomato", 0.5, "pc", P)], ["tahini"], [], true),
  dish("chicken-shawarma-bowl", "Chicken shawarma bowl", "mediterranean", "main", LD, "nonveg",
    [i("Rice (sona masoori/basmati)", 60, "g", G), i("Chicken thighs", 150, "g", M), i("Cucumber", 0.33, "pc", P), i("Hummus", 40, "g", D)], ["shawarma spice", "garlic sauce", "lemon"], [add("pita", "Pita bread", i("Pita bread", 1, "pc", G))]),
  dish("lentil-soup", "Lentil soup", "mediterranean", "dal", LD, "veg",
    [i("Red lentils", 50, "g", PA), i("Carrots", 40, "g", P), i("Onion", 0.25, "pc", P)], ["cumin", "olive oil", "lemon"], [add("pita", "Pita bread", i("Pita bread", 1, "pc", G))]),
  dish("couscous", "Couscous", "mediterranean", "starch", LD, "veg", [i("Couscous", 70, "g", G)], ["olive oil", "salt"]),
];
