
import appConfig from '../../config/AppConfig';
import { Home, Briefcase, Store, PlaySquare, User, LogOut } from 'lucide-react';

const navItems = [
  { id: 'home', label: 'Dashboard', icon: Home },
  { id: 'jobs', label: 'Jobs', icon: Briefcase },
  { id: 'marketplace', label: 'Marketplace', icon: Store },
  { id: 'media', label: 'Media Hub', icon: PlaySquare },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'editProfile', label: 'Edit Profile', icon: User },
];

export default function Sidebar({ activePage, setActivePage, onClose }) {
  return (
    <div className="w-62 h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-1 border-b">
        {/* <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#8B1E3F] to-[#C44A6F] rounded-2xl flex items-center justify-center">
            <span className="text-white text-xl">🎥</span>
          </div>
          <h2 className="text-2xl font-bold">{appConfig.name}</h2>
        </div> */}
      </div>

      <div className="flex-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActivePage(item.id);
                if (onClose) onClose();
              }}
              className={`w-full flex items-center gap-4 px-3 py-2 rounded-2xl mb-2 transition-all ${
                activePage === item.id 
                  ? 'bg-[#8B1E3F] text-white shadow-md' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <Icon size={22} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t">
        <button className="w-full flex items-center gap-4 px-5 py-4 text-red-600 hover:bg-red-50 rounded-2xl">
          <LogOut size={22} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}








// import appConfig from '../../config/AppConfig';
// import { Home, Briefcase, Store, PlaySquare, User, LogOut } from 'lucide-react';

// const navItems = [
//   { id: 'home', label: 'Dashboard', icon: Home },
//   { id: 'jobs', label: 'Jobs', icon: Briefcase },
//   { id: 'marketplace', label: 'Marketplace', icon: Store },
//   { id: 'media', label: 'Media Hub', icon: PlaySquare },
//   { id: 'profile', label: 'Profile', icon: User },
// ];

// export default function Sidebar({ activePage, setActivePage, onClose }) {
//   return (
//     <div className="w-72 h-screen bg-white border-r border-gray-200 flex flex-col shadow-sm">
      
//       {/* Logo Section - Static */}
//       <div className="p-6 border-b">
//         <div className="flex items-center gap-3">
//           <div 
//             className="w-10 h-10 rounded-2xl flex items-center justify-center"
//             style={{ 
//               background: `linear-gradient(to bottom right, ${appConfig.colors.primary}, ${appConfig.colors.primaryLight})` 
//             }}
//           >
//             <span className="text-white text-2xl">🎥</span>
//           </div>
//           <h2 className="text-2xl font-bold text-gray-900">{appConfig.name}</h2>
//         </div>
//         <p className="text-xs text-gray-500 mt-1">Business Media Platform</p>
//       </div>

//       {/* Navigation - Static */}
//       <div className="flex-1 px-4 py-6 overflow-y-auto">
//         <p className="text-xs uppercase tracking-widest text-gray-500 font-medium px-3 mb-4">Main Menu</p>
        
//         {navItems.map((item) => {
//           const Icon = item.icon;
//           const isActive = activePage === item.id;

//           return (
//             <button
//               key={item.id}
//               onClick={() => {
//                 setActivePage(item.id);
//                 if (onClose) onClose();
//               }}
//               className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl mb-1.5 transition-all font-medium ${
//                 isActive 
//                   ? 'bg-[#8B1E3F] text-white shadow-md' 
//                   : 'hover:bg-gray-100 text-gray-700'
//               }`}
//             >
//               <Icon size={22} className={isActive ? "text-white" : ""} />
//               <span>{item.label}</span>
//             </button>
//           );
//         })}
//       </div>

//       {/* Logout - Static */}
//       <div className="p-4 border-t mt-auto">
//         <button 
//           onClick={() => {
//             // You can connect this to your logout function from AuthContext
//             if (onClose) onClose();
//             window.location.href = '/login';
//           }}
//           className="w-full flex items-center gap-4 px-5 py-3.5 text-red-600 hover:bg-red-50 rounded-2xl transition-all font-medium"
//         >
//           <LogOut size={22} />
//           <span>Logout</span>
//         </button>
//       </div>
//     </div>
//   );
// }