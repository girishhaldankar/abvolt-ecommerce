import { Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";

import HomePage from "./pages/HomePage";

// Educational division
import EducationPage from "./pages/divisions/educational/EducationPage";
import ItemDetailPage from "./pages/divisions/educational/ItemDetailPage";
import FinalItemPage from "./pages/divisions/educational/FinalItemPage";

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
        <Route path="/educational/:categoryId" element={<ItemDetailPage />} />
        <Route
          path="/educational/:categoryId/:itemId"
          element={<FinalItemPage />}
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
