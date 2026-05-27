export const productCategories = [
  {
    id: "electronics",
    name: "Electronics",
    icon: "📱",
    subcategories: [
      "Smartphones", "Laptops", "Tablets", "Accessories", 
      "Televisions", "Audio Devices"
    ]
  },
  {
    id: "mobile-accessories",
    name: "Mobile Phones & Accessories",
    icon: "📲",
    subcategories: [
      "Phone Cases", "Chargers", "Power Banks", 
      "Screen Protectors", "Earphones"
    ]
  },
  {
    id: "computers",
    name: "Computers & Laptops",
    icon: "💻",
    subcategories: [
      "Desktops", "Laptops", "Monitors", "Printers", "Storage Devices"
    ]
  },
  {
    id: "gaming",
    name: "Gaming",
    icon: "🎮",
    subcategories: [
      "Consoles", "Gaming Accessories", "Video Games", "Gaming Chairs"
    ]
  },
  {
    id: "home-appliances",
    name: "Home Appliances",
    icon: "🏠",
    subcategories: [
      "Refrigerators", "Washing Machines", "Air Conditioners", "Fans"
    ]
  },
  {
    id: "kitchen",
    name: "Kitchen Appliances",
    icon: "🍳",
    subcategories: [
      "Microwaves", "Blenders", "Cookers", "Toasters"
    ]
  },
  {
    id: "fashion",
    name: "Fashion",
    icon: "👕",
    subcategories: [
      "Men's Fashion", "Women's Fashion", "Kids Fashion"
    ]
  },
  {
    id: "beauty",
    name: "Beauty & Personal Care",
    icon: "💄",
    subcategories: [
      "Skincare", "Makeup", "Hair Care", "Fragrances"
    ]
  },
  {
    id: "health",
    name: "Health & Wellness",
    icon: "💊",
    subcategories: [
      "Supplements", "Fitness Equipment", "Medical Devices"
    ]
  },
  {
    id: "groceries",
    name: "Groceries & Food",
    icon: "🛒",
    subcategories: [
      "Rice", "Beans", "Cooking Oil", "Spices", "Snacks", "Beverages"
    ]
  },
  {
    id: "baby",
    name: "Baby Products",
    icon: "🍼",
    subcategories: [
      "Diapers", "Baby Food", "Strollers", "Baby Toys"
    ]
  },
  {
    id: "sports",
    name: "Sports & Fitness",
    icon: "⚽",
    subcategories: [
      "Gym Equipment", "Sportswear", "Football", "Basketball"
    ]
  },
  {
    id: "automotive",
    name: "Automotive",
    icon: "🚗",
    subcategories: [
      "Car Accessories", "Motor Oils", "Tyres", "Car Electronics"
    ]
  },
  {
    id: "home-furniture",
    name: "Home & Furniture",
    icon: "🛋️",
    subcategories: [
      "Sofas", "Beds", "Tables", "Chairs"
    ]
  },
  {
    id: "pet",
    name: "Pet Supplies",
    icon: "🐾",
    subcategories: [
      "Dog Food", "Cat Food", "Pet Toys", "Pet Beds"
    ]
  },
  {
    id: "books",
    name: "Books & Stationery",
    icon: "📚",
    subcategories: [
      "Books", "Notebooks", "Pens", "School Supplies"
    ]
  }
];

// For easy dropdown or selection
export const productCategoryList = productCategories.map(cat => ({
  id: cat.id,
  name: cat.name,
  icon: cat.icon
}));