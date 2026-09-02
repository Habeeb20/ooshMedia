// Add your other categories alongside this one — PopularFood only reads
// the "groceries" entry's subcategories to build its filter pills.
const categories = [
  {
    id: "groceries",
    name: "Groceries & Food",
    icon: "🛒",
    subcategories: [
      "fast food",
      "swallow",
      "Cooking Oil",
      "Spices",
      "Snacks",
      "cakes",
      "drink",
      "Beverages",
    ],
  },
  {
    id: "drinks",
    name: "drinks",
    icon: "🛒",
    subcategories: [
      "soft drink",
      "Alcohol",
      "Energy drinks",
      "Water",
      "Juices",
      "Hot drinks",
  
    ],
  },
  // ...your other categories
];

export default categories;