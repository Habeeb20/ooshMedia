import { useNavigate } from 'react-router-dom';
import im from "../../assets/AC/banner.jpeg"
// Swap this for your own factory/warehouse photo (Cloudinary/S3 url or local import)
const BANNER_IMAGE = im

export default function RawMaterialsBanner() {
  const navigate = useNavigate();

  return (
    <section className="relative w-full overflow-hidden rounded-2xl bg-[#FBEAE3]">
      {/* background photo, right-anchored */}
      <img
        src={BANNER_IMAGE}
        alt="Manufacturing facility"
        className="absolute inset-y-0 right-0 h-full w-[62%] object-cover"
      />

      {/* gradient so the peach panel fades into the photo */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, #FBEAE3 0%, #FBEAE3 34%, rgba(251,234,227,0.85) 44%, rgba(251,234,227,0.35) 56%, rgba(251,234,227,0) 68%)',
        }}
      />

      <div className="relative z-10 px-10 py-14 md:px-14 md:py-16 max-w-2xl">
        <p className="text-xs font-semibold tracking-wider text-[#D2601A] uppercase mb-3">
          Business sourcing
        </p>

        <h1 className="text-4xl md:text-[42px] leading-[1.15] font-bold text-[#1A1A1A] mb-5">
          Meet Manufacturers, Farmers
          <br />
          Producers &amp; Exporters Of Raw Materials
        </h1>

        <p className="text-[15px] text-[#5B5B58] leading-relaxed mb-4 max-w-md">
          Discover businesses producing and supplying quality raw materials and
          products for local and international markets.
        </p>

        <p className="flex items-center gap-2 text-sm text-[#3D3D3A] mb-6">
          <span className="inline-block h-4 w-[3px] bg-[#D2601A]" />
          Find the source. Discover what they produce. Connect directly.
        </p>

        <div className="flex flex-wrap gap-2 mb-8">
          {['Manufacturer', 'Producer', 'Exporter', 'Bulk Supplier'].map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white px-4 py-1.5 text-xs font-medium text-[#1A1A1A] shadow-sm"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/b2b-sourcing/producers')}
            className="rounded-lg bg-[#D2601A] px-6 py-3 text-xs font-semibold tracking-wide text-white uppercase hover:bg-[#B85114] transition-colors"
          >
            Explore producers
          </button>
          <button
            onClick={() => navigate('/b2b-sourcing/raw-materials')}
            className="rounded-lg border border-[#D2601A] bg-transparent px-6 py-3 text-xs font-semibold tracking-wide text-[#D2601A] uppercase hover:bg-white/60 transition-colors"
          >
            Browse raw materials
          </button>
        </div>
      </div>
    </section>
  );
}