// import { useState } from 'react';
// import im from "../../../assets/AC/parts3.jpeg"
// import { CATEGORIES, SELLER_TYPES, SORT_OPTIONS } from './pricecheckerApi';


// const NIGERIAN_STATES = [
//   'Lagos', 'Abuja (FCT)', 'Rivers', 'Oyo', 'Kano', 'Kaduna', 'Ogun', 'Enugu', 'Delta', 'Anambra',
// ];

// export default function LandingView({ initialFilters, onSearch }) {
//   const [query, setQuery] = useState(initialFilters.search || '');
//   const [sellerType, setSellerType] = useState(initialFilters.sellerType || '');
//   const [state, setState] = useState(initialFilters.state || 'Lagos');
//   const [category, setCategory] = useState(initialFilters.category || '');
//   const [sort, setSort] = useState(initialFilters.sort || 'newest');
//   const [minPrice, setMinPrice] = useState(initialFilters.minPrice || '');
//   const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice || '');

//   const submit = (e) => {
//     e?.preventDefault();
//     onSearch({ search: query, sellerType, state, category, sort, minPrice, maxPrice });
//   };

//   return (
//     <div className="relative min-h-screen overflow-hidden bg-[#15121b]">
//       <style>{`
//         @keyframes pc-drift-a { 0%,100% { transform: translate(0,0) rotate(-8deg); } 50% { transform: translate(-10px,16px) rotate(-4deg); } }
//         @keyframes pc-drift-b { 0%,100% { transform: translate(0,0) rotate(10deg); } 50% { transform: translate(12px,-14px) rotate(14deg); } }
//         @keyframes pc-drift-c { 0%,100% { transform: translate(0,0) rotate(-3deg); } 50% { transform: translate(-8px,-10px) rotate(2deg); } }
//         .pc-tag-a { animation: pc-drift-a 9s ease-in-out infinite; }
//         .pc-tag-b { animation: pc-drift-b 11s ease-in-out infinite; }
//         .pc-tag-c { animation: pc-drift-c 8s ease-in-out infinite; }
//         @media (prefers-reduced-motion: reduce) {
//           .pc-tag-a, .pc-tag-b, .pc-tag-c { animation: none; }
//         }
//       `}</style>

//       {/* gradient backdrop */}
//       <div
//         className="pointer-events-none absolute inset-0"
//         style={{ background: 'radial-gradient(1100px 520px at 50% -10%, #6d113f 0%, #4e0826 55%), linear-gradient(180deg, #740833 0%, #331226 55%, #7a1834 100%)' }}
//       />

//       {/* floating price-tag shapes — signature element */}
//       <svg className="pc-tag-a pointer-events-none absolute left-[6%] top-[18%] opacity-30 sm:left-[10%]" width="64" height="64" viewBox="0 0 64 64" fill="none">
//         <path d="M6 30 30 6h20a8 8 0 0 1 8 8v20L34 58a6 6 0 0 1-8.5 0L6 38.5a6 6 0 0 1 0-8.5Z" stroke="#f4c9d8" strokeWidth="2" />
//         <circle cx="43" cy="21" r="4" stroke="#f4c9d8" strokeWidth="2" />
//       </svg>
//       <svg className="pc-tag-b pointer-events-none absolute right-[8%] top-[28%] opacity-25" width="48" height="48" viewBox="0 0 64 64" fill="none">
//         <path d="M6 30 30 6h20a8 8 0 0 1 8 8v20L34 58a6 6 0 0 1-8.5 0L6 38.5a6 6 0 0 1 0-8.5Z" stroke="#f4c9d8" strokeWidth="2" />
//         <circle cx="43" cy="21" r="4" stroke="#f4c9d8" strokeWidth="2" />
//       </svg>
//       <svg className="pc-tag-c pointer-events-none absolute bottom-[12%] left-[16%] opacity-20 hidden sm:block" width="40" height="40" viewBox="0 0 64 64" fill="none">
//         <path d="M6 30 30 6h20a8 8 0 0 1 8 8v20L34 58a6 6 0 0 1-8.5 0L6 38.5a6 6 0 0 1 0-8.5Z" stroke="#f4c9d8" strokeWidth="2" />
//         <circle cx="43" cy="21" r="4" stroke="#f4c9d8" strokeWidth="2" />
//       </svg>

  

//       <main className="relative mx-auto flex max-w-4xl flex-col items-center px-5 pb-20 pt-10 text-center sm:pt-16">
//         <h1 className="font-serif text-[2.1rem] font-bold leading-[1.1] text-white sm:text-5xl">
//           Compare Prices Across<br className="hidden sm:block" /> Multiple Stores
//         </h1>
//         <p className="mt-4 text-[15px] text-[#e6cfd9] sm:text-lg">
//           Fast, simple, and reliable.
//         </p>

