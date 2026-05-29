import { useEffect, useState } from "react";
import axios from "axios";

import {
  Search,
  MapPin,
  Store,
  PackageSearch,
  Star,
  BadgeCheck,
} from "lucide-react";

import { productCategories } from "../../categories/productCategories";
import appConfig from "../../config/appConfig";

export default function PriceChecker() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] =
    useState([]);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("");

  const [loading, setLoading] = useState(false);

  // FETCH PRODUCTS
  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/inventory/all`
      );

      const data =
        response.data?.products ||
        response.data ||
        [];

      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // FILTER PRODUCTS
  useEffect(() => {
    let filtered = [...products];

    // SEARCH FILTER
    if (search) {
      filtered = filtered.filter((item) =>
        item?.name
          ?.toLowerCase()
          ?.includes(search.toLowerCase())
      );
    }

    // CATEGORY FILTER
    if (selectedCategory) {
      filtered = filtered.filter(
        (item) =>
          item?.category ===
          selectedCategory
      );
    }

    setFilteredProducts(filtered);
  }, [search, selectedCategory, products]);

  return (
    <section className="bg-[#f7f7f8] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* HERO */}
        <div className="relative overflow-hidden rounded-[35px] bg-gradient-to-r from-black via-gray-900 to-gray-800 p-6 md:p-10 text-white">
          {/* BG GLOW */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 blur-3xl rounded-full" />

          <div className="relative z-10">
            {/* TITLE */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
                <PackageSearch size={28} />
              </div>

              <div>
                <h1 className="text-3xl md:text-5xl font-black">
                  Price Checker
                </h1>

                <p className="text-gray-300 mt-2">
                  Compare prices from multiple
                  sellers instantly
                </p>
              </div>
            </div>

            {/* SEARCH AREA */}
            <div className="mt-8 grid md:grid-cols-[1fr_250px] gap-4">
              {/* SEARCH */}
              <div className="relative">
                <Search
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />

                <input
                  type="text"
                  placeholder="Search product name..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  className="w-full h-16 rounded-2xl bg-white text-black pl-14 pr-5 outline-none border-0 text-lg font-medium shadow-xl"
                />
              </div>

              {/* CATEGORY */}
              <select
                value={selectedCategory}
                onChange={(e) =>
                  setSelectedCategory(
                    e.target.value
                  )
                }
                className="h-16 rounded-2xl px-5 bg-white text-black font-semibold outline-none shadow-xl"
              >
                <option value="">
                  All Categories
                </option>

                {productCategories.map(
                  (category) => (
                    <option
                      key={category.id}
                      value={category.name}
                    >
                      {category.name}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
        </div>

        {/* RESULTS */}
        <div className="mt-10">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900">
                Matching Products
              </h2>

              <p className="text-gray-500 mt-1">
                {filteredProducts.length} product
                found
              </p>
            </div>
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="h-[280px] rounded-3xl bg-gray-200 animate-pulse"
                />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            /* EMPTY */
            <div className="bg-white rounded-3xl p-10 text-center shadow-sm">
              <h3 className="text-2xl font-black text-gray-800">
                No Products Found
              </h3>

              <p className="text-gray-500 mt-2">
                Try another product name or
                category
              </p>
            </div>
          ) : (
            /* PRODUCTS GRID */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className="group bg-white rounded-[30px] overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300"
                >
                  {/* IMAGE */}
                  <div className="relative overflow-hidden">
                    <img
                      src={
                        product?.images?.[0]
                          ?.url ||
                        "https://via.placeholder.com/500"
                      }
                      alt={product?.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition duration-500"
                    />

                    {/* CATEGORY */}
                    <div className="absolute top-4 left-4">
                      <div className="bg-black/70 backdrop-blur text-white px-4 py-2 rounded-full text-xs font-bold">
                        {product?.category}
                      </div>
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="p-5">
                    {/* PRODUCT NAME */}
                    <h3 className="text-xl font-black text-gray-900 line-clamp-2 min-h-[60px]">
                      {product?.name}
                    </h3>

                    {/* PRICE */}
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <h2
                          className="text-3xl font-black"
                          style={{
                            color:
                              appConfig.colors
                                .primary,
                          }}
                        >
                          ₦
                          {(
                            product?.salePrice ||
                            product?.price
                          )?.toLocaleString()}
                        </h2>

                        {product?.salePrice && (
                          <p className="text-gray-400 line-through text-sm mt-1">
                            ₦
                            {product?.price?.toLocaleString()}
                          </p>
                        )}
                      </div>

                      {/* STOCK */}
                      <div
                        className={`px-3 py-2 rounded-full text-xs font-bold ${
                          product?.stockQuantity >
                          0
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {product?.stockQuantity >
                        0
                          ? `${product?.stockQuantity} Left`
                          : "Out Of Stock"}
                      </div>
                    </div>

                    {/* SELLER */}
                    <div className="mt-6 rounded-2xl bg-gray-50 p-4 border border-gray-100">
                      {/* TOP */}
                      <div className="flex items-start gap-3">
                        {/* AVATAR */}
                        <img
                          src={
                            product?.seller
                              ?.profilePicture ||
                            "https://ui-avatars.com/api/?name=Seller"
                          }
                          alt=""
                          className="w-14 h-14 rounded-2xl object-cover"
                        />

                        <div className="flex-1">
                          {/* BUSINESS NAME */}
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-gray-900 line-clamp-1">
                              {product?.seller
                                ?.businessProfile
                                ?.businessName ||
                                product?.seller
                                  ?.sellerProfile
                                  ?.shopName ||
                                `${product?.seller?.firstName} ${product?.seller?.lastName}`}
                            </h4>

                            {product?.seller
                              ?.businessProfile
                              ?.verified && (
                              <BadgeCheck
                                size={18}
                                className="text-sky-500"
                              />
                            )}
                          </div>

                          {/* ADDRESS */}
                          <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm">
                            <MapPin
                              size={15}
                            />

                            <span className="line-clamp-1">
                              {product?.seller
                                ?.businessProfile
                                ?.businessAddress ||
                                `${product?.seller?.state || ""} ${product?.seller?.lga || ""}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* FOOTER */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star
                            fill="currentColor"
                            size={16}
                          />

                          <span className="text-sm font-bold text-gray-700">
                            {product?.ratings ||
                              0}
                          </span>
                        </div>

                        <button className="px-4 py-2 rounded-xl bg-black text-white text-sm font-bold hover:opacity-90 transition">
                          View Product
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}