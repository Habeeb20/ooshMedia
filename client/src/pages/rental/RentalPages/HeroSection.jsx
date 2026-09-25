// Design note: left-aligned serif headline for a boutique-marketplace feel,
// paired with an asymmetric image collage (not one generic hero photo) so the
// breadth of what's rentable — car, gear, space — reads at a glance. Price-tag
// chips on the images tie the visuals directly to the rental concept instead
// of decorating for its own sake.

const COLLAGE_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=900&q=80',
    label: 'Toyota Camry',
    price: '₦18,000/day',
    className: 'col-span-2 row-span-2',
  },
  {
    url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500&q=80',
    label: 'Canon EOS R6',
    price: '₦6,500/day',
    className: 'col-span-1 row-span-1',
  },
  {
    url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=500&q=80',
    label: 'Mountain bike',
    price: '₦3,000/day',
    className: 'col-span-1 row-span-1',
  },
];

export default function HeroSection({ onBrowse, onListItem }) {
  return (
    <section className="bg-[#FAF6F7]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left: text */}
        <div className="max-w-xl">
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.08] tracking-tight text-[#221B1D]">
            Rent almost anything, from people down the street.
          </h1>
          <p className="mt-5 text-lg text-[#6B6067] leading-relaxed">
            Cars for the weekend, camera gear for a shoot, a bike for the
            summer. Estores connects you with owners nearby — book, pay, and
            pick up in minutes.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={onBrowse}
              className="rounded-lg bg-[#8B1E3F] text-white font-medium px-6 py-3.5 hover:bg-[#5E1329] transition-colors"
            >
              Browse what's available
            </button>
            <button
              onClick={onListItem}
              className="rounded-lg border border-[#E7DEE1] text-[#221B1D] font-medium px-6 py-3.5 hover:border-[#8B1E3F] hover:text-[#8B1E3F] transition-colors bg-white"
            >
              List your item
            </button>
          </div>

          <div className="mt-10 flex items-center gap-6 text-sm text-[#6B6067]">
            <div>
              <span className="block text-xl font-semibold text-[#221B1D]">12,400+</span>
              items listed
            </div>
            <div className="w-px h-8 bg-[#E7DEE1]" />
            <div>
              <span className="block text-xl font-semibold text-[#221B1D]">4.8★</span>
              average rating
            </div>
          </div>
        </div>

        {/* Right: asymmetric image collage */}
        <div className="grid grid-cols-2 grid-rows-2 gap-3 h-[420px] sm:h-[460px]">
          {COLLAGE_IMAGES.map((img) => (
            <div key={img.label} className={`relative rounded-2xl overflow-hidden ${img.className}`}>
              <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
              <div className="absolute bottom-3 left-3 rounded-full bg-white/95 backdrop-blur px-3 py-1.5 text-xs font-medium text-[#221B1D] shadow-sm">
                {img.label} · <span className="text-[#8B1E3F]">{img.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}