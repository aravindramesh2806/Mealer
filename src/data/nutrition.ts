// Approximate nutrition per ingredient: [kcal, protein g, carbs g, fat g].
// Ingredients measured in g or ml: values per 100 g / 100 ml, as bought (raw meat, dry rice, dry pasta, dry lentils).
// Ingredients measured in pc or slice: values per piece / slice.
// These are typical values from public food tables (USDA-style), rounded. Brands and cuts vary; treat totals as estimates.
// Pantry items (oil, spices, sauces listed under "pantry") are not counted.

export type Macro = [kcal: number, protein: number, carbs: number, fat: number];

export const NUTRITION: Record<string, Macro> = {
  // ---- Grains, bread, pasta (dry) ----
  "Arborio rice": [350, 7, 79, 1],
  "Atta (whole wheat flour)": [340, 12, 72, 2],
  "Basmati rice": [350, 8, 78, 1],
  "Brown rice": [365, 8, 76, 3],
  "Breadcrumbs": [395, 13, 72, 5],
  "Breakfast cereal": [380, 7, 84, 2],
  "Bulgur": [342, 12, 76, 1],
  "Cornbread mix": [420, 6, 70, 12],
  "Couscous": [376, 13, 77, 1],
  "Croutons": [410, 11, 70, 9],
  "Egg noodles": [384, 14, 71, 4],
  "Elbow macaroni": [371, 13, 75, 2],
  "Fettuccine": [371, 13, 75, 2],
  "Glutinous rice": [370, 7, 81, 1],
  "Gnocchi": [150, 4, 32, 1],
  "Granola": [470, 10, 64, 20],
  "Jasmine rice": [355, 7, 79, 1],
  "Korean rice cakes": [230, 4, 51, 1],
  "Lasagna sheets": [371, 13, 75, 2],
  "Linguine": [371, 13, 75, 2],
  "Lo mein noodles": [380, 13, 74, 3],
  "Long-grain rice": [360, 7, 80, 1],
  "Noodles": [380, 13, 74, 3],
  "Orzo": [371, 13, 75, 2],
  "Pancake mix": [370, 9, 74, 4],
  "Panko": [395, 13, 76, 3],
  "Penne": [371, 13, 75, 2],
  "Poha (flattened rice)": [350, 7, 77, 1],
  "Polenta / cornmeal": [370, 8, 79, 2],
  "Ramen noodles": [380, 11, 73, 4],
  "Rava (sooji)": [360, 13, 73, 1],
  "Raw rice": [360, 7, 80, 1],
  "Rice (sona masoori/basmati)": [355, 7, 79, 1],
  "Rice noodles": [364, 6, 80, 1],
  "Rice vermicelli": [360, 6, 80, 1],
  "Rolled oats": [380, 13, 67, 7],
  "Short-grain rice": [358, 7, 79, 1],
  "Small pasta": [371, 13, 75, 2],
  "Spaghetti": [371, 13, 75, 2],
  "Sweet potato glass noodles": [350, 0, 86, 0],
  "Vermicelli": [360, 12, 75, 1],
  "Wide rice noodles": [190, 3, 42, 1], // fresh
  "Yakisoba noodles": [190, 6, 36, 2],  // fresh
  "Ziti or penne": [371, 13, 75, 2],
  // per piece / slice
  "Bagels": [270, 10, 53, 2],
  "Baguette": [70, 2, 14, 1],           // slice
  "Bolillo or baguette": [230, 8, 46, 2],
  "Bread": [80, 3, 14, 1],              // slice
  "Burger buns": [140, 5, 26, 2],
  "Croissants": [230, 5, 26, 12],
  "Crusty bread": [80, 3, 15, 1],       // slice
  "Dinner rolls": [85, 3, 15, 2],
  "English muffin": [130, 5, 26, 1],
  "Fried dough sticks": [230, 4, 26, 12],
  "Frozen udon": [210, 6, 43, 1],
  "Frozen waffles": [95, 2, 15, 3],
  "Naan": [260, 9, 45, 5],
  "Papad": [35, 2, 6, 0],
  "Pie crust (frozen)": [900, 10, 90, 55],
  "Pita bread": [165, 5, 33, 1],
  "Pizza dough / base": [700, 22, 135, 8],
  "Puff pastry sheet": [1300, 18, 110, 85],
  "Rice paper": [35, 0, 8, 0],
  "Taco shells / small tortillas": [60, 1, 8, 3],
  "Tortillas (large)": [210, 6, 35, 5],
  "Tortillas (small)": [60, 2, 12, 1],

  // ---- Meat, fish, eggs ----
  "Bacon": [45, 3, 0, 3.5],            // slice, cooked
  "Beef (flank)": [155, 21, 0, 8],
  "Beef sirloin": [180, 21, 0, 10],
  "Beef stew meat": [170, 20, 0, 10],
  "Breakfast sausage": [100, 5, 1, 9], // patty
  "Canned tuna": [120, 26, 0, 1],      // 142 g can, drained
  "Chicken (bone-in)": [150, 18, 0, 9],
  "Chicken (boneless)": [140, 22, 0, 6],
  "Chicken breast": [120, 23, 0, 3],
  "Chicken thighs": [145, 19, 0, 8],
  "Chicken wings": [200, 18, 0, 14],
  "Deli turkey": [105, 17, 3, 2],
  "Eggs": [72, 6, 0.4, 5],             // each
  "Fish (kingfish/tilapia)": [105, 21, 0, 2],
  "Flank or skirt steak": [155, 21, 0, 8],
  "Frozen meatballs": [270, 13, 8, 21],
  "Ground beef": [250, 17, 0, 20],
  "Ground chicken": [145, 17, 0, 8],
  "Ground pork": [265, 17, 0, 21],
  "Ground turkey": [150, 19, 0, 8],
  "Ham": [145, 18, 2, 7],
  "Mutton (goat)": [145, 20, 0, 7],
  "Pepperoni": [500, 20, 1, 46],
  "Pork belly": [520, 9, 0, 53],
  "Pork chops": [170, 21, 0, 9],
  "Pork floss": [400, 30, 40, 13],
  "Pork shoulder": [215, 17, 0, 16],
  "Prawns (shrimp)": [85, 20, 0, 1],
  "Salmon fillet": [200, 20, 0, 13],
  "Smoked salmon": [117, 18, 0, 4],
  "Steak (sirloin/ribeye)": [220, 20, 0, 15],
  "Thin-sliced beef": [200, 19, 0, 13],
  "White fish fillet": [90, 19, 0, 1],

  // ---- Dairy, tofu, eggs-adjacent ----
  "Butter": [717, 1, 0, 81],
  "Cheese slices": [65, 4, 1, 5],      // slice
  "Cotija or feta": [300, 18, 3, 24],
  "Cream": [340, 2, 3, 36],
  "Cream cheese": [340, 6, 4, 34],
  "Dosa batter": [140, 4, 28, 1],
  "Feta": [265, 14, 4, 21],
  "Firm tofu": [145, 16, 3, 9],
  "Fresh mozzarella": [280, 20, 2, 21],
  "Fried tofu pouches": [70, 4, 1, 6], // each
  "Ghee": [900, 0, 0, 100],
  "Goat cheese": [365, 22, 0, 30],
  "Greek yogurt": [97, 9, 4, 5],
  "Gruyère": [413, 30, 0, 32],
  "Hummus": [166, 8, 14, 10],
  "Idli batter": [140, 4, 28, 1],
  "Kimchi": [15, 1, 2, 0.5],
  "Labneh or Greek yogurt": [150, 7, 4, 12],
  "Milk": [61, 3.2, 4.8, 3.3],
  "Mozzarella": [300, 22, 2, 22],
  "Paneer": [295, 18, 4, 23],
  "Parmesan": [420, 36, 3, 28],
  "Plain yogurt": [61, 3.5, 4.7, 3.3],
  "Queso fresco": [300, 18, 3, 24],
  "Ricotta": [174, 11, 3, 13],
  "Shredded cheese": [400, 23, 2, 33],
  "Sour cream": [198, 2.4, 4.6, 19],

  // ---- Legumes, nuts, seeds (dry unless "can") ----
  "Almonds": [580, 21, 22, 50],
  "Black beans (can)": [91, 6, 16, 0.3],
  "Brown lentils": [352, 25, 60, 1],
  "Cannellini beans (can)": [95, 7, 17, 0.4],
  "Chia seeds": [486, 17, 42, 31],
  "Chickpeas (can)": [120, 7, 20, 2.6],
  "Chickpeas (dry)": [364, 19, 61, 6],
  "Green (Puy) lentils": [352, 25, 60, 1],
  "Hominy (can)": [72, 1.5, 14, 1],
  "Kidney beans (can)": [84, 5, 15, 0.5],
  "Kidney beans (dry)": [333, 24, 60, 1],
  "Mixed nuts": [600, 18, 21, 54],
  "Moong dal": [347, 24, 63, 1],
  "Peanut butter": [590, 25, 20, 50],
  "Peanuts": [567, 26, 16, 49],
  "Red lentils": [358, 24, 63, 2],
  "Refried beans (can)": [90, 5, 15, 1],
  "Roasted chana dal": [370, 22, 58, 5],
  "Sesame seeds": [573, 18, 23, 50],
  "Sliced almonds": [580, 21, 22, 50],
  "Split mung beans": [347, 24, 63, 1],
  "Toor dal": [343, 22, 63, 1.5],
  "Urad dal": [341, 25, 59, 1.6],
  "Walnuts": [654, 15, 14, 65],
  "Natto": [90, 8, 6, 5],              // 45 g pack

  // ---- Fruit and vegetables ----
  "Apple": [95, 0.5, 25, 0.3],         // each
  "Ash gourd or okra": [25, 1, 5, 0.2],
  "Asian greens (morning glory/choy)": [20, 2, 3, 0.2],
  "Asian pear": [115, 1, 29, 0.6],     // each
  "Avocado": [240, 3, 13, 22],         // each
  "Baby potatoes": [77, 2, 17, 0.1],
  "Bamboo shoots / eggplant": [25, 1.5, 5, 0.2],
  "Banana": [105, 1.3, 27, 0.4],       // each
  "Basil": [23, 3, 3, 0.6],
  "Bean sprouts": [30, 3, 6, 0.2],
  "Beetroot": [43, 1.6, 10, 0.2],
  "Bell pepper": [30, 1, 7, 0.3],      // each
  "Berries": [50, 0.8, 12, 0.3],
  "Bok choy": [13, 1.5, 2, 0.2],
  "Broccoli": [34, 2.8, 7, 0.4],
  "Brussels sprouts": [43, 3.4, 9, 0.3],
  "Burdock root": [72, 1.5, 17, 0.2],
  "Cabbage": [25, 1.3, 6, 0.1],
  "Carrots": [41, 0.9, 10, 0.2],
  "Cauliflower": [25, 1.9, 5, 0.3],
  "Celery": [16, 0.7, 3, 0.2],
  "Chayote (chow chow)": [19, 0.8, 4.5, 0.1],
  "Cherry tomatoes": [18, 0.9, 3.9, 0.2],
  "Chinese broccoli (gai lan)": [22, 1.2, 4, 0.7],
  "Chives": [30, 3, 4, 0.7],
  "Cilantro": [23, 2, 4, 0.5],
  "Coleslaw mix": [25, 1.3, 6, 0.1],
  "Corn (frozen)": [88, 3, 21, 0.8],
  "Corn on the cob": [90, 3, 19, 1.4], // each
  "Cucumber": [45, 2, 11, 0.3],        // each
  "Eggplant": [130, 5, 30, 1],         // each (~550 g)
  "Eggplant (small)": [25, 1, 6, 0.2],
  "French beans": [31, 1.8, 7, 0.2],
  "Frozen berries": [50, 0.7, 12, 0.3],
  "Frozen mixed vegetables": [65, 3, 13, 0.5],
  "Ginger": [80, 1.8, 18, 0.8],
  "Green beans": [31, 1.8, 7, 0.2],
  "Green chili": [4, 0.2, 0.9, 0],     // each
  "Green onions": [32, 1.8, 7, 0.2],
  "Green papaya": [39, 0.6, 10, 0.1],
  "Kale": [49, 4.3, 9, 0.9],
  "Leeks": [55, 1.3, 13, 0.3],         // each
  "Lemon": [17, 0.6, 5, 0.2],          // each
  "Lemongrass": [5, 0.1, 1, 0],        // stalk
  "Lettuce": [15, 1.4, 3, 0.2],
  "Lime": [20, 0.5, 7, 0.1],           // each
  "Mango": [200, 2.8, 50, 1.3],        // each
  "Mixed greens": [20, 2, 3, 0.3],
  "Mixed vegetables": [50, 2.5, 10, 0.3],
  "Mushrooms": [22, 3, 3, 0.3],
  "Okra": [33, 1.9, 7, 0.2],
  "Olives": [115, 0.8, 6, 11],
  "Onion": [44, 1.2, 10, 0.1],         // each
  "Orange": [62, 1.2, 15, 0.2],        // each
  "Parsley": [36, 3, 6, 0.8],
  "Pineapple": [50, 0.5, 13, 0.1],
  "Potatoes": [77, 2, 17, 0.1],
  "Red onion": [44, 1.2, 10, 0.1],     // each
  "Ripe plantains": [218, 2.3, 57, 0.7], // each
  "Romaine lettuce": [17, 1.2, 3, 0.3],
  "Russet potatoes": [290, 8, 64, 0.3],  // each (~370 g)
  "Shallots": [72, 2.5, 17, 0.1],
  "Soybean sprouts": [122, 13, 10, 7],
  "Spinach": [23, 2.9, 3.6, 0.4],
  "Spring onions": [32, 1.8, 7, 0.2],
  "Sweet potato": [86, 1.6, 20, 0.1],
  "Thai basil": [23, 3, 3, 0.6],
  "Tomato": [22, 1.1, 4.8, 0.2],       // each
  "Wakame": [45, 3, 9, 0.6],
  "Watercress": [11, 2.3, 1.3, 0.1],
  "Zucchini": [33, 2.4, 6, 0.6],       // each

  // ---- Pantry, sauces, jars and cans (as bought) ----
  "Alfredo sauce (jar)": [150, 3, 4, 14],
  "BBQ sauce": [170, 1, 41, 0.6],
  "Caesar dressing": [450, 2, 3, 47],
  "Capers": [23, 2, 5, 0.9],
  "Chicken or veg stock": [5, 0.5, 0.5, 0.2],
  "Chipotles in adobo": [60, 1, 9, 2],
  "Chocolate chips": [480, 4, 64, 24],
  "Coconut milk (can)": [197, 2, 3, 21],
  "Crushed tomatoes (can)": [32, 1.6, 7, 0.3],
  "Doenjang": [130, 12, 13, 4],
  "Enchilada sauce (can)": [30, 1, 5, 1],
  "Grated coconut": [354, 3.3, 15, 33],
  "Green curry paste": [100, 2, 12, 5],
  "Jam": [250, 0.4, 65, 0.1],
  "Japanese curry roux": [510, 6, 45, 34],
  "Maple syrup": [260, 0, 67, 0],
  "Marinara sauce (jar)": [50, 1.5, 8, 1.5],
  "Massaman curry paste": [150, 3, 15, 9],
  "Miso paste": [200, 12, 26, 6],
  "Pesto (jar)": [450, 5, 6, 45],
  "Pickle": [200, 1, 6, 19],
  "Pizza sauce": [40, 1.5, 7, 1],
  "Protein powder": [380, 75, 10, 5],
  "Red curry paste": [100, 2, 12, 5],
  "Salsa verde (jar)": [30, 1, 6, 0.5],
  "Tamarind": [239, 2.8, 62, 0.6],
  "Tomato soup (carton)": [35, 1, 7, 0.5],
  "Tortilla chips": [490, 7, 64, 23],
  // per piece
  "Frozen falafel": [57, 2.3, 5, 3],
  "Frozen pork dumplings": [45, 2, 5, 2],
  "Frozen scallion pancakes": [300, 5, 35, 15],
  "Frozen spanakopita": [180, 5, 14, 12],
  "Frozen veg bao": [140, 4, 26, 2],
  "Frozen veggie patties": [130, 10, 12, 5],
  "Frozen wontons": [40, 2, 5, 1.5],
  "Nori sheets": [5, 1, 0.5, 0],
  "Seasoned seaweed snacks": [30, 1, 1, 2],
  "Frozen fries": [150, 2.4, 24, 5],   // per 100 g
};
