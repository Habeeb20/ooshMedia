/* eslint-disable no-unused-vars */
import Navbar from "./components/Navbar";
import { useEffect } from "react";
import {
  BrowserRouter,
  Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "sonner";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Home from "./pages/Home/Home";
import ProductDetails from "./pages/product/ProductDetails";
// import PriceChecker from "./pages/product/PriceChecker";
import VendorsPage from "./pages/vendor/Vendor";
import SellerDetail from "./pages/vendor/vendorDetails";
import ProtectedRoute from "./config/protectedRoute";
import DistributionChainView from "./pages/vendor/DistributionChainView";
import FeedPage from "./pages/post/FeedPage";
import ProductsGrid from "./components/home/ProductByCategory";
import SearchResults from "./components/home/SearchResult";
import AdVerifyPage from "./pages/ads/AdVerify";
import CartPage from "./pages/order/CartPage";
import CheckoutPage from "./pages/order/CheckoutPage";
import SellerDashboard from "./pages/order/SellerDashboard";
import BuyerDashboard from "./pages/order/BuyerDashboard";
import OrderDetailPage from "./pages/order/OrderDetailPage";
import PaymentVerifyPage from "./pages/order/PaymentVerifyPage";
import POSPage from "./pages/order/POSPage";
import { CartProvider } from "./context/cartContext";
import SubscriptionVerify from "./pages/Deal/SubscriptionVerify";
import Eparts from "./pages/others/Eparts";
import AdminLogin from "./pages/adminDashboard/AdminLogin";
import MarketPlace from "./pages/Home/MarketPlace";
import { loadGoogleMaps } from "./config/LoadGoogleMap";
import { disconnectSocket } from "./config/UsesSocket";

import { useLocation } from "react-router-dom";

// import BuyerOrderTracking from "./pages/Buyerordertracking";
import RiderDashboard from "./pages/rider/RiderDashboard";
import BuyerOrdersDashboard from "./pages/order/BuyerOrderDashboard";
import AdminDashboard from "./pages/adminDashboard/AdminDashboard";
import PriceCheckers from "./pages/Home/PriceChecker";
import CategoriesPage from "./components/home/CategoryPage";
import { useScrollToTop } from "./useScrolltoTheTop";
import BeautyMarketplace from "./pages/others/Busibody";
import HerbalMarketplace from "./pages/others/Eherbal";
import InventoryAccessCallback from "./pages/vendor/Inventoryaccesscallback";
import VerifyCallback from "./pages/VerifyCallback";

import AutoParts from "./pages/others/carpart/Autoparts";
import Topbar from "./components/home/Topbar";
import ProductsPage from "./pages/product/ProductsPage";
import { trackPageView } from "./pages/analytics";
import HeroSection from "./pages/others/food/FoodHeroSection";
import HomePage from "./pages/others/food/FoodHomepage";
import BlacklistedSellers from "./pages/BlacklistedUsers";
import SellerStorefront from "./pages/others/food/foodSellerStorefront";
import VideoGridPage from "./components/home/VideoGridPage";
import ForgotPasswordFlow from "./pages/auth/Forgotpassword";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordpage";
import PriceChecker from "./pages/others/PriceChecker/Checker";
import RawMaterials from "./components/home/RawMaterials";
import ExploreProducers from "./components/home/ExploreProducers";
import getStoreSlug from "./config/getslug";
import CarPartsListing from "./pages/others/carpart/CarpartListing";
import ExchangeRateTicker from "./components/home/ExchangeRateTicket";
const App = () => {
  useScrollToTop();
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  useEffect(() => {
    loadGoogleMaps().catch((err) =>
      console.error("Google Maps failed to load:", err),
    );
  }, []);

  const slug = getStoreSlug()
  const RootElement = slug ? <SellerDetail /> : <Home />;
  return (
    <>
      <CartProvider>
        <Toaster richColors position="top-right" />

        <Navbar />
      
        {/* Your other content with pt-20 */}
        <div className="pt-20">
          <Routes>
            {/* <Route path="/" element={<Home />} /> */}
            <Route path="/" element={RootElement} />
            <Route path="/product/:slug" element={<ProductDetails />} />

            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <CartPage />
                </ProtectedRoute>
              }
            />

            <Route path="/blacklisted-sellers" element={<BlacklistedSellers />} />
            <Route path="/category/automotive/part/:partSlug" element={<CarPartsListing />} />
            <Route path="/category/automotive/brand/:partSlug" element={<CarPartsListing />} />


            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/order/:orderId"
              element={
                <ProtectedRoute>
                  <OrderDetailPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/order/verify-payment"
              element={
                <ProtectedRoute>
                  <PaymentVerifyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/product/:slug/:id"
              element={
                <ProtectedRoute>
                  <ProductDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/product/:slug/:id"
              element={
                <ProtectedRoute>
                  <ProductDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/product/:id"
              element={
                <ProtectedRoute>
                  <ProductDetails />
                </ProtectedRoute>
              }
            />
            <Route path="/payment/verify/" element={<PaymentVerifyPage />} />
            <Route
              path="/subscription/verify"
              element={<SubscriptionVerify />}
            />

            <Route
              path="/seller/:businessName/:id"
              element={
                <ProtectedRoute>
                  <SellerDetail />
                </ProtectedRoute>
              }
            />

            <Route
              path="/orders/:orderId/track"
              element={<BuyerOrdersDashboard />}
            />

            {/* Rider: their delivery dashboard */}
            <Route path="/rider/dashboard" element={<RiderDashboard />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/b2b-sourcing/raw-materials" element={<RawMaterials />} />
            <Route path="/b2b-sourcing/producers" element={<ExploreProducers />} />

            <Route path="/marketplace" element={<MarketPlace />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/signup" element={<Signup />} />
            {/* <Route path="/price-checker" element={<PriceChecker />} /> */}
            <Route path="/price-checker" element={<PriceCheckers />} />
            <Route path="/vendors" element={<VendorsPage />} />
            <Route path="/chain" element={<DistributionChainView />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard/*" element={<Dashboard />} />
            <Route path="/business/*" element={<FeedPage />} />
            <Route path="/food" element={<HomePage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            <Route path="/category/:categorySlug" element={<ProductsGrid />} />

            <Route path="/seller/:sellerId" element={<SellerStorefront />} />
            <Route path="/videos" element={<VideoGridPage />} />


            <Route path="/category/:categorySlug/:subCategorySlug" element={<ProductsGrid />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/dashboard/ads/verify" element={<AdVerifyPage />} />

            <Route
              path="/dashboard/inventory-access/callback"
              element={<InventoryAccessCallback />}
            />
            <Route path="/verify/callback" element={<VerifyCallback />} />
            <Route path="/eparts" element={<Eparts />} />
            <Route path="/carparts" element={<AutoParts />} />
            <Route path="/busibody" element={<BeautyMarketplace />} />
            <Route path="/herbal" element={<HerbalMarketplace />} />
            <Route path="/priceChecker" element={<PriceChecker />} />
          </Routes>
        </div>
      </CartProvider>
    </>
  );
};

export default App;






