//         <form onSubmit={submit} className="mt-9 w-full max-w-2xl">
//           <div className="flex items-center gap-2 rounded-full bg-white p-1.5 pl-5 shadow-[0_20px_45px_-15px_rgba(0,0,0,0.5)]">
//             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#a79fb0]">
//               <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
//               <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
//             </svg>
//             <input
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               type="text"
//               placeholder="Search for anything..."
//               className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] text-[#1d1922] outline-none placeholder:text-[#a79fb0]"
//             />
//             <button
//               type="submit"
//               className="shrink-0 rounded-full bg-[#9c1f45] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#7a1834] sm:px-8"
//             >
//               Search
//             </button>
//           </div>

//           <div className="mt-6 grid grid-cols-2 gap-3 text-left sm:grid-cols-3 lg:grid-cols-6">
//             <FilterField label="Business Type">
//               <select value={sellerType} onChange={(e) => setSellerType(e.target.value)} className="pc-select">
//                 {SELLER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label || 'Any'}</option>)}
//               </select>
//             </FilterField>

//             <FilterField label="Location">
//               <select value={state} onChange={(e) => setState(e.target.value)} className="pc-select">
//                 {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
//               </select>
//             </FilterField>

//             <FilterField label="Category">
//               <select value={category} onChange={(e) => setCategory(e.target.value)} className="pc-select">
//                 {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
//               </select>
//             </FilterField>

//             <FilterField label="Sort By">
//               <select value={sort} onChange={(e) => setSort(e.target.value)} className="pc-select">
//                 {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
//               </select>
//             </FilterField>

//             <FilterField label="Price range (₦)">
//               <input
//                 type="number"
//                 min="0"
//                 value={minPrice}
//                 onChange={(e) => setMinPrice(e.target.value)}
//                 placeholder="Enter min. price"
//                 className="pc-select"
//               />
//             </FilterField>

//             <FilterField label="Price range (₦)">
//               <input
//                 type="number"
//                 min="0"
//                 value={maxPrice}
//                 onChange={(e) => setMaxPrice(e.target.value)}
//                 placeholder="Enter max. price"
//                 className="pc-select"
//               />
//             </FilterField>
//           </div>
//         </form>
//       </main>

//       <style>{`
//         .pc-select {
//           width: 100%;
//           background: rgba(255,255,255,0.08);
//           border: 1px solid rgba(255,255,255,0.18);
//           color: #fff;
//           border-radius: 10px;
//           padding: 9px 10px;
//           font-size: 13.5px;
//           outline: none;
//         }
//         .pc-select option { color: #1d1922; }
//         .pc-select::placeholder { color: rgba(255,255,255,0.55); }
//         .pc-select:focus { border-color: #e6a9c0; }
//       `}</style>
//     </div>
//   );
// }

// function FilterField({ label, children }) {
//   return (
//     <div className="flex flex-col gap-1.5">
//       <span className="text-[11px] font-medium uppercase tracking-wide text-[#d8b9c8]">{label}</span>
//       {children}
//     </div>
//   );
// }



import { useState } from 'react';
import im from "../../../assets/AC/parts3.jpeg"
import { CATEGORIES, SELLER_TYPES, SORT_OPTIONS } from './pricecheckerApi';


const NIGERIAN_STATES = [
  'Lagos', 'Abuja (FCT)', 'Rivers', 'Oyo', 'Kano', 'Kaduna', 'Ogun', 'Enugu', 'Delta', 'Anambra',
];

