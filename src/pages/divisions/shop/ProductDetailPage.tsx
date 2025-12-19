import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { products } from "../../../components/shop/data/products";
import { ProductGrid } from "../../../components/shop/ProductGrid";

import { Star, ArrowLeft } from "lucide-react";
import { ImageFallback } from "../../../components/ImageFallback";


import { Header } from "../../../components/Header";

import { Footer } from "../../../components/Footer";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const product = products.find((p) => p.id === Number(id));
  const [selectedImage, setSelectedImage] = useState(product?.image);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  if (!product)
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[var(--page-bg)] text-[var(--page-text)] p-8 text-center text-xl">
          Product Not Found
        </div>
        <Footer />
      </>
    );

  const relatedSameCategory = products.filter(
    (p) => p.category === product.category && p.id !== product.id
  );

  const relatedProducts =
    relatedSameCategory.length > 0
      ? relatedSameCategory.slice(0, 3)
      : products.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <>
      <Header />

      <div
  className="min-h-screen pt-28 pb-24 px-4 md:px-6 text-[var(--page-text)] transition-colors"
  style={{ background: "var(--page-bg)" }}
>


        {/* Breadcrumb */}
        <div className="max-w-6xl mx-auto mb-6 flex items-center gap-3 text-sm opacity-80">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 hover:opacity-80"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <span>/</span>
          <span className="capitalize text-cyan-400">{product.category}</span>
          <span>/</span>
          <span className="opacity-100">{product.name}</span>
        </div>

        {/* MAIN GRID */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* LEFT IMAGES */}
          <div className="space-y-4">
            <div className="w-full aspect-square rounded-2xl overflow-hidden border border-[var(--border)]">
              <div className="relative w-full h-full group">
                <ImageFallback
                  src={selectedImage!}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>

            {/* THUMBNAILS */}
            <div className="grid grid-cols-4 gap-3">
              {[product.image, product.image, product.image, product.image].map(
                (img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(img)}
                    className={`border rounded-xl overflow-hidden aspect-square ${
                      selectedImage === img
                        ? "border-cyan-500"
                        : "border-[var(--border)]"
                    }`}
                  >
                    <ImageFallback
                      src={img}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                )
              )}
            </div>
          </div>

          {/* RIGHT DETAILS */}
          <div className="space-y-6">
            <h1 className="text-xl sm:text-2xl md:text-4xl font-bold">
  {product.name}
</h1>

            <div className="flex items-center gap-2 text-yellow-400">
              <Star size={18} fill="currentColor" /> {product.rating} / 5
            </div>

            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-cyan-400">
  ${product.price}
</div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full text-lg hover:scale-105 transition w-full sm:w-auto">
                Add to Cart
              </button>
              <button className="px-6 py-3 border border-[var(--border)] rounded-full hover:bg-white/10 transition w-full sm:w-auto">
                Buy Now
              </button>
            </div>

            {/* DESCRIPTION */}
            <div className="pt-4">
              <h2 className="text-lg md:text-xl font-semibold mb-2">Description</h2>
              <p className="opacity-80 leading-relaxed text-sm md:text-base">
                High–quality electronic module suitable for robotics, IoT,
                prototyping and industrial applications. Built with premium
                components and designed for reliability and performance.
              </p>
            </div>

            {/* SPECIFICATIONS */}
            <div className="pt-4">
              <h2 className="text-lg md:text-xl font-semibold mb-3">Specifications</h2>
              <table className="w-full border border-[var(--border)] rounded-xl overflow-hidden text-sm md:text-base">
                <tbody>
                  <tr className="border-b border-[var(--border)]">
                    <td className="p-3 opacity-70">Category</td>
                    <td className="p-3">{product.category}</td>
                  </tr>
                  <tr className="border-b border-[var(--border)]">
                    <td className="p-3 opacity-70">Model</td>
                    <td className="p-3">Standard Edition</td>
                  </tr>
                  <tr>
                    <td className="p-3 opacity-70">Warranty</td>
                    <td className="p-3">6 Months</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        <div className="mt-20">
          <ProductGrid
            products={relatedProducts}
            limit={3}
            title="Related Products"
          />
        </div>
      </div>

      <Footer />
    </>
  );
}
