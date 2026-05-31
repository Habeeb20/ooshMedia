export const entityCategories = [
  {
    id: "technology",
    name: "Technology & Software",
    icon: "💻",
    examples: ["Software Company", "SaaS", "Mobile App", "AI Startup", "Web Development"]
  },
  {
    id: "media",
    name: "Media & Entertainment",
    icon: "🎥",
    examples: ["Film Production", "Music Label", "Digital Media", "Content Creation Agency"]
  },
  {
    id: "retail",
    name: "Retail & Supermarkets",
    icon: "🛒",
    examples: ["Supermarket", "Mini Mart", "Fashion Store", "Electronics Store", "Wholesale"]
  },
  {
    id: "restaurant",
    name: "Restaurant",
    icon: "🛒",
    examples: ["Supermarket", "Mini Mart", "Fashion Store", "Electronics Store", "Wholesale"]
  },
  {
    id: "healthcare",
    name: "Healthcare & Medical",
    icon: "🩺",
    examples: ["Hospital", "Clinic", "Pharmacy", "Diagnostic Center", "Medical Laboratory"]
  },
  {
    id: "food",
    name: "Food & Beverage",
    icon: "🍽️",
    examples: ["Restaurant", "Fast Food", "Catering Service", "Bakery", "Pure Water Company"]
  },
  {
    id: "finance",
    name: "Finance & Fintech",
    icon: "🏦",
    examples: ["Bank", "Microfinance", "Insurance", "POS Business", "Investment Firm"]
  },
  {
    id: "education",
    name: "Education & Training",
    icon: "📚",
    examples: ["School", "University", "Tutorial Center", "EdTech Platform", "Vocational Institute"]
  },
  {
    id: "realestate",
    name: "Real Estate & Property",
    icon: "🏠",
    examples: ["Property Development", "Real Estate Agency", "Land Selling", "Housing Estate"]
  },
  {
    id: "logistics",
    name: "Logistics & Transportation",
    icon: "🚛",
    examples: ["Courier Service", "Haulage Company", "Ride Hailing", "Travel Agency"]
  },
  {
    id: "agriculture",
    name: "Agriculture & Agro-Allied",
    icon: "🌾",
    examples: ["Farming", "Poultry Farm", "Fishery", "Agro Processing", "Fertilizer Supply"]
  },
  {
    id: "manufacturing",
    name: "Manufacturing & Production",
    icon: "🏭",
    examples: ["Textile", "Furniture Making", "Plastic Production", "Bottling Company"]
  },
  {
    id: "hospitality",
    name: "Hospitality & Tourism",
    icon: "🏨",
    examples: ["Hotel", "Guest House", "Event Center", "Restaurant & Bar"]
  },
  {
    id: "beauty",
    name: "Beauty & Fashion",
    icon: "💄",
    examples: ["Salon", "Spa", "Fashion Brand", "Makeup Studio", "Tailoring"]
  },
  {
    id: "automotive",
    name: "Automotive & Transport",
    icon: "🚗",
    examples: ["Car Dealership", "Mechanic Workshop", "Spare Parts", "Car Wash"]
  },
  {
    id: "consulting",
    name: "Consulting & Professional Services",
    icon: "💼",
    examples: ["Business Consultant", "Legal Firm", "Accounting Firm", "HR Consulting"]
  },
  {
    id: "energy",
    name: "Energy & Power",
    icon: "⚡",
    examples: ["Solar Energy", "Oil & Gas", "Generator Sales", "Power Solutions"]
  },
  {
    id: "nonprofit",
    name: "Non-Profit & NGO",
    icon: "🤝",
    examples: ["Charity Organization", "Foundation", "Community Development", "Religious Body"]
  },
  {
    id: "construction",
    name: "Construction & Engineering",
    icon: "🏗️",
    examples: ["Building Contractor", "Civil Engineering", "Interior Design", "Road Construction"]
  }
];

// For dropdowns and quick selection
export const entityCategoryList = entityCategories.map(cat => ({
  id: cat.id,
  name: cat.name,
  icon: cat.icon
}));