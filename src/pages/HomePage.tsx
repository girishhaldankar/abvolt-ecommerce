import { Header } from "../components/Header";
import { HeroSection } from "../components/HeroSection";
import MainSections from "../components/MainSections";
import { CategoriesSection } from "../components/CategoriesSection";
import { ProductGrid } from "../components/shop/ProductGrid";
import { Footer } from "../components/Footer";
import DivisionGrid from "../components/division/DivisionGrid";
import { products } from "../data/products";

export default function HomePage() {
  return (
    <div
      className="min-h-screen text-[var(--page-text)] transition-colors duration-500"
      style={{ background: "var(--page-bg)" }}
    >
      <Header />

      <HeroSection />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 mb-16">
<DivisionGrid />
        {/* NEW MAIN SECTIONS */}
       

        {/* Shop Categories */}
        <CategoriesSection />

        {/* Featured Products */}
       
      </div>

      <Footer />
    </div>
  );
}
