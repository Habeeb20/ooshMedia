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
const App =()=>  {
  return (
    <>
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
    </>
  );
}


export default App




































