import { Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";

/* ---------------- PUBLIC PAGES ---------------- */
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import { DivisionPage, CategoryPage, ItemPage } from "./pages/divisions";

/* ---------------- SHOP ---------------- */
import ShopPage from "./pages/divisions/shop/ShopPage";
import ProductDetailPage from "./pages/divisions/shop/ProductDetailPage";
import CartPage from "./pages/divisions/shop/CartPage";


/* ---------------- QUBI IDE ---------------- */
import QubiIDE from "./pages/QubiIDE";


/* ---------------- ADMIN ---------------- */
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import RequireAdmin from "./components/admin/RequireAdmin";
import DivisionForm from "./pages/admin/DivisionForm";
import AudienceForm from "./pages/admin/AudienceForm";
import StreamForm from "./pages/admin/StreamForm";
import CategoryForm from "./pages/admin/CategoryForm";
import ItemForm from "./pages/admin/ItemForm";
import ItemDetailPage from "./pages/admin/ItemDetailPage";
import DivisionManager from "./pages/admin/DivisionManager";
import EditDivision from "./pages/admin/EditDivision";
import QuoteEnquiriesPage from "./pages/admin/QuoteEnquiriesPage";
import AbvoltDAQPage from "./pages/AbvoltDAQPage";


/* ---------------- 404 ---------------- */
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        {/* ================= ADMIN ================= */}
  <Route path="/admin/login" element={<AdminLogin />} />

  <Route element={<RequireAdmin />}>
  <Route path="/admin" element={<AdminDashboard />} />
  <Route path="/admin/quotes" element={<QuoteEnquiriesPage />} />

  <Route
    path="/admin/division/:divisionId/manage"
    element={<DivisionManager />}
  />
  <Route path="/admin/division/new" element={<DivisionForm />} />
  <Route path="/admin/division/:divisionId" element={<DivisionForm />} />

  <Route
    path="/admin/division/:divisionId/audience/new"
    element={<AudienceForm />}
  />
  <Route
    path="/admin/division/:divisionId/audience/:audienceId"
    element={<AudienceForm />}
  />

  

  <Route
    path="/admin/division/:divisionId/audience/:audienceId/stream/new"
    element={<StreamForm />}
  />
  <Route
    path="/admin/division/:divisionId/audience/:audienceId/stream/:streamId"
    element={<StreamForm />}
  />

  <Route
    path="/admin/division/:divisionId/audience/:audienceId/stream/:streamId/category/new"
    element={<CategoryForm />}
  />
  <Route
    path="/admin/division/:divisionId/audience/:audienceId/stream/:streamId/category/:categoryId"
    element={<CategoryForm />}
  />

  <Route
    path="/admin/division/:divisionId/audience/:audienceId/stream/:streamId/category/:categoryId/item/new"
    element={<ItemForm />}
  />
  <Route
    path="/admin/division/:divisionId/audience/:audienceId/stream/:streamId/category/:categoryId/item/:itemId"
    element={<ItemForm />}
  />
  <Route
    path="/admin/division/:divisionId/audience/:audienceId/stream/:streamId/category/:categoryId/item/:itemId/detail"
    element={<ItemDetailPage />}
  />
<Route
  path="/admin/division/:divisionId/audience/:audienceId/stream/:streamId/category/:categoryId/item/:itemId/edit"
  element={<ItemForm />}
/>
  </Route>


        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />

        <Route
  path="/solutions/daq"
  element={<AbvoltDAQPage />}
/>

        {/* ================= CORE DYNAMIC ROUTES ================= */}
     {/* ================= CORE DYNAMIC ROUTES ================= */}
<Route path="/:divisionId" element={<DivisionPage />} />

{/* CategoryPage */}
<Route
  path="/:divisionId/:audienceId/stream/:streamId/:categoryId"
  element={<CategoryPage />}
/>

{/* ItemPage */}
<Route
  path="/:divisionId/:audienceId/stream/:streamId/:categoryId/:itemId"
  element={<ItemPage />}
/>


        {/* ================= SHOP ================= */}
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/shop/product/:id" element={<ProductDetailPage />} />
        <Route path="/shop/cart" element={<CartPage />} />


        {/* ================= QUBI IDE ================= */}
<Route path="/qubi" element={<QubiIDE />} />

        {/* ================= 404 ================= */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
