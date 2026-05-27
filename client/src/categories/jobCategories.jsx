export const jobCategories = [
  {
    id: "technology",
    name: "Technology & IT",
    icon: "💻",
    subcategories: ["Software Development", "Data Science", "Cybersecurity", "Cloud Computing", "UI/UX Design", "DevOps", "AI & Machine Learning", "IT Support"]
  },
  {
    id: "marketing",
    name: "Marketing & Sales",
    icon: "📈",
    subcategories: ["Digital Marketing", "Social Media Management", "Content Marketing", "Sales Executive", "Brand Management", "SEO Specialist"]
  },
  {
    id: "finance",
    name: "Finance & Accounting",
    icon: "💰",
    subcategories: ["Accounting", "Auditing", "Financial Analysis", "Banking", "Investment", "Taxation", "Fintech"]
  },
  {
    id: "healthcare",
    name: "Healthcare & Medical",
    icon: "🩺",
    subcategories: ["Doctors", "Nursing", "Pharmacist", "Medical Laboratory", "Public Health", "Healthcare Management"]
  },
  {
    id: "education",
    name: "Education & Training",
    icon: "📚",
    subcategories: ["Teaching", "Lecturing", "School Administration", "E-learning", "Corporate Training"]
  },
  {
    id: "engineering",
    name: "Engineering",
    icon: "⚙️",
    subcategories: ["Civil Engineering", "Mechanical Engineering", "Electrical Engineering", "Petroleum Engineering", "Chemical Engineering"]
  },
  {
    id: "creative",
    name: "Creative & Media",
    icon: "🎨",
    subcategories: ["Graphic Design", "Video Editing", "Photography", "Content Creation", "Journalism", "Music & Audio"]
  },
  {
    id: "business",
    name: "Business & Management",
    icon: "💼",
    subcategories: ["Business Development", "Project Management", "Human Resources", "Operations", "Entrepreneurship"]
  },
  {
    id: "legal",
    name: "Legal Services",
    icon: "⚖️",
    subcategories: ["Corporate Law", "Litigation", "Compliance", "Intellectual Property"]
  },
  {
    id: "logistics",
    name: "Logistics & Transportation",
    icon: "🚛",
    subcategories: ["Supply Chain", "Warehouse Management", "Driving", "Fleet Management"]
  },
  {
    id: "hospitality",
    name: "Hospitality & Tourism",
    icon: "🏨",
    subcategories: ["Hotel Management", "Restaurant Service", "Tourism", "Event Planning"]
  },
  {
    id: "construction",
    name: "Construction & Real Estate",
    icon: "🏗️",
    subcategories: ["Building", "Architecture", "Real Estate Sales", "Property Management"]
  },
  {
    id: "agriculture",
    name: "Agriculture & Farming",
    icon: "🌾",
    subcategories: ["Crop Farming", "Livestock", "Agribusiness", "Food Processing"]
  },
  {
    id: "admin",
    name: "Administrative & Office",
    icon: "📋",
    subcategories: ["Office Assistant", "Secretary", "Receptionist", "Data Entry", "Customer Service"]
  },
  {
    id: "security",
    name: "Security & Safety",
    icon: "🔒",
    subcategories: ["Cybersecurity", "Physical Security", "Risk Management"]
  }
];

// Flat list for dropdowns/filters
export const jobCategoryList = jobCategories.map(cat => ({
  id: cat.id,
  name: cat.name,
  icon: cat.icon
}));