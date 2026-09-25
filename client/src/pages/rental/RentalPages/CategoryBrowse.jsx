


import { useEffect, useMemo, useState } from 'react';
import { rentalApi } from '../api/rentalApi';
import rentalCategories from '../utils/RentalCategories';
import { useNavigate } from 'react-router-dom';
import HorizontalCarousel from './HorizontalCarousel';
import RentalItemCard from '../components/RentalItemCard';

// Mirrors whatever slug logic seedRentalCategories.js uses when it writes
// categories/subcategories to Mongo. Keep this in sync with that script so
// the slugs generated here match the `category` / `subcategory` fields
// stored on each rental item.
function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Build a static, slugged version of the category tree once, with
// placeholders for counts we'll fill in from the items list.
const CATEGORY_TREE = rentalCategories.map((cat) => {
  const catSlug = slugify(cat.name);
  return {
    name: cat.name,
    slug: catSlug,
    subCategories: cat.subCategories.map((sub) => ({
      name: sub,
      slug: slugify(sub),
    })),
  };
});

function FilterPill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 snap-start rounded-full px-4 py-2 text-sm font-medium border transition-colors whitespace-nowrap ${
        active
          ? 'bg-[#8B1E3F] border-[#8B1E3F] text-white'
          : 'bg-white border-[#E7DEE1] text-[#221B1D] hover:border-[#8B1E3F]'
      }`}
    >
      {children}
    </button>
  );
}

export default function CategoryBrowse({ onOpenItem }) {
  const [selectedCategory, setSelectedCategory] = useState(null); // entry from CATEGORY_TREE, or null = "All"
  const [selectedSubcategory, setSelectedSubcategory] = useState(null); // subcategory slug, or null = "All"
  const [allItems, setAllItems] = useState([]); // full item set, used to derive counts
  const [loadingItems, setLoadingItems] = useState(true);

  // Fetch items once. We no longer fetch category/subcategory lists from the
  // API — those come from the local rentalCategories import — but we still
  // need item data (and its category/subcategory slugs) to compute counts
  // and to filter the results grid.
  useEffect(() => {
    setLoadingItems(true);
    rentalApi
      .getItems({}) // fetch everything; filtering happens client-side below
      .then((res) => setAllItems(res.items || []))
      .finally(() => setLoadingItems(false));
  }, []);

  // Count items per category slug and per (category, subcategory) slug pair.
  const { categoryCounts, subcategoryCounts } = useMemo(() => {
    const catCounts = {};
    const subCounts = {}; // keyed as `${categorySlug}::${subcategorySlug}`

    for (const item of allItems) {
      // Adjust these field names to match your actual item schema
      // (e.g. item.categorySlug / item.subcategorySlug, or item.category?.slug).
      const catSlug = item.categorySlug || item.category;
      const subSlug = item.subcategorySlug || item.subcategory;

      if (catSlug) {
        catCounts[catSlug] = (catCounts[catSlug] || 0) + 1;
        if (subSlug) {
          const key = `${catSlug}::${subSlug}`;
          subCounts[key] = (subCounts[key] || 0) + 1;
        }
      }
    }

    return { categoryCounts: catCounts, subcategoryCounts: subCounts };
  }, [allItems]);

  const totalCount = allItems.length;

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
  };

  // Items to actually render in the grid, filtered client-side by the
  // current category/subcategory selection.
  const visibleItems = useMemo(() => {
    return allItems.filter((item) => {
      const catSlug = item.categorySlug || item.category;
      const subSlug = item.subcategorySlug || item.subcategory;

      if (selectedCategory && catSlug !== selectedCategory.slug) return false;
      if (selectedSubcategory && subSlug !== selectedSubcategory) return false;
      return true;
    });
  }, [allItems, selectedCategory, selectedSubcategory]);

  return (
    <section className="max-w-6xl mx-auto px-5 sm:px-8 py-14">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#221B1D]">Browse by category</h2>
          <p className="text-[#6B6067] mt-1">Find exactly what you need, filtered your way.</p>
        </div>
      </div>

      {/* Category carousel */}
      <HorizontalCarousel>
        <FilterPill active={!selectedCategory} onClick={() => handleSelectCategory(null)}>
          All categories ({totalCount})
        </FilterPill>
        {CATEGORY_TREE.map((cat) => (
          <FilterPill
            key={cat.slug}
            active={selectedCategory?.slug === cat.slug}
            onClick={() => handleSelectCategory(cat)}
          >
            {cat.name} ({categoryCounts[cat.slug] || 0})
          </FilterPill>
        ))}
      </HorizontalCarousel>

      {/* Subcategory carousel — appears once a category is selected */}
      {selectedCategory && selectedCategory.subCategories?.length > 0 && (
        <div className="mt-3">
          <HorizontalCarousel>
            <FilterPill active={!selectedSubcategory} onClick={() => setSelectedSubcategory(null)}>
              All {selectedCategory.name.toLowerCase()} ({categoryCounts[selectedCategory.slug] || 0})
            </FilterPill>
            {selectedCategory.subCategories.map((sub) => {
              const key = `${selectedCategory.slug}::${sub.slug}`;
              return (
                <FilterPill
                  key={sub.slug}
                  active={selectedSubcategory === sub.slug}
                  onClick={() => setSelectedSubcategory(sub.slug)}
                >
                  {sub.name} ({subcategoryCounts[key] || 0})
                </FilterPill>
              );
            })}
          </HorizontalCarousel>
        </div>
      )}

      {/* Results grid */}
      <div className="mt-8">
        {loadingItems ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-xl bg-[#F3E4E8] animate-pulse" />
            ))}
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-[#E7DEE1] rounded-xl">
            <p className="text-[#221B1D] font-medium">Nothing listed here yet</p>
            <p className="text-sm text-[#6B6067] mt-1">Try a different category, or check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {visibleItems.map((item) => (
              <RentalItemCard key={item._id} item={item} onOpen={onOpenItem} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}