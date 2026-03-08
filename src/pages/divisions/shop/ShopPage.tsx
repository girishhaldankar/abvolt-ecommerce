import { ProductGrid } from "../../../components/shop/ProductGrid";
import { products } from "../../../components/shop/data/products";
import { Header } from "../../../components/Header";
import { Footer } from "../../../components/Footer";

export default function ShopPage() {
  return (
    <div
      className="min-h-screen text-[var(--page-text)] transition-colors duration-500"
      style={{ background: "var(--page-bg)" }}
    >
      <Header />

      <main className="pt-32 max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 mb-16">
        <ProductGrid
          products={products}
          title="All Products"
          description="Browse our electronics catalog"
        />
      </main>

      <Footer />
    </div>
  );
}