// import { useEffect, useMemo, useState } from "react";
// import axios from "axios";
// import ProductCard from "./FoodproductCard";
// import categories from "../../../config/productcategories";
// // PopularFood.jsx — add this
// import useUserLocation from "../../../config/useUserLocation";

// // ...
// const { location: userLocation } = useUserLocation();
// // ...



// const GROCERY_CATEGORY = categories.find((c) => c.id === "groceries");
// const SUBCATEGORY_FILTERS = ["All", ...(GROCERY_CATEGORY?.subcategories || [])];

// export default function PopularFood() {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeFilter, setActiveFilter] = useState("All");

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   const fetchProducts = async () => {
//     try {
//       const response = await axios.get(
//         `${import.meta.env.VITE_BACKEND_URL}/api/inventory/all`
//       );

//       const allProducts = response.data?.products || response.data || [];

//       // FILTER GROCERIES PRODUCTS
//       const groceryProducts = allProducts.filter((product) =>
//         product?.category?.toLowerCase()?.includes("groceries")
//       );

//       setProducts(groceryProducts);
//     } catch (error) {
//       console.log(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredProducts = useMemo(() => {
//     if (activeFilter === "All") return products;
//     return products.filter(
//       (p) => p?.subCategory?.toLowerCase() === activeFilter.toLowerCase()
//     );
//   }, [products, activeFilter]);

//   return (
//     <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-16 sm:mt-24">
//       <h2 className="text-center text-xl sm:text-2xl font-extrabold text-gray-900">
//         Popular Food
//       </h2>

//       {/* Filter pills — subcategories pulled from the groceries category */}
//       <div className="mt-6 flex gap-2 overflow-x-auto pb-2 no-scrollbar justify-start sm:justify-center">
//         {SUBCATEGORY_FILTERS.map((label) => (
//           <button
//             key={label}
//             onClick={() => setActiveFilter(label)}
//             className={`shrink-0 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold capitalize transition-colors ${
//               activeFilter === label
//                 ? "bg-red-500 text-white shadow"
//                 : "bg-gray-100 text-gray-500 hover:bg-gray-200"
//             }`}
//           >
//             {label}
//           </button>
//         ))}
//       </div>

//       {/* Grid */}
//       <div className="mt-8 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
//         {loading &&
//           Array.from({ length: 6 }).map((_, i) => (
//             <div
//               key={i}
//               className="h-56 sm:h-64 rounded-3xl bg-gray-100 animate-pulse"
//             />
//           ))}

//         {!loading && filteredProducts.length === 0 && (
//           <p className="col-span-full text-center text-sm text-gray-400 py-10">
//             No dishes found in this category yet.
//           </p>
//         )}

//         {!loading &&
//           filteredProducts.map((product) => (
//             // <ProductCard key={product._id} product={product} />
//             <ProductCard key={product._id} product={product} userLocation={userLocation} />
//           ))}
//       </div>
//     </section>
//   );
// }




import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Search } from "lucide-react";
import ProductCard from "./FoodproductCard";
import categories from "../../../config/productcategories";
import useUserLocation from "../../../config/useUserLocation";


const GROCERY_CATEGORY = categories.find((c) => c.id === "groceries");
const SUBCATEGORY_FILTERS = ["All", ...(GROCERY_CATEGORY?.subcategories || [])];

export default function PopularFood() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const { location: userLocation } = useUserLocation();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/inventory/all`
      );

      const allProducts = response.data?.products || response.data || [];

      const groceryProducts = allProducts.filter((product) =>
        product?.category?.toLowerCase()?.includes("groceries")
      );

      setProducts(groceryProducts);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    let result = products;

    if (activeFilter !== "All") {
      result = result.filter(
        (p) => p?.subCategory?.toLowerCase() === activeFilter.toLowerCase()
      );
    }

    const term = searchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter((p) => {
        const name = p?.name?.toLowerCase() || "";
        const businessName =
          p?.seller?.businessProfile?.businessName?.toLowerCase() || "";
        const username = p?.seller?.username?.toLowerCase() || "";
        return (
          name.includes(term) ||
          businessName.includes(term) ||
          username.includes(term)
        );
      });
    }

    return result;
  }, [products, activeFilter, searchTerm]);

  return (
    <section id="popular-food" className="max-w-7xl mx-auto px-4 sm:px-6 mt-16 sm:mt-24">
      <h2 className="text-center text-xl sm:text-2xl font-extrabold text-gray-900">
        Popular Food
      </h2>

      {/* Search */}
      <div className="mt-5 max-w-md mx-auto relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search dishes or sellers..."
          className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:bg-white transition-colors"
        />
      </div>

      {/* Filter pills */}
      <div className="mt-6 flex gap-2 overflow-x-auto pb-2 no-scrollbar justify-start sm:justify-center">
        {SUBCATEGORY_FILTERS.map((label) => (
          <button
            key={label}
            onClick={() => setActiveFilter(label)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold capitalize transition-colors ${
              activeFilter === label
                ? "bg-red-500 text-white shadow"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-56 sm:h-64 rounded-3xl bg-gray-100 animate-pulse"
            />
          ))}

        {!loading && filteredProducts.length === 0 && (
          <p className="col-span-full text-center text-sm text-gray-400 py-10">
            {searchTerm
              ? `No results for "${searchTerm}"`
              : "No dishes found in this category yet."}
          </p>
        )}

        {!loading &&
          filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              userLocation={userLocation}
            />
          ))}
      </div>
    </section>
  );
}