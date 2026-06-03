import Navbar from "./components/Navbar";
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

const App =()=>  {
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
          path="/seller/:businessName/:id" 
          element={
             <ProtectedRoute>
                  <SellerDetail />
             </ProtectedRoute>
        } 
        />
                            <Route path="/signup" element={<Signup />} />
                            <Route path="/price-checker" element={<PriceChecker />} />
                            <Route path="/vendors" element={<VendorsPage />} />
                            <Route path="/chain" element={<DistributionChainView />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/dashboard/*" element={<Dashboard />} />
                            <Route path="/business/*" element={<FeedPage />} />
                            <Route path="/category/:categorySlug"  element={<ProductsGrid />} />
                            <Route path="/search" element={<SearchResults />} />
                            <Route path="/dashboard/ads/verify" element={<AdVerifyPage/>} />
        </Routes>
      </div>
           </CartProvider>
    </>
  );
}


export default App
























































































// import Navbar from "./components/Navbar";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { Toaster } from "sonner";
// import Signup from "./pages/auth/Signup";
// import Login from "./pages/auth/Login";
// import Dashboard from "./pages/Dashboard/Dashboard";
// import Home from "./pages/Home/Home";
// import ProductDetails from "./pages/product/ProductDetails";
// import PriceChecker from "./pages/product/PriceChecker";
// import VendorsPage from "./pages/vendor/Vendor";
// import SellerDetail from "./pages/vendor/vendorDetails";
// import ProtectedRoute from "./config/protectedRoute";
// import DistributionChainView from "./pages/vendor/DistributionChainView";
// import FeedPage from "./pages/post/FeedPage";
// import ProductsGrid from "./components/home/ProductByCategory";
// import SearchResults from "./components/home/SearchResult";
// import AdVerifyPage from "./pages/ads/AdVerify";
// import CartPage from "./pages/order/CartPage";
// import CheckoutPage from "./pages/order/CheckoutPage";
// import SellerDashboard from "./pages/order/SellerDashboard";
// import BuyerDashboard from "./pages/order/BuyerDashboard";
// import OrderDetailPage from "./pages/order/OrderDetailPage";
// import PaymentVerifyPage from "./pages/order/PaymentVerifyPage";
// import POSPage from "./pages/order/POSPage";
// import { CartProvider } from "./context/CartContext";

// const App = () => {
//   return (
//     <BrowserRouter>
//       <CartProvider>
//         <Toaster richColors position="top-right" />
//         <Navbar />
//         <div className="pt-20">
//           <Routes>
//             <Route path="/" element={<Home />} />

//             <Route path="/product/:slug" element={<ProtectedRoute><ProductDetails /></ProtectedRoute>} />
//             <Route path="/product/:slug/:id" element={<ProtectedRoute><ProductDetails /></ProtectedRoute>} />

//             <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
//             <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
//             <Route path="/order/:orderId" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
//             <Route path="/payment/verify" element={<ProtectedRoute><PaymentVerifyPage /></ProtectedRoute>} />

//             <Route path="/dashboard/seller" element={<ProtectedRoute><SellerDashboard /></ProtectedRoute>} />
//             <Route path="/dashboard/buyer" element={<ProtectedRoute><BuyerDashboard /></ProtectedRoute>} />
//             <Route path="/pos" element={<ProtectedRoute><POSPage /></ProtectedRoute>} />

//             <Route path="/seller/:businessName/:id" element={<ProtectedRoute><SellerDetail /></ProtectedRoute>} />

//             <Route path="/signup" element={<Signup />} />
//             <Route path="/login" element={<Login />} />
//             <Route path="/price-checker" element={<PriceChecker />} />
//             <Route path="/vendors" element={<VendorsPage />} />
//             <Route path="/chain" element={<DistributionChainView />} />
//             <Route path="/dashboard/*" element={<Dashboard />} />
//             <Route path="/business/*" element={<FeedPage />} />
//             <Route path="/category/:categorySlug" element={<ProductsGrid />} />
//             <Route path="/search" element={<SearchResults />} />
//             <Route path="/dashboard/ads/verify" element={<AdVerifyPage />} />
//           </Routes>
//         </div>
//       </CartProvider>
//     </BrowserRouter>
//   );
// };

// export default App;