import Navbar from "./components/Navbar";
import { BrowserRouter, Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Home from "./pages/Home/Home";
import ProductDetails from "./pages/product/ProductDetails";
import PriceChecker from "./pages/product/PriceChecker";

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
          element={<ProductDetails />}
        />
                            <Route path="/signup" element={<Signup />} />
                            <Route path="/price-checker" element={<PriceChecker />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/dashboard/*" element={<Dashboard />} />
        </Routes>
      </div>
    </>
  );
}


export default App




































