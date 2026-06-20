import Navbar from "./components/Navbar";
import { useEffect } from "react";
import { BrowserRouter, Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Home from "./pages/Home/Home";
import ProductDetails from "./pages/product/ProductDetails";
import PriceChecker from "./pages/product/PriceChecker";
import VendorsPage from "./pages/vendor/Vendor";
import SellerDetail from "./pages/vendor/vendorDetails"
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
import {CartProvider} from "./context/cartContext"
import SubscriptionVerify from "./pages/Deal/SubscriptionVerify";
import Eparts from "./pages/others/Eparts";
import AdminLogin from "./pages/adminDashboard/AdminLogin"
import MarketPlace from "./pages/Home/MarketPlace"
import { loadGoogleMaps } from "./config/LoadGoogleMap";
import { disconnectSocket } from "./config/UsesSocket";

// import BuyerOrderTracking from "./pages/Buyerordertracking";
import RiderDashboard from "./pages/rider/RiderDashboard";
import BuyerOrdersDashboard from "./pages/order/BuyerOrderDashboard";
import AdminDashboard from "./pages/adminDashboard/AdminDashboard";
const App =()=>  {

    useEffect(() => {
    loadGoogleMaps().catch((err) => console.error('Google Maps failed to load:', err));
  }, []);

  return (
    <>
        <CartProvider>

   
            <Toaster richColors position="top-right" />
      <Navbar />
      {/* Your other content with pt-20 */}
      <div className="pt-20">
        <Routes>
                            <Route path="/" element={<Home />} />
                            
        <Route
          path="/product/:slug"
          element={
               <ProtectedRoute>
                <ProductDetails />
                </ProtectedRoute>}
        />


        <Route path="/cart" 
        element={
          <ProtectedRoute>
            <CartPage />
            </ProtectedRoute>
        }
        />

        <Route path="/checkout" 
        element={
          <ProtectedRoute>
            <CheckoutPage />
            </ProtectedRoute>
        }
        />
        <Route path="/checkout"
        element={
          <ProtectedRoute>
            <CheckoutPage />
            </ProtectedRoute>
        }
        />
        <Route path="/order/:orderId" 
        element={
          <ProtectedRoute>
            <OrderDetailPage />
            </ProtectedRoute>
        }
        />

        <Route path="/order/verify-payment"
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
                </ProtectedRoute>}
        />
        <Route
          path="/product/:slug/:id"
             element={
               <ProtectedRoute>
                <ProductDetails />
                </ProtectedRoute>}
        />
        <Route
          path="/payment/verify/"
             element={
           
                <PaymentVerifyPage />
              }
        />
     <Route path="/subscription/verify" element={<SubscriptionVerify />} />


    
       <Route 
          path="/seller/:businessName/:id" 
          element={
             <ProtectedRoute>
                  <SellerDetail />
             </ProtectedRoute>
        } 
        />

            <Route path="/orders/:orderId/track" element={<BuyerOrdersDashboard />} />
 
        {/* Rider: their delivery dashboard */}
        <Route path="/rider/dashboard" element={<RiderDashboard />} />
                             <Route path="/admin/login" element={<AdminLogin />} />

                            <Route path="/marketplace" element={<MarketPlace />} />
                            <Route path="/products" element={<MarketPlace />} />
                            <Route path="/signup" element={<Signup />} />
                            <Route path="/price-checker" element={<PriceChecker />} />
                            <Route path="/vendors" element={<VendorsPage />} />
                            <Route path="/chain" element={<DistributionChainView />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/dashboard/*" element={<Dashboard />} />
                            <Route path="/business/*" element={<FeedPage />} />
                            <Route path="/category/:categorySlug"  element={<ProductsGrid />} />
                            <Route path="/search" element={<SearchResults />} />
                            <Route path="/admin/dashboard" element={<AdminDashboard />} />
                            <Route path="/dashboard/ads/verify" element={<AdVerifyPage/>} />



                            <Route path="/eparts" element={
                       
                                <Eparts />
                           
                            } />
        </Routes>
      </div>
           </CartProvider>
    </>
  );
}


export default App






















































































