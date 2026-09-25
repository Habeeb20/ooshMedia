// export default function Sidebar({ items, activeKey, onSelect, open, onClose }) {
//   const content = (
//     <nav className="flex flex-col gap-1 p-4">
//       <div className="px-2 py-3 mb-2">
//         <span className="font-serif text-xl text-white">Estores</span>
//         <p className="text-xs text-white/50 mt-0.5">Rental dashboard</p>
//       </div>

//       {items.map((item) => (
//         <button
//           key={item.key}
//           onClick={() => {
//             onSelect(item.key);
//             onClose?.();
//           }}
//           className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left ${
//             activeKey === item.key
//               ? 'bg-[#8B1E3F] text-white'
//               : 'text-white/70 hover:bg-white/5 hover:text-white'
//           }`}
//         >
//           <span className="text-base leading-none">{item.icon}</span>
//           {item.label}
//         </button>
//       ))}
//     </nav>
//   );

//   return (
//     <>
//       {/* Desktop rail */}
//       <aside className="hidden lg:block w-64 shrink-0 bg-[#221B1D] min-h-screen  fixed top-0">{content}</aside>

//       {/* Mobile drawer */}
//       {open && (
//         <div className="lg:hidden fixed  mt-10 inset-0 z-40">
//           <div className="absolute inset-0 bg-black/40" onClick={onClose} />
//           <aside className="absolute left-0 top-0 bottom-0 w-64 bg-[#221B1D] shadow-xl">{content}</aside>
//         </div>
//       )}
//     </>
//   );
// }





export default function Sidebar({ items, activeKey, onSelect, open, onClose }) {
  const content = (
    <nav className="flex flex-col gap-1 p-4">
      <div className="px-2 py-3 mb-2">
        <span className="font-serif text-xl text-white">Estores</span>
        <p className="text-xs text-white/50 mt-0.5">Rental dashboard</p>
      </div>

      {items.map((item) => (
        <button
          key={item.key}
          onClick={() => {
            onSelect(item.key);
            onClose?.();
          }}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left ${
            activeKey === item.key
              ? 'bg-[#8B1E3F] text-white'
              : 'text-white/70 hover:bg-white/5 hover:text-white'
          }`}
        >
          <span className="text-base leading-none">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  );

  return (
    <>
      {/* Desktop rail — fixed so it never scrolls with the page; left-0/top-0/h-screen
          pin it to the viewport, overflow-y-auto lets its own nav list scroll
          independently if it ever grows taller than the screen. */}
      <aside className="hidden lg:flex lg:flex-col w-64 mt-5 shrink-0 bg-[#221B1D] h-screen fixed left-0 top-0 overflow-y-auto z-20">
        {content}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-[#221B1D] shadow-xl">{content}</aside>
        </div>
      )}
    </>
  );
}