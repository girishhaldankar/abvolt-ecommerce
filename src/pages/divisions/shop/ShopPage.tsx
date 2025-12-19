import {ProductGrid} from "../../../components/shop/ProductGrid";  // default export assumed

import { products } from "../../../components/shop/data/products";
import {Header} from "../../../components/Header";            // default export
import {Footer} from "../../../components/Footer";            // default export

export default function ShopPage() {
  return (
    <div
      className="min-h-screen text-[var(--page-text)] transition-colors duration-500"
      style={{ background: "var(--page-bg)" }}
    >
      <Header />

      <div className="pt-32 max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 mb-16">
        <ProductGrid
          products={products}
          title="All Products"
          description="Browse our full collection of electronics"
        />
      </div>

      <Footer />
    </div>
  );
}
