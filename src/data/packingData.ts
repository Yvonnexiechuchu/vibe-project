export type Category =
  | "Essentials"
  | "Clothes"
  | "Personal Hygiene"
  | "Electronics"
  | "Makeup Bag"
  | "Camera Gear"
  | "Other";

export type TripLength = "weekend" | "short" | "long" | "extended";
export type Season = "spring" | "summer" | "fall" | "winter";
export type DestinationVibe = "city" | "outdoor" | "camping" | "beach" | "business";

export interface PackingItem {
  id: string;
  name: string;
  category: Category;
  packed: boolean;
  isCustom?: boolean;
}

export const categoryIcons: Record<Category, string> = {
  Essentials: "🧳",
  Clothes: "👔",
  "Personal Hygiene": "🧴",
  Electronics: "💻",
  "Makeup Bag": "💄",
  "Camera Gear": "📷",
  Other: "📦",
};

const baseEssentials = [
  "Passport",
  "Wallet",
  "ID Card",
  "Other Travel Documents",
  "Credit Cards",
  "Local Cash",
  "Driver License",
  "Keys",
];

const baseClothes: Record<Season, string[]> = {
  spring: [
    "Light Jacket",
    "T-Shirts",
    "Jeans",
    "Sneakers",
    "Light Sweater",
    "Underwear",
    "Socks",
    "Pajamas",
    "Slippers",
  ],
  summer: [
    "Shorts",
    "T-Shirts",
    "Tank Tops",
    "Sandals",
    "Sunglasses",
    "Underwear",
    "Socks",
    "Pajamas",
    "Slippers",
  ],
  fall: [
    "Warm Jacket",
    "Long Sleeve Shirts",
    "Jeans",
    "Boots",
    "Scarf",
    "Underwear",
    "Socks",
    "Pajamas",
    "Slippers",
  ],
  winter: [
    "Heavy Coat",
    "Sweaters",
    "Thermal Underwear",
    "Winter Boots",
    "Gloves",
    "Beanie",
    "Warm Socks",
    "Pajamas",
    "Slippers",
  ],
};

const baseHygiene = [
  "Toothbrush",
  "Toothpaste",
  "Shampoo",
  "Conditioner",
  "Body Wash",
  "Deodorant",
  "Sunscreen",
  "Face Wash",
  "Moisturizer",
  "Makeup Remover",
  "Retainer",
  "Hair Band",
  "Face Tower",
  "Wet Tissue",
  "Comb",
];

const baseElectronics = [
  "Phone Charger",
  "Power Bank",
  "Headphones",
  "Travel Adapter",
  "Laptop",
  "Laptop Charger",
];

const baseMakeup = [
  "Foundation",
  "Brow Pencil",
  "Mascara",
  "Eye Shadow",
  "Eye Liner",
  "Lipstick",
  "Bronzer",
  "Brushes Set",
  "Setting Spray/Powder",
  "Foundation",
  "Make Up Sponge",
  "Concealer",
];

const baseCameraGear = [
  "Sony Camera Body",
  "Wide Lens",
  "Zoom Lens",
  "Tripod",
  "Memory Cards",
  "Camera Charger",
  "Pocekt 3",
  "Dji Nano",
  "Drone",
  "UV Lens",
  "Mic",
  "Back up Battery",
  "Sports Camera",
  "Fuji Camera",
  "Film Camera",
  "Flashing Light",
];

const baseOther = ["Carplay Cable","Snacks", "Water Bottle", "Neck Pillow", "Eye Mask", "Earplugs"];

const vibeExtras: Record<DestinationVibe, { category: Category; items: string[] }[]> = {
  city: [
    { category: "Clothes", items: ["Casual Blazer", "Dress Shoes"] },
    { category: "Other", items: ["City Map", "Day Backpack"] },
  ],
  outdoor: [
    { category: "Clothes", items: ["Hiking Boots", "Quick-Dry Pants", "Rain Jacket"] },
    { category: "Other", items: ["Backpack", "First Aid Kit", "Insect Repellent"] },
  ],
  camping: [
    { category: "Clothes", items: ["Hiking Boots", "Layered Clothing", "Rain Poncho"] },
    { category: "Other", items: ["Tent", "Sleeping Bag", "Flashlight", "Multi-tool", "Fire Starter"] },
  ],
  beach: [
    { category: "Clothes", items: ["Swimsuit", "Cover-Up", "Flip Flops"] },
    { category: "Other", items: ["Beach Towel", "Beach Bag", "Aloe Vera Gel"] },
  ],
  business: [
    { category: "Clothes", items: ["Business Suit", "Dress Shirts", "Dress Shoes", "Tie/Accessories"] },
    { category: "Other", items: ["Business Cards", "Portfolio/Briefcase", "Notebook"] },
  ],
};

let idCounter = 0;

function createItem(name: string, category: Category): PackingItem {
  return {
    id: `item-${idCounter++}`,
    name,
    category,
    packed: false,
  };
}

export function generatePackingList(
  tripLength: TripLength,
  season: Season,
  vibes: DestinationVibe[]
): PackingItem[] {
  idCounter = 0;
  const items: PackingItem[] = [];

  // Essentials
  baseEssentials.forEach((name) => items.push(createItem(name, "Essentials")));

  // Clothes based on season
  baseClothes[season].forEach((name) => items.push(createItem(name, "Clothes")));

  // Personal Hygiene
  baseHygiene.forEach((name) => items.push(createItem(name, "Personal Hygiene")));

  // Electronics
  baseElectronics.forEach((name) => items.push(createItem(name, "Electronics")));

  // Makeup
  baseMakeup.forEach((name) => items.push(createItem(name, "Makeup Bag")));

  // Camera Gear
  baseCameraGear.forEach((name) => items.push(createItem(name, "Camera Gear")));

  // Other
  baseOther.forEach((name) => items.push(createItem(name, "Other")));

  // Add vibe-specific items
  const addedItems = new Set(items.map((i) => i.name));
  vibes.forEach((vibe) => {
    vibeExtras[vibe]?.forEach(({ category, items: extraItems }) => {
      extraItems.forEach((name) => {
        if (!addedItems.has(name)) {
          items.push(createItem(name, category));
          addedItems.add(name);
        }
      });
    });
  });

  // Add extra items for longer trips
  if (tripLength === "long" || tripLength === "extended") {
    const extras = [
      { name: "Laundry Bag", category: "Other" as Category },
      { name: "Extra Underwear", category: "Clothes" as Category },
      { name: "Travel Detergent", category: "Other" as Category },
    ];
    extras.forEach(({ name, category }) => {
      if (!addedItems.has(name)) {
        items.push(createItem(name, category));
        addedItems.add(name);
      }
    });
  }

  if (tripLength === "extended") {
    const extras = [
      { name: "Sewing Kit", category: "Other" as Category },
      { name: "Extra Charger", category: "Electronics" as Category },
      { name: "Portable Speaker", category: "Electronics" as Category },
    ];
    extras.forEach(({ name, category }) => {
      if (!addedItems.has(name)) {
        items.push(createItem(name, category));
        addedItems.add(name);
      }
    });
  }

  return items;
}