export default function LandingView({ initialFilters, onSearch }) {
  const [query, setQuery] = useState(initialFilters.search || '');
  const [sellerType, setSellerType] = useState(initialFilters.sellerType || '');
  const [state, setState] = useState(initialFilters.state || 'Lagos');
  const [category, setCategory] = useState(initialFilters.category || '');
  const [sort, setSort] = useState(initialFilters.sort || 'newest');
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice || '');

  const submit = (e) => {
    e?.preventDefault();
    onSearch({ search: query, sellerType, state, category, sort, minPrice, maxPrice });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#15121b]">
      <style>{`
        @keyframes pc-drift-a { 0%,100% { transform: translate(0,0) rotate(-8deg); } 50% { transform: translate(-10px,16px) rotate(-4deg); } }
        @keyframes pc-drift-b { 0%,100% { transform: translate(0,0) rotate(10deg); } 50% { transform: translate(12px,-14px) rotate(14deg); } }
        @keyframes pc-drift-c { 0%,100% { transform: translate(0,0) rotate(-3deg); } 50% { transform: translate(-8px,-10px) rotate(2deg); } }
        .pc-tag-a { animation: pc-drift-a 9s ease-in-out infinite; }
        .pc-tag-b { animation: pc-drift-b 11s ease-in-out infinite; }
        .pc-tag-c { animation: pc-drift-c 8s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .pc-tag-a, .pc-tag-b, .pc-tag-c { animation: none; }
        }
      `}</style>

      {/* background photo */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${im})` }}
      />

      {/* dark overlay + brand gradient wash — tuned so the photo still reads through */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(1100px 520px at 50% -10%, rgba(109,17,63,0.75) 0%, rgba(78,8,38,0.7) 55%), linear-gradient(180deg, rgba(116,8,51,0.6) 0%, rgba(20,15,23,0.75) 55%, rgba(122,24,52,0.65) 100%)',
        }}
      />

      {/* floating price-tag shapes — signature element */}
      <svg className="pc-tag-a pointer-events-none absolute left-[6%] top-[18%] opacity-30 sm:left-[10%]" width="64" height="64" viewBox="0 0 64 64" fill="none">
        <path d="M6 30 30 6h20a8 8 0 0 1 8 8v20L34 58a6 6 0 0 1-8.5 0L6 38.5a6 6 0 0 1 0-8.5Z" stroke="#f4c9d8" strokeWidth="2" />
        <circle cx="43" cy="21" r="4" stroke="#f4c9d8" strokeWidth="2" />
      </svg>
      <svg className="pc-tag-b pointer-events-none absolute right-[8%] top-[28%] opacity-25" width="48" height="48" viewBox="0 0 64 64" fill="none">
        <path d="M6 30 30 6h20a8 8 0 0 1 8 8v20L34 58a6 6 0 0 1-8.5 0L6 38.5a6 6 0 0 1 0-8.5Z" stroke="#f4c9d8" strokeWidth="2" />
        <circle cx="43" cy="21" r="4" stroke="#f4c9d8" strokeWidth="2" />
      </svg>
      <svg className="pc-tag-c pointer-events-none absolute bottom-[12%] left-[16%] opacity-20 hidden sm:block" width="40" height="40" viewBox="0 0 64 64" fill="none">
        <path d="M6 30 30 6h20a8 8 0 0 1 8 8v20L34 58a6 6 0 0 1-8.5 0L6 38.5a6 6 0 0 1 0-8.5Z" stroke="#f4c9d8" strokeWidth="2" />
        <circle cx="43" cy="21" r="4" stroke="#f4c9d8" strokeWidth="2" />
      </svg>

  

      <main className="relative mx-auto flex max-w-4xl flex-col items-center px-5 pb-20 pt-10 text-center sm:pt-16">
        <h1 className="font-serif text-[2.1rem] font-bold leading-[1.1] text-white sm:text-5xl drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]">
          Compare Prices Across<br className="hidden sm:block" /> Multiple Stores
        </h1>
        <p className="mt-4 text-[15px] text-[#e6cfd9] sm:text-lg drop-shadow-[0_1px_6px_rgba(0,0,0,0.4)]">
          Fast, simple, and reliable.
        </p>

        <form onSubmit={submit} className="mt-9 w-full max-w-2xl">
          <div className="flex items-center gap-2 rounded-full bg-white p-1.5 pl-5 shadow-[0_20px_45px_-15px_rgba(0,0,0,0.5)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#a79fb0]">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search for anything..."
              className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] text-[#1d1922] outline-none placeholder:text-[#a79fb0]"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-[#9c1f45] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#7a1834] sm:px-8"
            >
              Search
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 text-left sm:grid-cols-3 lg:grid-cols-6">
            <FilterField label="Business Type">
              <select value={sellerType} onChange={(e) => setSellerType(e.target.value)} className="pc-select">
                {SELLER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label || 'Any'}</option>)}
              </select>
            </FilterField>

            <FilterField label="Location">
              <select value={state} onChange={(e) => setState(e.target.value)} className="pc-select">
                {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </FilterField>

            <FilterField label="Category">
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="pc-select">
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </FilterField>

            <FilterField label="Sort By">
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="pc-select">
                {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </FilterField>

            <FilterField label="Price range (₦)">
              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Enter min. price"
                className="pc-select"
              />
            </FilterField>

            <FilterField label="Price range (₦)">
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Enter max. price"
                className="pc-select"
              />
            </FilterField>
          </div>
        </form>
      </main>

      <style>{`
        .pc-select {
          width: 100%;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.18);
          color: #fff;
          border-radius: 10px;
          padding: 9px 10px;
          font-size: 13.5px;
          outline: none;
        }
        .pc-select option { color: #1d1922; }
        .pc-select::placeholder { color: rgba(255,255,255,0.55); }
        .pc-select:focus { border-color: #e6a9c0; }
      `}</style>
    </div>
  );
}

function FilterField({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium uppercase tracking-wide text-[#d8b9c8]">{label}</span>
      {children}
    </div>
  );
}