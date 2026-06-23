
import im from "../assets/hair1.jpg";
import im2 from "../assets/hair2.jpg";
import im3 from "../assets/hair3.jpg";
import im4 from "../assets/hair4.jpg";
import im5 from "../assets/hair5.jpg";
import im6 from "../assets/hair6.jpg";
import painting from "../assets/Painting/p1.jpeg";
import painting2 from "../assets/Painting/p2.jpeg";
import painting3 from "../assets/Painting/p3.jpeg";
import painting4 from "../assets/Painting/p4.jpeg";
import painting5 from "../assets/Painting/p5.jpeg";
import painting6 from "../assets/Painting/p6.jpeg";
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
  },
  {
    id: "barbing",
    name: "Barbing",
    icon: "📚",
    subcategories: [
      "Clipper", "Blade"
    ]
  },



  {
    id: "furniture",
    name: "Furniture & Woodwork",
    icon: "🪑",
    pricing: {
      roadside:     { label: "Roadside",     min: 3000, max: 5000, unit: "per job" },
      standard:     { label: "Standard",     min: 5000, max: 8000, unit: "per job" },
      homeServices: { label: "Home Services", min: 7000, max: 12000, unit: "per job" },
      premium:      { label: "Premium",      min: 10000, max: 18000, unit: "per job" }
    },
    specialties: [
      { value: "carpentry", label: "Carpentry / Woodwork" },
      { value: "upholstery", label: "Upholstery & Reupholstery" },
      { value: "furniture-repair", label: "Furniture Repair & Restoration" },
      { value: "cabinet-making", label: "Custom Cabinet Making" },
      { value: "sofa-repair", label: "Sofa & Couch Repair" },
      { value: "wood-polishing", label: "Wood Polishing & Finishing" },
      { value: "bed-repair", label: "Bed Frame & Mattress Support Repair" }
    ]
  },

  {
    id: "mechanic",
    name: "Mechanic / Auto Services",
    icon: "🔧",
    pricing: {
      roadside:     { label: "Roadside",     min: 3000, max: 6000, unit: "per service" },
      standard:     { label: "Standard",     min: 5000, max: 10000, unit: "per service" },
      homeServices: { label: "Home Services", min: 8000, max: 15000, unit: "per service" },
      premium:      { label: "Premium",      min: 12000, max: 25000, unit: "per service" }
    },
    specialties: [
      { value: "general-mechanic", label: "General Auto Mechanic" },
      { value: "engine-repair", label: "Engine Repair & Overhaul" },
      { value: "transmission", label: "Transmission / Gearbox Repair" },
      { value: "brake-service", label: "Brake Repair & Replacement" },
      { value: "electrical", label: "Auto Electrical & Wiring" },
      { value: "ac-repair", label: "Car Air Conditioning Repair" },
      { value: "diagnostic", label: "Computer Diagnostics & Scanning" },
      { value: "generator-mechanic", label: "Generator Mechanic" },
      { value: "panel-beating", label: "Panel Beating & Spray Painting" }
    ]
  },

  {
    id: "cleaning",
    name: "Cleaning Services",
    icon: "🧹",
    pricing: {
      roadside:     { label: "Roadside",     min: 0, max: 0, unit: "N/A" },
      standard:     { label: "Standard",     min: 5000, max: 10000, unit: "per session" },
      homeServices: { label: "Home Services", min: 8000, max: 15000, unit: "per session" },
      premium:      { label: "Premium",      min: 12000, max: 20000, unit: "per session" }
    },
    specialties: [
      { value: "home-cleaning", label: "Home / Apartment Cleaning" },
      { value: "office-cleaning", label: "Office & Commercial Cleaning" },
      { value: "deep-cleaning", label: "Deep Cleaning / After Party" },
      { value: "carpet-cleaning", label: "Carpet & Rug Cleaning" },
      { value: "sofa-cleaning", label: "Sofa & Upholstery Cleaning" },
      { value: "marble-polishing", label: "Marble, Granite & Tile Polishing" },
      { value: "post-construction", label: "Post-Construction / Renovation Cleaning" }
    ]
  },

  {
    id: "plumbing",
    name: "Plumbing",
    icon: "🚰",
    pricing: {
      roadside:     { label: "Roadside",     min: 3000, max: 5000, unit: "per call" },
      standard:     { label: "Standard",     min: 5000, max: 8000, unit: "per call" },
      homeServices: { label: "Home Services", min: 7000, max: 12000, unit: "per call" },
      premium:      { label: "Premium",      min: 10000, max: 18000, unit: "per call" }
    },
    specialties: [
      { value: "general-plumbing", label: "General Plumbing" },
      { value: "leak-repair", label: "Leak Detection & Repair" },
      { value: "pipe-installation", label: "Pipe Installation & Replacement" },
      { value: "toilet-repair", label: "Toilet, Sink & Tap Repair" },
      { value: "water-heater", label: "Water Heater / Boiler Repair" },
      { value: "drain-unblocking", label: "Drain & Sewage Unblocking" },
      { value: "borehole-pump", label: "Borehole & Water Pump Services" }
    ]
  },

  {
    id: "electrical",
    name: "Electrical Services",
    icon: "⚡",
    pricing: {
      roadside:     { label: "Roadside",     min: 3000, max: 6000, unit: "per job" },
      standard:     { label: "Standard",     min: 5000, max: 9000, unit: "per job" },
      homeServices: { label: "Home Services", min: 8000, max: 14000, unit: "per job" },
      premium:      { label: "Premium",      min: 12000, max: 20000, unit: "per job" }
    },
    specialties: [
      { value: "house-wiring", label: "House / Building Wiring" },
      { value: "inverter-solar", label: "Inverter & Solar Panel Installation" },
      { value: "fault-finding", label: "Electrical Fault Finding & Repair" },
      { value: "lighting", label: "Lighting Installation & Design" },
      { value: "generator-install", label: "Generator Installation & Maintenance" },
      { value: "cctv", label: "CCTV & Security Camera Installation" },
      { value: "smart-home", label: "Smart Home & Automation Systems" }
    ]
  },

  {
    id: "painting",
    name: "Painting & Finishing",
    icon: "🎨",
    images: [painting, painting2, painting3, painting4, painting5, painting6],
    pricing: {
      roadside:     { label: "Roadside",     min: 0, max: 0, unit: "N/A" },
      standard:     { label: "Standard",     min: 5000, max: 10000, unit: "per room" },
      homeServices: { label: "Home Services", min: 8000, max: 15000, unit: "per room" },
      premium:      { label: "Premium",      min: 15000, max: 25000, unit: "per room" }
    },
    specialties: [
      { value: "interior-painting", label: "Interior Painting" },
      { value: "exterior-painting", label: "Exterior / Fence Painting" },
      { value: "pop-painting", label: "POP Ceiling & Plaster Painting" },
      { value: "textured", label: "Textured & Designer Wall Finishing" },
      { value: "roof-coating", label: "Roof Waterproofing & Coating" }
    ]
  },

  {
    id: "beauty",
    name: "Beauty & Personal Care",
    icon: "💅",
    pricing: {
      roadside:     { label: "Roadside",     min: 0, max: 0, unit: "N/A" },
      standard:     { label: "Standard",     min: 3000, max: 5000, unit: "per session" },
      homeServices: { label: "Home Services", min: 5000, max: 8000, unit: "per session" },
      premium:      { label: "Premium",      min: 7000, max: 12000, unit: "per session" }
    },
    specialties: [
      { value: "hairdressing", label: "Hair Dressing / Weaving / Braiding" },
      { value: "manicure-pedicure", label: "Manicure & Pedicure" },
      { value: "makeup", label: "Makeup (Bridal / Event / Everyday)" },
      { value: "barbing", label: "Barbing / Men's Haircut & Grooming" },
      { value: "massage", label: "Body Massage & Spa Services" },
      { value: "nail-tech", label: "Nail Technician (Gel, Acrylic, Extensions)" },
      { value: "facials", label: "Facials & Skincare Treatments" }
    ]
  },

  {
    id: "barbing",
    name: "Barbing",
    icon: "💈",
    images: [im, im2, im3, im4, im5, im6],
    pricing: {
      roadside:     { label: "Roadside",     min: 1000, max: 3500, unit: "per session" },
      standard:     { label: "Standard",     min: 3000, max: 10000, unit: "per session" },
      homeServices: { label: "Home Services", min: 5000, max: 20000, unit: "per session" },
      premium:      { label: "Premium",      min: 10000, max: 20000, unit: "per session" }
    },
    specialties: [
      { value: "shaving", label: "Shaving beards" },
      { value: "barbing", label: "Barbing / Men's Haircut & Grooming" }
    ]
  },

  {
    id: "construction",
    name: "Building & Construction",
    icon: "🏗️",
    images: [im, im2, im3, im4, im5, im6],
    pricing: {
      roadside:     { label: "Roadside",     min: 0, max: 0, unit: "N/A" },
      standard:     { label: "Standard",     min: 8000, max: 15000, unit: "per sqm / job" },
      homeServices: { label: "Home Services", min: 12000, max: 25000, unit: "per sqm / job" },
      premium:      { label: "Premium",      min: 20000, max: 40000, unit: "per sqm / job" }
    },
    specialties: [
      { value: "building-construction", label: "Building Construction" },
      { value: "renovation", label: "Home / Office Renovation" },
      { value: "tiling", label: "Floor & Wall Tiling" },
      { value: "roofing", label: "Roofing (Aluminum, Stone-coated)" },
      { value: "concrete", label: "Concrete Works & Flooring" },
      { value: "block-laying", label: "Block Laying & Plastering" }
    ]
  },

  {
    id: "ac-repair",
    name: "Air Conditioning & Refrigeration",
    icon: "❄️",
    pricing: {
      roadside:     { label: "Roadside",     min: 3000, max: 6000, unit: "per unit" },
      standard:     { label: "Standard",     min: 5000, max: 9000, unit: "per unit" },
      homeServices: { label: "Home Services", min: 7000, max: 12000, unit: "per unit" },
      premium:      { label: "Premium",      min: 10000, max: 18000, unit: "per unit" }
    },
    specialties: [
      { value: "split-unit", label: "Split AC Repair & Installation" },
      { value: "central-ac", label: "Central / Ducted AC" },
      { value: "fridge-repair", label: "Refrigerator & Freezer Repair" },
      { value: "cold-room", label: "Cold Room & Chiller Maintenance" },
      { value: "gas-refill", label: "AC Gas Refill & Pressure Testing" }
    ]
  },

  {
    id: "tailoring",
    name: "Tailoring & Fashion Design",
    icon: "🧵",
    pricing: {
      roadside:     { label: "Roadside",     min: 0, max: 0, unit: "N/A" },
      standard:     { label: "Standard",     min: 4000, max: 7000, unit: "per outfit" },
      homeServices: { label: "Home Services", min: 6000, max: 10000, unit: "per outfit" },
      premium:      { label: "Premium",      min: 8000, max: 15000, unit: "per outfit" }
    },
    specialties: [
      { value: "men-clothing", label: "Men's Native & Suits" },
      { value: "women-clothing", label: "Women’s Dresses & Gowns" },
      { value: "traditional", label: "Traditional / Aso-ebi Sewing" },
      { value: "alteration", label: "Clothing Alteration & Repair" },
      { value: "embroidery", label: "Embroidery & Beading" }
    ]
  },

  {
    id: "photography",
    name: "Photography & Videography",
    icon: "📸",
    pricing: {
      roadside:     { label: "Roadside",     min: 0, max: 0, unit: "N/A" },
      standard:     { label: "Standard",     min: 5000, max: 10000, unit: "per session" },
      homeServices: { label: "Home Services", min: 8000, max: 15000, unit: "per session" },
      premium:      { label: "Premium",      min: 15000, max: 30000, unit: "per session" }
    },
    specialties: [
      { value: "wedding", label: "Wedding Photography & Videography" },
      { value: "event", label: "Event Coverage (Birthday, Naming)" },
      { value: "studio", label: "Studio Portrait & Headshots" },
      { value: "drone", label: "Drone Aerial Photography" },
      { value: "product", label: "Product & E-commerce Photography" }
    ]
  },

  {
    id: "event-planning",
    name: "Event Planning & Decoration",
    icon: "🎉",
    pricing: {
      roadside:     { label: "Roadside",     min: 0, max: 0, unit: "N/A" },
      standard:     { label: "Standard",     min: 10000, max: 20000, unit: "per event" },
      homeServices: { label: "Home Services", min: 15000, max: 30000, unit: "per event" },
      premium:      { label: "Premium",      min: 25000, max: 50000, unit: "per event" }
    },
    specialties: [
      { value: "wedding-planning", label: "Wedding Planning & Coordination" },
      { value: "decoration", label: "Event Decoration & Setup" },
      { value: "mc", label: "Master of Ceremony (MC)" },
      { value: "catering", label: "Catering Services" },
      { value: "dj", label: "DJ & Sound Services" }
    ]
  },

  {
    id: "home-tutor",
    name: "Home Tutoring & Lessons",
    icon: "📚",
    pricing: {
      roadside:     { label: "Roadside",     min: 0, max: 0, unit: "N/A" },
      standard:     { label: "Standard",     min: 3000, max: 6000, unit: "per hour" },
      homeServices: { label: "Home Services", min: 5000, max: 8000, unit: "per hour" },
      premium:      { label: "Premium",      min: 7000, max: 12000, unit: "per hour" }
    },
    specialties: [
      { value: "primary", label: "Primary / Nursery Lessons" },
      { value: "jamb", label: "JAMB / WAEC / NECO Preparation" },
      { value: "coding", label: "Coding & Programming for Kids" },
      { value: "languages", label: "English, Yoruba, Igbo, French" },
      { value: "music", label: "Music Lessons (Piano, Guitar)" }
    ]
  },

  {
    id: "security",
    name: "Security & Surveillance",
    icon: "🔒",
    pricing: {
      roadside:     { label: "Roadside",     min: 4000, max: 7000, unit: "per installation" },
      standard:     { label: "Standard",     min: 6000, max: 10000, unit: "per installation" },
      homeServices: { label: "Home Services", min: 8000, max: 15000, unit: "per installation" },
      premium:      { label: "Premium",      min: 12000, max: 20000, unit: "per installation" }
    },
    specialties: [
      { value: "cctv-install", label: "CCTV Installation" },
      { value: "alarm", label: "Burglar Alarm Systems" },
      { value: "gate-automation", label: "Electric Gate & Door Automation" },
      { value: "security-guard", label: "Security Guard Services" }
    ]
  },

  {
    id: "laundry",
    name: "Laundry & Dry Cleaning",
    icon: "🧼",
    pricing: {
      roadside:     { label: "Roadside",     min: 0, max: 0, unit: "N/A" },
      standard:     { label: "Standard",     min: 3000, max: 5000, unit: "per kg / item" },
      homeServices: { label: "Home Services", min: 4000, max: 7000, unit: "per kg / item" },
      premium:      { label: "Premium",      min: 5000, max: 9000, unit: "per kg / item" }
    },
    specialties: [
      { value: "home-laundry", label: "Home Pickup & Delivery Laundry" },
      { value: "dry-cleaning", label: "Dry Cleaning (Suits, Gowns)" },
      { value: "bedding", label: "Bedding & Curtain Cleaning" },
      { value: "shoe-cleaning", label: "Shoe & Sneaker Cleaning" }
    ]
  },

  {
    id: "catering",
    name: "Catering & Food Services",
    icon: "🍲",
    pricing: {
      roadside:     { label: "Roadside",     min: 0, max: 0, unit: "N/A" },
      standard:     { label: "Standard",     min: 8000, max: 15000, unit: "per event" },
      homeServices: { label: "Home Services", min: 12000, max: 20000, unit: "per event" },
      premium:      { label: "Premium",      min: 18000, max: 35000, unit: "per event" }
    },
    specialties: [
      { value: "small-chops", label: "Small Chops & Finger Foods" },
      { value: "full-catering", label: "Full Event Catering" },
      { value: "continental", label: "Continental Dishes" },
      { value: "local-dishes", label: "Local / Native Dishes" }
    ]
  },

  {
    id: "welding",
    name: "Welding & Fabrication",
    icon: "🔩",
    pricing: {
      roadside:     { label: "Roadside",     min: 4000, max: 7000, unit: "per job" },
      standard:     { label: "Standard",     min: 6000, max: 10000, unit: "per job" },
      homeServices: { label: "Home Services", min: 8000, max: 15000, unit: "per job" },
      premium:      { label: "Premium",      min: 12000, max: 20000, unit: "per job" }
    },
    specialties: [
      { value: "metal-fabrication", label: "Metal Fabrication" },
      { value: "gate-welding", label: "Gate & Burglary Proof Welding" },
      { value: "railings", label: "Staircase & Balcony Railings" },
      { value: "welding-repair", label: "Welding Repair & Maintenance" }
    ]
  },

  {
    id: "it-support",
    name: "IT & Computer Services",
    icon: "💻",
    pricing: {
      roadside:     { label: "Roadside",     min: 3000, max: 5000, unit: "per job" },
      standard:     { label: "Standard",     min: 4000, max: 7000, unit: "per job" },
      homeServices: { label: "Home Services", min: 6000, max: 10000, unit: "per job" },
      premium:      { label: "Premium",      min: 8000, max: 15000, unit: "per job" }
    },
    specialties: [
      { value: "laptop-repair", label: "Laptop & Desktop Repair" },
      { value: "software", label: "Software Installation & Troubleshooting" },
      { value: "networking", label: "Network Setup & Wi-Fi" },
      { value: "web-design", label: "Website Design & Hosting" }
    ]
  },

  {
    id: "other",
    name: "Other / Miscellaneous",
    icon: "⋯",
    description: "Use this if your service doesn't fit elsewhere",
    pricing: {
      roadside:     { label: "Roadside",     min: 3000, max: 5000, unit: "per job" },
      standard:     { label: "Standard",     min: 4000, max: 7000, unit: "per job" },
      homeServices: { label: "Home Services", min: 6000, max: 10000, unit: "per job" },
      premium:      { label: "Premium",      min: 8000, max: 15000, unit: "per job" }
    },
    specialties: [
      { value: "custom", label: "Custom / Specify in description" }
    ]
  }
]
// ────────────────────────────────────────────────
// Helper functions
// ────────────────────────────────────────────────

// For easy dropdown or selection
export const productCategoryList = productCategories.map(cat => ({
  id: cat.id,
  name: cat.name,
  icon: cat.icon
}));


export const getAllProductCategories = () => {
  return PRODUCT_CATEGORIES.map(cat => ({
    value: cat.id,
    label: cat.name,
    icon: cat.icon || "🛠️"
  }));
};

export const getSpecialtiesForProductCategory = (categoryId) => {
  const category = PRODUCT_CATEGORIES.find(cat => cat.id === categoryId);
  return category ? category.specialties : [];
};

export const getProductCategoryById = (id) => {
  return PRODUCT_CATEGORIES.find(cat => cat.id === id);
};

export const getPricingForProductCategory = (categoryId) => {
  const category = getProductCategoryById(categoryId);
  return category?.pricing || null;
};

export const getAllProductPricingTiers = () => [
  { key: "roadside",     label: "Roadside" },
  { key: "standard",     label: "Standard" },
  { key: "homeServices", label: "Home Services" },
  { key: "premium",      label: "Premium" }
];