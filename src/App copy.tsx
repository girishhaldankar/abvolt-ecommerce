import { Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";

/* ---------------- PAGES ---------------- */
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import { DivisionPage, CategoryPage, ItemPage } from "./pages/divisions";

/* ---------------- SHOP ---------------- */
import ShopPage from "./pages/divisions/shop/ShopPage";
import ProductDetailPage from "./pages/divisions/shop/ProductDetailPage";
import CartPage from "./pages/divisions/shop/CartPage";

/* ---------------- 404 ---------------- */
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        {/* ================= HOME ================= */}
        <Route path="/" element={<HomePage />} />

        {/* ================= STATIC ================= */}
        <Route path="/about" element={<AboutPage />} />

        {/* ================= CORE DYNAMIC ROUTES ================= */}
        {/* Division */}
        <Route path="/:divisionId" element={<DivisionPage />} />

        {/* Category */}
        <Route path="/:divisionId/:audienceId/:categoryId" element={<CategoryPage />} />

        {/* Item */}
        <Route path="/:divisionId/:audienceId/:categoryId/:itemId" element={<ItemPage />} />

        {/* ================= SHOP ================= */}
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/shop/product/:id" element={<ProductDetailPage />} />
        <Route path="/shop/cart" element={<CartPage />} />

        {/* ================= 404 ================= */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
