import { Home, Briefcase, Store, PlaySquare, User } from "lucide-react";

const navItems = [
  { id: 'home', label: 'Dashboard', icon: Home },
  { id: 'post', label: 'Job Feed', icon: Briefcase },
  { id: 'products', label: 'Marketplace', icon: Store },
  { id: 'ads', label: 'My ads', icon: PlaySquare },
  { id: 'profile', label: 'Profile', icon: User },
];

export default function BottomNav({ activePage, setActivePage }) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all ${
                activePage === item.id 
                  ? 'bg-[#8B1E3F] text-white' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Icon size={22} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
