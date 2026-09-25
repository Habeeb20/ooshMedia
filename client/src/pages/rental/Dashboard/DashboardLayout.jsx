// import { useState } from 'react';
// import Sidebar from './Sidebar';
// import DashboardOverview from './panels/DashboardOverview';
// import RenterBookingsPanel from './panels/RentalBookingPanel';
// import OwnerListingsPanel from './panels/OwnerListingPanel';
// import OwnerBookingsPanel from './panels/OwnerBookingsPanel';
// import VideoCreditsPanel from './panels/VideoCreditPanel';
// import CreateListingPanel from './panels/CreateListingPanel';
// import { useNavigate } from 'react-router-dom';

// // Each sidebar item maps directly to the panel component it renders as main
// // content — add a new item here and its component shows up in the sidebar
// // and in the content area automatically.
// const NAV_ITEMS = [
//   { key: 'overview', label: 'Overview', icon: '◆', Component: DashboardOverview },
//   { key: 'my-bookings', label: 'My Bookings', icon: '▤', Component: RenterBookingsPanel },
//   { key: 'requests', label: 'Rental Requests', icon: '✉', Component: OwnerBookingsPanel },
//   { key: 'listings', label: 'My Listings', icon: '▦', Component: OwnerListingsPanel },
//   { key: 'new-listing', label: 'List an Item', icon: '＋', Component: CreateListingPanel },
//   { key: 'video-credits', label: 'Video Credits', icon: '▶', Component: VideoCreditsPanel },
// ];

// export default function DashboardLayout() {
//   const [activeKey, setActiveKey] = useState('overview');
//   const [sidebarOpen, setSidebarOpen] = useState(false);
// const navigate = useNavigate()
//   const active = NAV_ITEMS.find((item) => item.key === activeKey) || NAV_ITEMS[0];
//   const ActiveComponent = active.Component;

//   return (
//     <div className="min-h-screen mt-5 bg-[#FAF6F7] flex">
//       <Sidebar
//         items={NAV_ITEMS}
//         activeKey={activeKey}
//         onSelect={setActiveKey}
//         open={sidebarOpen}
//         onClose={() => setSidebarOpen(false)}
//       />

//       <div className="flex-1 min-w-0">
//         {/* Mobile top bar */}
//         <div className="lg:hidden flex items-center gap-3 px-4 h-14 border-b border-[#E7DEE1] bg-white sticky top-0 z-30">
//           <button
//             onClick={() => setSidebarOpen(true)}
//             aria-label="Open menu"
//             className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#F3E4E8] text-[#221B1D]"
//           >
//             <span className="block w-5 space-y-1">
//               <span className="block h-0.5 bg-current rounded" />
//               <span className="block h-0.5 bg-current rounded" />
//               <span className="block h-0.5 bg-current rounded" />
//             </span>
//           </button>
//           <span className="font-serif text-lg text-[#221B1D]">{active.label}</span>
   
//         </div>

//           <main className="p-5 sm:p-8">
//           <div className="mb-6 flex justify-end">
//             <button
//               onClick={() => navigate('/dashboard')}
//               className="rounded-lg border border-[#E7DEE1] bg-white text-[#221B1D] text-sm font-medium px-4 py-2 hover:border-[#8B1E3F] hover:text-[#8B1E3F] transition-colors"
//             >
//               Estores Dashboard
//             </button>
//           </div>


//           {/* Passing onCreateNew/onCreated lets panels navigate within the dashboard
//               without each one knowing about the others directly. */}
//           <ActiveComponent
//             onCreateNew={() => setActiveKey('new-listing')}
//             onCreated={() => setActiveKey('listings')}
//           />
//         </main>
//       </div>
//     </div>
//   );
// }




















import { useState } from 'react';
import Sidebar from './Sidebar';
import DashboardOverview from './panels/DashboardOverview';
import RenterBookingsPanel from './panels/RentalBookingPanel';
import OwnerListingsPanel from './panels/OwnerListingPanel';
import OwnerBookingsPanel from './panels/OwnerBookingsPanel';
import VideoCreditsPanel from './panels/VideoCreditPanel';
import CreateListingPanel from './panels/CreateListingPanel';
import { useNavigate } from 'react-router-dom';

// Each sidebar item maps directly to the panel component it renders as main
// content — add a new item here and its component shows up in the sidebar
// and in the content area automatically.
const NAV_ITEMS = [
  { key: 'overview', label: 'Overview', icon: '◆', Component: DashboardOverview },
  { key: 'my-bookings', label: 'My Bookings', icon: '▤', Component: RenterBookingsPanel },
  { key: 'requests', label: 'Rental Requests', icon: '✉', Component: OwnerBookingsPanel },
  { key: 'listings', label: 'My Listings', icon: '▦', Component: OwnerListingsPanel },
  { key: 'new-listing', label: 'List an Item', icon: '＋', Component: CreateListingPanel },
  { key: 'video-credits', label: 'Video Credits', icon: '▶', Component: VideoCreditsPanel },
];

export default function DashboardLayout() {
  const [activeKey, setActiveKey] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const active = NAV_ITEMS.find((item) => item.key === activeKey) || NAV_ITEMS[0];
  const ActiveComponent = active.Component;

  return (
    <div className="min-h-screen mt-5 bg-[#FAF6F7]">
      <Sidebar
        items={NAV_ITEMS}
        activeKey={activeKey}
        onSelect={setActiveKey}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* lg:pl-64 offsets content past the fixed sidebar — a fixed element is
          taken out of normal document flow, so without this the content
          starts at the left edge and the sidebar just overlaps on top of it. */}
      <div className="lg:pl-64">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 h-14 border-b border-[#E7DEE1] bg-white sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#F3E4E8] text-[#221B1D]"
          >
            <span className="block w-5 space-y-1">
              <span className="block h-0.5 bg-current rounded" />
              <span className="block h-0.5 bg-current rounded" />
              <span className="block h-0.5 bg-current rounded" />
            </span>
          </button>
          <span className="font-serif text-lg text-[#221B1D]">{active.label}</span>
        </div>

        <main className="p-5 sm:p-8 ">
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => navigate('/dashboard')}
              className="rounded-lg border border-[#E7DEE1] bg-white text-[#221B1D] text-sm font-medium px-4 py-2 hover:border-[#8B1E3F] hover:text-[#8B1E3F] transition-colors"
            >
              Estores Dashboard
            </button>
          </div>

          {/* Passing onCreateNew/onCreated lets panels navigate within the dashboard
              without each one knowing about the others directly. */}
          <ActiveComponent
            onCreateNew={() => setActiveKey('new-listing')}
            onCreated={() => setActiveKey('listings')}
          />
        </main>
      </div>
    </div>
  );
}











