import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useUserLocation, getDistanceKm } from './../../location/UserLocation';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { useJobDistance } from "../../location/UseJobDistance";
import "swiper/css";
import "swiper/css/navigation";
import axios from "axios";

import {
  Heart,
  ShoppingCart,
  Star,
  Truck,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import JobLocationMap from "../../location/JobLocationMap";
import appConfig from "../../config/appConfig";
import { MapPin } from "lucide-react";
export default function ProductDetails() {
  const { slug } = useParams();

  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [loading, setLoading] = useState(true);
const [relatedProducts, setRelatedProducts] = useState([]);
const { location: userLocation } = useUserLocation();
const { distanceKm, driveMinutes, distanceLoading } = useJobDistance(userLocation, product?.seller?.lga, product?.seller?.state);

  // SLUGIFY
  const slugify = (text) => {
    return text
      ?.toLowerCase()
      ?.replace(/[^\w ]+/g, "")
      ?.replace(/ +/g, "-");
  };

  // FETCH PRODUCT
//   const fetchProduct = async () => {
//     try {
//       const response = await axios.get(
//         `${import.meta.env.VITE_BACKEND_URL}/api/inventory/all`
//       );

//       const products =
//         response.data?.products ||
//         response.data ||
//         [];

//       // FIND PRODUCT USING SLUG
//       const foundProduct = products.find(
//         (item) => slugify(item.name) === slug
//       );

//       setProduct(foundProduct);

//       if (foundProduct?.images?.length > 0) {
//         setMainImage(
//           foundProduct.images[0].url
//         );
//       }
//     } catch (error) {
//       console.log("PRODUCT ERROR:", error);
//     } finally {
//       setLoading(false);
//     }
//   };


  const fetchProduct = async () => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/api/inventory/all`
    );


    const products =
      response.data?.products ||
      response.data ||
      [];

    // FIND CURRENT PRODUCT
    const foundProduct = products.find(
      (item) => slugify(item.name) === slug
    );

    setProduct(foundProduct);

    // MAIN IMAGE
    if (foundProduct?.images?.length > 0) {
      setMainImage(
        foundProduct.images[0].url
      );
    }

    // RELATED PRODUCTS
    const related = products.filter(
      (item) =>
        item.category ===
          foundProduct?.category &&
        item._id !== foundProduct?._id
    );

    setRelatedProducts(related);
  } catch (error) {
    console.log("PRODUCT ERROR:", error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  // LOADING
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f5f5f7]">
        <Loader2
          className="animate-spin"
          size={45}
          color={appConfig.colors.primary}
        />
      </div>
    );
  }

  // PRODUCT NOT FOUND
  if (!product) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#f5f5f7]">
        <h1 className="text-3xl font-black text-gray-800">
          Product Not Found
        </h1>

        <p className="text-gray-500 mt-3">
          The product you are looking for does not exist.
        </p>
      </div>
    );
  }

  return (
    <section className="bg-[#f5f5f7] min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-3xl p-5 md:p-8 grid lg:grid-cols-2 gap-10 shadow-sm">
          {/* LEFT SIDE */}
          <div>
            {/* MAIN IMAGE */}
            <div className="bg-gray-100 rounded-3xl overflow-hidden">
              <img
                src={
                  mainImage ||
                  "https://via.placeholder.com/700"
                }
                alt={product?.name}
                className="w-full h-[350px] md:h-[550px] object-cover"
              />
            </div>

            {/* THUMBNAILS */}
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
              {product?.images?.map((img, index) => (
                <button
                  key={index}
                  onClick={() =>
                    setMainImage(img.url)
                  }
                  className={`border-2 rounded-2xl overflow-hidden min-w-[90px] transition-all ${
                    mainImage === img.url
                      ? "border-[#8B1E3F]"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={img.url}
                    alt=""
                    className="w-20 h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div>
            {/* CATEGORY */}
            <p
              className="uppercase text-sm font-bold tracking-wider"
              style={{
                color: appConfig.colors.primary,
              }}
            >
              {product?.category}
            </p>

            {/* NAME */}
            <h1 className="text-1xl md:text-3xl font-black mt-3 text-gray-900 leading-tight">
              {product?.name}
            </h1>

            {/* BRAND */}
            {product?.brand && (
              <p className="mt-3 text-gray-500">
                Brand:
                <span className="font-semibold text-gray-800 ml-2">
                  {product.brand}
                </span>
              </p>
            )}

            {/* RATINGS */}
            <div className="flex items-center gap-2 mt-4">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    fill="currentColor"
                    size={20}
                  />
                ))}
              </div>

              <span className="text-gray-500">
                ({product?.ratings || 0} Ratings)
              </span>
            </div>

            {/* PRICE */}
            <div className="mt-6">
              <h2
                className="text-4xl md:text-5xl font-black"
                style={{
                  color: appConfig.colors.primary,
                }}
              >
                ₦
                {(
                  product?.salePrice ||
                  product?.price
                )?.toLocaleString()}
              </h2>

              {product?.salePrice && (
                <p className="line-through text-gray-400 mt-2 text-xl">
                  ₦
                  {product?.price?.toLocaleString()}
                </p>
              )}
            </div>

            {/* STOCK */}
            <div className="mt-6 flex items-center gap-4">
              <span className="font-semibold">
                Stock Left:
              </span>

              <span
                className={`px-4 py-2 rounded-full text-sm font-bold ${
                  product?.stockQuantity > 0
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {product?.stockQuantity > 0
                  ? `${product?.stockQuantity} Available`
                  : "Out Of Stock"}
              </span>
            </div>

            {/* DESCRIPTION */}
            <div className="mt-8">
              <h3 className="font-bold text-xl">
                Description
              </h3>

              <p className="text-gray-600 leading-relaxed mt-3">
                {product?.description}
              </p>
            </div>

            {/* TAGS */}
            {product?.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 rounded-full bg-gray-100 text-sm font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex flex-col md:flex-row gap-4 mt-10">
              <button
                className="flex-1 py-4 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-3 hover:scale-[1.02] transition"
                style={{
                  background: appConfig.colors.primary,
                }}
              >
                <ShoppingCart />
                Add To Cart
              </button>

              <button className="w-full md:w-16 h-16 rounded-2xl border flex items-center justify-center hover:bg-gray-50">
                <Heart />
              </button>
            </div>

            {/* FEATURES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
              <div className="border rounded-2xl p-4 flex gap-4">
                <Truck
                  color={appConfig.colors.primary}
                />

                <div>
                  <h4 className="font-bold">
                    Fast Delivery
                  </h4>

                  <p className="text-sm text-gray-500">
                    Nationwide shipping available
                  </p>
                </div>
              </div>

              <div className="border rounded-2xl p-4 flex gap-4">
                <ShieldCheck
                  color={appConfig.colors.primary}
                />

                <div>
                  <h4 className="font-bold">
                    Secure Payments
                  </h4>

                  <p className="text-sm text-gray-500">
                    100% secure payment system
                  </p>
                </div>
              </div>
            </div>

            {/* SPECIFICATIONS */}
            {product?.specifications &&
              Object.keys(product.specifications)
                .length > 0 && (
                <div className="mt-10">
                  <h3 className="font-bold text-xl mb-4">
                    Specifications
                  </h3>

                  <div className="border rounded-2xl overflow-hidden">
                    {Object.entries(
                      product.specifications
                    ).map(
                      ([key, value], index) => (
                        <div
                          key={index}
                          className="grid grid-cols-2 border-b last:border-0"
                        >
                          <div className="bg-gray-50 p-4 font-semibold capitalize">
                            {key}
                          </div>

                          <div className="p-4 text-gray-600">
                            {value}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              
          </div>

        </div>
          {/* SELLER INFO */}
{/* SELLER INFO */}
<div className="mt-10 border border-gray-200 rounded-3xl overflow-hidden shadow-sm bg-white">
  
  {/* HEADER */}
  <div
    className="px-6 py-5 text-white flex items-center gap-3"
    style={{ background: appConfig.colors.primary }}
  >
    <div className="w-8 h-8 bg-white/20 rounded-2xl flex items-center justify-center">
      👤
    </div>
    <h2 className="font-bold text-xl">Seller Information</h2>
  </div>

  {/* CONTENT */}
  <div className="p-6">
    {/* Seller Profile Header */}
    <div className="flex flex-col sm:flex-row items-start gap-5">
      {/* PROFILE IMAGE */}
      <img
        src={
          product?.seller?.profilePicture ||
          "https://ui-avatars.com/api/?name=Seller"
        }
        alt="Seller"
        className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-md flex-shrink-0"
      />

      {/* SELLER DETAILS */}
      <div className="flex-1 min-w-0">
        <h3 className="text-2xl font-black text-gray-900 leading-tight">
          {product?.seller?.businessProfile?.businessName ||
           product?.seller?.sellerProfile?.shopName ||
           `${product?.seller?.firstName} ${product?.seller?.lastName}`}
        </h3>

        <p className="text-gray-500 mt-1 text-lg">
          @{product?.seller?.username}
        </p>

        {/* BADGES */}
        <div className="flex flex-wrap gap-2 mt-4">
          {product?.seller?.isSeller && (
            <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1">
              ✓ Verified Seller
            </span>
          )}

          {product?.seller?.businessProfile?.verified && (
            <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1">
              ✓ Verified Business
            </span>
          )}
        </div>
      </div>
    </div>

    {/* DESCRIPTION */}
    {product?.seller?.sellerProfile?.shopDescription && (
      <div className="mt-8">
        <h4 className="font-semibold text-gray-800 text-lg mb-3">About the Seller</h4>
        <p className="text-gray-600 leading-relaxed text-[15.5px]">
          {product?.seller?.sellerProfile?.shopDescription}
        </p>
      </div>
    )}

    {/* CONTACT & BUSINESS INFO */}
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
      
      {/* Phone */}
      <div className="bg-gray-50 rounded-3xl p-5 hover:bg-gray-100 transition-colors">
        <p className="text-xs tracking-widest text-gray-400 uppercase font-medium">Phone Number</p>
        <h4 className="font-bold text-gray-800 mt-2 text-lg">
          {product?.seller?.phoneNumber || "Not Available"}
        </h4>
      </div>

      {/* Email */}
      <div className="bg-gray-50 rounded-3xl p-5 hover:bg-gray-100 transition-colors">
        <p className="text-xs tracking-widest text-gray-400 uppercase font-medium">Email Address</p>
        <h4 className="font-bold text-gray-800 mt-2 text-lg break-all">
          {product?.seller?.email || "Not Available"}
        </h4>
      </div>

      {/* Location with Map */}
      <div className="md:col-span-2 bg-gray-50 rounded-3xl p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs tracking-widest text-gray-400 uppercase font-medium">Location</p>
            <h4 className="font-bold text-gray-800 mt-1 text-lg">
              {product?.seller?.state}, {product?.seller?.lga}
            </h4>
          </div>
          
          {/* Distance Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-5 py-2 rounded-2xl text-sm">
            <MapPin className="w-4 h-4 text-emerald-600" />
            {!userLocation ? (
              <span className="text-gray-500">Enable location</span>
            ) : distanceLoading ? (
              <span className="text-gray-400 animate-pulse">Calculating...</span>
            ) : distanceKm != null ? (
              <span className="font-medium text-emerald-700">
                {distanceKm < 1
                  ? `${Math.round(distanceKm * 1000)}m away`
                  : `${distanceKm.toFixed(1)} km away`}
                {' · '}~{driveMinutes} min drive
              </span>
            ) : (
              <span className="text-gray-400">Distance N/A</span>
            )}
          </div>
        </div>

        {/* MAP */}
        <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200 shadow-inner">
          <JobLocationMap
            lga={product?.seller?.lga}
            state={product?.seller?.state}
            address={product?.seller?.businessProfile?.businessAddress}
          />
        </div>
      </div>

      {/* Business Years */}
      <div className="bg-gray-50 rounded-3xl p-5">
        <p className="text-xs tracking-widest text-gray-400 uppercase font-medium">Years In Business</p>
        <h4 className="font-bold text-gray-800 mt-2 text-2xl">
          {product?.seller?.businessProfile?.yearsInBusiness || 0}{" "}
          <span className="text-base font-normal text-gray-500">Years</span>
        </h4>
      </div>
    </div>

    {/* BUSINESS ADDRESS */}
    {product?.seller?.businessProfile?.businessAddress && (
      <div className="mt-6 bg-gray-50 rounded-3xl p-5">
        <p className="text-xs tracking-widest text-gray-400 uppercase font-medium">Business Address</p>
        <h4 className="font-medium text-gray-700 mt-2 leading-relaxed">
          {product?.seller?.businessProfile?.businessAddress}
        </h4>
      </div>
    )}

    {/* SELLER STATS */}
    <div className="grid grid-cols-3 gap-4 mt-8">
      <div className="bg-gray-50 rounded-3xl p-5 text-center hover:bg-gray-100 transition-colors">
        <h3 className="text-3xl font-black" style={{ color: appConfig.colors.primary }}>
          {product?.seller?.businessProfile?.likes || 0}
        </h3>
        <p className="text-xs text-gray-500 mt-1 font-medium">Likes</p>
      </div>

      <div className="bg-gray-50 rounded-3xl p-5 text-center hover:bg-gray-100 transition-colors">
        <h3 className="text-3xl font-black" style={{ color: appConfig.colors.primary }}>
          {product?.seller?.businessProfile?.shares || 0}
        </h3>
        <p className="text-xs text-gray-500 mt-1 font-medium">Shares</p>
      </div>

      <div className="bg-gray-50 rounded-3xl p-5 text-center hover:bg-gray-100 transition-colors">
        <h3 className="text-3xl font-black" style={{ color: appConfig.colors.primary }}>
          {product?.seller?.businessProfile?.reviews?.length || 0}
        </h3>
        <p className="text-xs text-gray-500 mt-1 font-medium">Reviews</p>
      </div>
    </div>
  </div>
</div>
        {/* RELATED PRODUCTS */}
{relatedProducts.length > 0 && (
  <div className="mt-12">
    {/* HEADER */}
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-1xl md:text-2xl font-black text-gray-900">
          You May Also Like
        </h2>

        <p className="text-gray-500 mt-1">
          Similar products in this category
        </p>
      </div>
    </div>

    {/* SWIPER */}
    <Swiper
      modules={[Navigation, Autoplay]}
      navigation
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
      }}
      spaceBetween={20}
      slidesPerView={2}
      breakpoints={{
        480: {
          slidesPerView: 2,
        },

        640: {
          slidesPerView: 3,
        },

        1024: {
          slidesPerView: 4,
        },

        1280: {
          slidesPerView: 5,
        },
      }}
    >
      {relatedProducts.map((item) => {
        const relatedSlug = slugify(
          item.name
        );

        return (
          <SwiperSlide key={item._id}>
            <Link
              to={`/product/${relatedSlug}`}
            >
              <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 group">
                {/* IMAGE */}
                <div className="overflow-hidden relative">
                  <img
                    src={
                      item?.images?.[0]
                        ?.url ||
                      "https://via.placeholder.com/500"
                    }
                    alt={item?.name}
                    className="w-full h-52 object-cover group-hover:scale-105 transition duration-500"
                  />

                  {/* SALE */}
                  {item?.salePrice && (
                    <div
                      className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white"
                      style={{
                        background:
                          appConfig.colors
                            .primary,
                      }}
                    >
                      SALE
                    </div>
                  )}
                </div>

                {/* CONTENT */}
                <div className="p-4">
                  {/* CATEGORY */}
                  <p
                    className="uppercase text-xs font-bold tracking-wider"
                    style={{
                      color:
                        appConfig.colors
                          .primary,
                    }}
                  >
                    {item?.category}
                  </p>

                  {/* NAME */}
                  <h3 className="font-semibold text-gray-800 mt-2 line-clamp-2 min-h-[48px]">
                    {item?.name}
                  </h3>

                  {/* RATING */}
                  <div className="flex items-center gap-1 mt-3">
                    <Star
                      size={15}
                      fill="currentColor"
                      className="text-amber-400"
                    />

                    <span className="text-sm text-gray-500">
                      {item?.ratings || 0}
                    </span>
                  </div>

                  {/* PRICE */}
                  <div className="mt-3">
                    <h3
                      className="text-2xl font-black"
                      style={{
                        color:
                          appConfig.colors
                            .primary,
                      }}
                    >
                      ₦
                      {(
                        item?.salePrice ||
                        item?.price
                      )?.toLocaleString()}
                    </h3>

                    {item?.salePrice && (
                      <p className="line-through text-gray-400 text-sm mt-1">
                        ₦
                        {item?.price?.toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* STOCK */}
                  <div className="mt-3">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        item?.stockQuantity > 0
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item?.stockQuantity > 0
                        ? `${item.stockQuantity} Left`
                        : "Out Of Stock"}
                    </span>
                  </div>

                  {/* BUTTON */}
                  {/* <button
                    className="w-full mt-4 py-3 rounded-2xl text-white font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition"
                    style={{
                      background:
                        appConfig.colors
                          .primary,
                    }}
                  >
                    <ShoppingCart
                      size={18}
                    />
                    View Product
                  </button> */}
                </div>
              </div>
            </Link>
          </SwiperSlide>
        );
      })}
    </Swiper>
  </div>
)}
      </div>
    </section>
  );
}