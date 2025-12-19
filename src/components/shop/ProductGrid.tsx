import { FC } from "react";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ImageFallback } from "../ImageFallback";

export interface Product {
  id: number;
  name: string;
  price: number;
  rating: number;
  image: string;
  category: string;
  featured?: boolean;
}

interface ProductGridProps {
  products: Product[];
  limit?: number;
  title?: string;
  description?: string;
  featuredOnly?: boolean;
}

export const ProductGrid: FC<ProductGridProps> = ({
  products,
  limit,
  title,
  description,
  featuredOnly,
}) => {
  const navigate = useNavigate();

  // Filter products
  let displayedProducts = featuredOnly
    ? products.filter((p) => p.featured)
    : products;

  if (limit) {
    displayedProducts = displayedProducts.slice(0, limit);
  }

  // ✅ Navigate to SHOP product detail
  const handleProductClick = (id: number) => {
    navigate(`/shop/product/${id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ Navigate to full shop page
  const handleViewAllClick = () => {
    navigate("/shop");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="app-section">
      <div className="max-w-7xl mx-auto">

        {/* Title */}
        {(title || description) && (
          <div className="text-center mb-12 space-y-3">
            {title && (
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-display leading-tight"
                style={{ color: "var(--category-text)" }}
              >
                {title}
              </h2>
            )}
            {description && (
              <p
                className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg"
                style={{ color: "var(--category-subtext)" }}
              >
                {description}
              </p>
            )}
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {displayedProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => handleProductClick(product.id)}
              className="group relative bg-[var(--category-card-bg)]
                         border border-[var(--category-border)]
                         rounded-2xl overflow-hidden
                         transition-all duration-300
                         shadow-xl hover:shadow-2xl cursor-pointer"
            >
              {/* Image */}
              <div className="relative h-44 sm:h-48 overflow-hidden rounded-t-2xl">
                <ImageFallback
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                {/* Category badge */}
                <span className="absolute top-3 left-3 bg-cyan-600 text-white text-xs px-2 py-1 rounded-full">
                  {product.category}
                </span>
              </div>

              {/* Info */}
              <div className="p-4 sm:p-5 space-y-2">
                <h3
                  className="text-[var(--category-text)]
                             text-sm sm:text-base font-semibold
                             group-hover:text-[var(--category-hover-text)]
                             transition-colors"
                >
                  {product.name}
                </h3>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-[var(--category-subtext)] font-semibold text-lg">
                    ${product.price}
                  </div>

                  {/* Add to Cart */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // cart logic here later
                    }}
                    className="px-4 py-2 bg-gradient-to-r
                               from-cyan-600 to-blue-800
                               text-white rounded-full
                               hover:scale-105
                               text-sm flex items-center gap-2
                               transition-transform duration-200"
                    aria-label={`Add ${product.name} to cart`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All */}
        {limit && products.length > limit && (
          <div className="mt-12 text-center">
            <button
              onClick={handleViewAllClick}
              className="px-6 py-3 bg-gradient-to-r
                         from-cyan-600 to-blue-800
                         text-white font-semibold rounded-full
                         hover:scale-105 transition-transform duration-200"
            >
              View All Products
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
