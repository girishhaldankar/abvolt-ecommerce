import { Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";

import HomePage from "./pages/HomePage";

// Educational division
import EducationPage from "./pages/divisions/educational/EducationPage";
import EduItemDetailPage from "./pages/divisions/educational/ItemDetailPage";
import EduFinalItemPage from "./pages/divisions/educational/FinalItemPage";

// Industrial division
import IndustrialPage from "./pages/divisions/industrial/IdustrialPage";
import IndItemDetailPage from "./pages/divisions/industrial/ItemDetailPage";
import IndFinalItemPage from "./pages/divisions/industrial/FinalItemPage";



// Shop division
import ShopPage from "./pages/divisions/shop/ShopPage";
import ProductDetailPage from "./pages/divisions/shop/ProductDetailPage";
import CartPage from "./pages/divisions/shop/CartPage";

import NotFound from "./pages/NotFound";



export default function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<HomePage />} />

        {/* Educational */}
<Route path="/educational" element={<EducationPage />} />
<Route path="/educational/:categoryId" element={<EduItemDetailPage />} />
<Route
  path="/educational/:categoryId/:itemId"
  element={<EduFinalItemPage />}
/>

        {/* Industrial */}
<Route path="/industrial" element={<IndustrialPage />} />
<Route
  path="/industrial/:categoryId"
  element={<IndItemDetailPage />}
/>
<Route
  path="/industrial/:categoryId/:itemId"
  element={<IndFinalItemPage />}
/>

        {/* Shop */}
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/shop/product/:id" element={<ProductDetailPage />} />
        <Route path="/shop/cart" element={<CartPage />} />

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
