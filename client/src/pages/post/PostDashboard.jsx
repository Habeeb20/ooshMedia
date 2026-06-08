// PostsDashboard.jsx — main shell with top navbar
import { useState } from 'react';
import MyPostsView from './MyPostsView';
import MyApplicationsView from './MyApplicationView';

const currentUser = () => {
  try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
};

const TAB_MY_POSTS = 'my-posts';
const TAB_MY_APPS  = 'my-applications';

const NAV = [
  { id: TAB_MY_POSTS, label: 'My Posts',        icon: ClipboardIcon },
  { id: TAB_MY_APPS,  label: 'My Applications', icon: SendIcon      },
];

// ─── Icons ────────────────────────────────────────────────────────────────────
function ClipboardIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    </svg>
  );
}
function SendIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  );
}
function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
}
function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}
function BellIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}
function UserIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
function SettingsIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );
}
function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}

// ─── Mobile drawer (full menu for small screens) ──────────────────────────────
function MobileDrawer({ activeTab, setActiveTab, user, open, onClose }) {
  const handleNav = (id) => { setActiveTab(id); onClose(); };

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/30 z-40 sm:hidden" onClick={onClose} />
      )}
      <div
        className={`
          fixed top-0 left-0 h-full w-72 bg-white z-50 flex flex-col shadow-2xl
          transition-transform duration-300 sm:hidden
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#8B1E3F] flex items-center justify-center text-white font-black text-sm">
              P
            </div>
            <div>
              <p className="text-sm font-black text-gray-900 leading-none">PostHub</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Business Dashboard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="Close menu"
          >
            <XIcon />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">
            Workspace
          </p>
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[13px] font-semibold transition-all text-left
                ${activeTab === id
                  ? 'bg-[#8B1E3F]/10 text-[#8B1E3F]'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}
              `}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}

          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 pt-4 mb-2">
            Account
          </p>
          <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[13px] font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all text-left">
            <UserIcon size={17} /> Profile
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[13px] font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all text-left">
            <SettingsIcon size={17} /> Settings
          </button>
        </nav>

        {/* User footer */}
        <div className="px-3 py-3 border-t border-gray-100">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-[#8B1E3F] text-white text-xs font-black flex items-center justify-center flex-shrink-0">
              {user?.firstName?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-[11px] text-gray-400 truncate">@{user?.username}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Top Navbar ───────────────────────────────────────────────────────────────
function Navbar({ activeTab, setActiveTab, user, onMenuOpen }) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-16 gap-4">

          {/* Mobile hamburger */}
          <button
            onClick={onMenuOpen}
            className="sm:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0"
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-[#8B1E3F] flex items-center justify-center text-white font-black text-sm">
              P
            </div>
            <span className="hidden sm:block text-[15px] font-black text-gray-900">PostHub</span>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-5 bg-gray-200 flex-shrink-0" />

          {/* Nav tabs — desktop */}
          <nav className="hidden sm:flex items-center gap-1 flex-1">
            {NAV.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all
                  ${activeTab === id
                    ? 'bg-[#8B1E3F] text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}
                `}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="ml-auto flex items-center gap-2">
            <button
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 border border-gray-200 transition-colors"
              aria-label="Search"
            >
              <SearchIcon />
            </button>
            <button
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 border border-gray-200 transition-colors"
              aria-label="Notifications"
            >
              <BellIcon />
            </button>

            {/* User pill — desktop */}
            <div className="hidden sm:flex items-center gap-2 pl-2 ml-1 border-l border-gray-200 cursor-pointer group">
              <div className="w-8 h-8 rounded-lg bg-[#8B1E3F] text-white text-xs font-black flex items-center justify-center flex-shrink-0">
                {user?.firstName?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="hidden md:block min-w-0">
                <p className="text-xs font-bold text-gray-900 leading-none truncate max-w-[100px]">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[11px] text-gray-400 truncate max-w-[100px]">@{user?.username}</p>
              </div>
              <ChevronDown />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile active tab indicator strip */}
      <div className="sm:hidden flex border-t border-gray-100">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`
              flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold transition-all border-b-2
              ${activeTab === id
                ? 'border-[#8B1E3F] text-[#8B1E3F]'
                : 'border-transparent text-gray-400 hover:text-gray-700'}
            `}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>
    </header>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function PostsDashboard() {
  const user = currentUser();
  const [activeTab,   setActiveTab]   = useState(TAB_MY_POSTS);
  const [drawerOpen,  setDrawerOpen]  = useState(false);

  return (
    <div className="min-h-screen bg-gray-100" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(-6px); } to { opacity:1; transform:translateX(0); } }
        .fade-up  { animation: fadeUp  0.3s ease-out both; }
        .slide-in { animation: slideIn 0.22s ease-out both; }
      `}</style>

      {/* Top navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onMenuOpen={() => setDrawerOpen(true)}
      />

      {/* Mobile drawer */}
      <MobileDrawer
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === TAB_MY_POSTS && <MyPostsView key="posts" />}
        {activeTab === TAB_MY_APPS  && <MyApplicationsView key="apps" />}
      </main>
    </div>
  );
}