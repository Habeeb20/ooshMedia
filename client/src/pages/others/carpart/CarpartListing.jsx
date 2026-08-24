/* eslint-disable no-unused-vars */
import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Loader2, Search, Zap, Gauge, Wrench } from "lucide-react";
import appConfig from "../../../config/AppConfig";


const slugify = (text) =>
  text
    ?.toLowerCase()
    ?.replace(/[^\w ]+/g, "")
    ?.replace(/ +/g, "-");

export default function CarPartsListing() {
  const { partSlug } = useParams(); // e.g. "engines"
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedSubCats, setSelectedSubCats] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [selectedTransmissions, setSelectedTransmissions] = useState([]);
  const [selectedFuelTypes, setSelectedFuelTypes] = useState([]);
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    const fetchParts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/inventory/all`
        );
        const allProducts = response.data?.products || response.data || [];

        const filtered = allProducts.filter(
          (p) =>
            p?.category?.toLowerCase() === "automotive" &&
            p?.part === true &&
            p?.whatPart === "Car Parts" &&
            slugify(p?.subCategoryPart) === partSlug
        );

        setProducts(filtered);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchParts();
  }, [partSlug]);

  const partName = products[0]?.subCategoryPart || partSlug?.replace(/-/g, " ");

  // Filter option lists derived from actual data
  const subCategoryOptions = useMemo(
    () => [...new Set(products.map((p) => p.subCategory).filter(Boolean))],
    [products]
  );
  const brandOptions = useMemo(
    () => [...new Set(products.map((p) => p.maker).filter(Boolean))],
    [products]
  );
  const conditionOptions = useMemo(
    () => [...new Set(products.map((p) => p.grade).filter(Boolean))],
    [products]
  );
  const transmissionOptions = useMemo(
    () => [...new Set(products.map((p) => p.gearTransmission).filter(Boolean))],
    [products]
  );
  const fuelTypeOptions = useMemo(
    () => [...new Set(products.map((p) => p.fuelType).filter(Boolean))],
    [products]
  );

  const toggleFilter = (value, list, setList) => {
    setList((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let list = products;

    if (term) {
      list = list.filter(
        (p) =>
          p?.name?.toLowerCase().includes(term) ||
          p?.maker?.toLowerCase().includes(term)
      );
    }
    if (selectedSubCats.length) {
      list = list.filter((p) => selectedSubCats.includes(p.subCategory));
    }
    if (selectedBrands.length) {
      list = list.filter((p) => selectedBrands.includes(p.maker));
    }
    if (selectedConditions.length) {
      list = list.filter((p) => selectedConditions.includes(p.grade));
    }
    if (selectedTransmissions.length) {
      list = list.filter((p) => selectedTransmissions.includes(p.gearTransmission));
    }
    if (selectedFuelTypes.length) {
      list = list.filter((p) => selectedFuelTypes.includes(p.fuelType));
    }
    if (yearFrom) {
      list = list.filter((p) => Number(p.yearOfMake) >= Number(yearFrom));
    }
    if (yearTo) {
      list = list.filter((p) => Number(p.yearOfMake) <= Number(yearTo));
    }
    if (maxPrice) {
      list = list.filter((p) => (p.salePrice || p.price) <= Number(maxPrice));
    }

    if (sortBy === "price-asc") {
      list = [...list].sort(
        (a, b) => (a.salePrice || a.price) - (b.salePrice || b.price)
      );
    } else if (sortBy === "price-desc") {
      list = [...list].sort(
        (a, b) => (b.salePrice || b.price) - (a.salePrice || a.price)
      );
    } else if (sortBy === "newest") {
      list = [...list].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }

    return list;
  }, [
    products,
    searchTerm,
    selectedSubCats,
    selectedBrands,
    selectedConditions,
    selectedTransmissions,
    selectedFuelTypes,
    yearFrom,
    yearTo,
    maxPrice,
    sortBy,
  ]);

  const clearAllFilters = () => {
    setSelectedSubCats([]);
    setSelectedBrands([]);
    setSelectedConditions([]);
    setSelectedTransmissions([]);
    setSelectedFuelTypes([]);
    setYearFrom("");
    setYearTo("");
    setMaxPrice("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 mt-8">
      {/* SEARCH BAR */}
      <div className="flex justify-center mb-8">
        <div className="relative w-full max-w-xl">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="e.g. Toyota Camry Engine 2018"
            className="w-full pl-11 pr-24 py-3 rounded-full border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 transition-colors"
            style={{ "--tw-ring-color": `${appConfig.colors.primary}40` }}
          />
          <button
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-full text-white text-xs font-semibold"
            style={{ background: appConfig.colors.primary }}
          >
            Search
          </button>
        </div>
      </div>

      {/* INFO BANNER */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-8">
        <p
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: appConfig.colors.primary }}
        >
          Know your part
        </p>
        <h1 className="text-xl md:text-2xl font-black text-gray-900 mt-1 capitalize">
          What is a {partName} used for?
        </h1>
        <p className="text-gray-500 text-sm mt-2 max-w-2xl">
          Every part plays a role in how your vehicle runs — from generating power to
          keeping systems cool and performance smooth. Explore genuine and trusted{" "}
          {partName?.toLowerCase()} options below.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">
          {[
            { icon: <Zap size={16} />, title: "Generates power", desc: "Converts fuel into motion." },
            { icon: <Gauge size={16} />, title: "Powers electronics", desc: "Runs lights, A/C & more." },
            { icon: <Wrench size={16} />, title: "Controls performance", desc: "Keeps efficiency stable." },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-3 rounded-2xl p-3"
              style={{ background: `${appConfig.colors.primary}08` }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${appConfig.colors.primary}20`, color: appConfig.colors.primary }}
              >
                {item.icon}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800">{item.title}</p>
                <p className="text-[11px] text-gray-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 pb-16">
        {/* LEFT: FILTER SIDEBAR */}
        <aside className="bg-white rounded-2xl border border-gray-100 p-5 h-fit lg:sticky lg:top-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 capitalize">{partName}</h3>
            <button
              onClick={clearAllFilters}
              className="text-xs font-semibold"
              style={{ color: appConfig.colors.primary }}
            >
              Clear
            </button>
          </div>

          <FilterGroup title="Category">
            {subCategoryOptions.map((opt) => (
              <FilterCheckbox
                key={opt}
                label={opt}
                checked={selectedSubCats.includes(opt)}
                onChange={() => toggleFilter(opt, selectedSubCats, setSelectedSubCats)}
              />
            ))}
            {subCategoryOptions.length === 0 && (
              <p className="text-xs text-gray-400">No categories</p>
            )}
          </FilterGroup>

          <FilterGroup title="Brand">
            {brandOptions.map((opt) => (
              <FilterCheckbox
                key={opt}
                label={opt}
                checked={selectedBrands.includes(opt)}
                onChange={() => toggleFilter(opt, selectedBrands, setSelectedBrands)}
              />
            ))}
            {brandOptions.length === 0 && (
              <p className="text-xs text-gray-400">No brands</p>
            )}
          </FilterGroup>

          <FilterGroup title="Year">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={yearFrom}
                onChange={(e) => setYearFrom(e.target.value)}
                placeholder="1990"
                className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none"
              />
              <span className="text-gray-400 text-xs">to</span>
              <input
                type="number"
                value={yearTo}
                onChange={(e) => setYearTo(e.target.value)}
                placeholder="2024"
                className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none"
              />
            </div>
          </FilterGroup>

          <FilterGroup title="Condition">
            {conditionOptions.map((opt) => (
              <FilterCheckbox
                key={opt}
                label={opt}
                checked={selectedConditions.includes(opt)}
                onChange={() =>
                  toggleFilter(opt, selectedConditions, setSelectedConditions)
                }
              />
            ))}
            {conditionOptions.length === 0 && (
              <p className="text-xs text-gray-400">No conditions</p>
            )}
          </FilterGroup>

          <FilterGroup title="Transmission">
            {transmissionOptions.map((opt) => (
              <FilterCheckbox
                key={opt}
                label={opt}
                checked={selectedTransmissions.includes(opt)}
                onChange={() =>
                  toggleFilter(opt, selectedTransmissions, setSelectedTransmissions)
                }
              />
            ))}
            {transmissionOptions.length === 0 && (
              <p className="text-xs text-gray-400">No transmissions</p>
            )}
          </FilterGroup>

          <FilterGroup title="Fuel Type">
            {fuelTypeOptions.map((opt) => (
              <FilterCheckbox
                key={opt}
                label={opt}
                checked={selectedFuelTypes.includes(opt)}
                onChange={() =>
                  toggleFilter(opt, selectedFuelTypes, setSelectedFuelTypes)
                }
              />
            ))}
            {fuelTypeOptions.length === 0 && (
              <p className="text-xs text-gray-400">No fuel types</p>
            )}
          </FilterGroup>

          <FilterGroup title="Max Price" last>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="e.g. 500000"
              className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none"
            />
          </FilterGroup>
        </aside>

        {/* RIGHT: RESULTS */}
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-lg font-black text-gray-900 capitalize">
              {partName}
              <span className="text-gray-400 font-medium text-sm ml-2">
                Showing {filteredProducts.length} of {products.length} results
              </span>
            </h2>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none"
            >
              <option value="default">Sort: Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin" size={40} color={appConfig.colors.primary} />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <p className="text-gray-500 text-sm">No parts match your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filteredProducts.map((product) => {
                const slug = slugify(product?.name);
                return (
                  <button
                    key={product._id}
                    onClick={() => navigate(`/product/${slug}`)}
                    className="text-left bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition group"
                  >
                    <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
                      <img
                        src={product?.images?.[0]?.url || "https://via.placeholder.com/300"}
                        alt={product?.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      {product?.grade && (
                        <span
                          className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white capitalize"
                          style={{ background: appConfig.colors.primary }}
                        >
                          {product.grade}
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-[11px] text-gray-400">
                        {product?.maker} · {product?.yearOfMake} · {product?.gearTransmission}
                      </p>
                      <h4 className="font-semibold text-sm text-gray-800 mt-0.5 line-clamp-2">
                        {product?.name}
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">
                        {product?.description}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <p
                          className="font-black text-sm"
                          style={{ color: appConfig.colors.primary }}
                        >
                          ₦{(product?.salePrice || product?.price)?.toLocaleString()}
                        </p>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/product/${slug}`);
                          }}
                          className="text-[11px] font-bold text-white px-3 py-1.5 rounded-lg"
                          style={{ background: appConfig.colors.primary }}
                        >
                          Buy
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children, last }) {
  return (
    <div className={`${last ? "" : "border-b border-gray-100 pb-4 mb-4"}`}>
      <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
        {title}
      </p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function FilterCheckbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="rounded"
        style={{ accentColor: appConfig.colors.primary }}
      />
      {label}
    </label>
  );
}