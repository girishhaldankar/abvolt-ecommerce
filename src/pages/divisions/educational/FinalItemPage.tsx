import React from "react";
import { useParams } from "react-router-dom";
import { Header } from "../../../components/Header";
import { Footer } from "../../../components/Footer";
import { educationalItems } from "../../../components/Education/data/educationalItems";

export default function FinalItemPage() {
  const { categoryId, itemId } = useParams();

  if (!categoryId || !itemId) {
    return <div className="pt-40 text-center">Invalid URL</div>;
  }

  const category = educationalItems[categoryId as keyof typeof educationalItems];
  const item = category?.items.find((i) => i.id === itemId);

  if (!category || !item) {
    return <div className="pt-40 text-center">Item not found</div>;
  }

  return (
    <>
      <Header />
<div className="px-2 py-10">
      <section className="app-section">
        <div className="max-w-5xl mx-auto">

          {/* Card */}
          <div className="
            relative 
          ">

            {/* Image */}
            {item.image && (
              <div className="mb-10 overflow-hidden rounded-xl">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-[260px] sm:h-[380px] object-cover
                    transition-transform duration-500 hover:scale-105"
                />
              </div>
            )}

            {/* Header */}
            <header className="text-center space-y-2 mb-10">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-display text-[var(--hero-text)]">
                {item.name}
              </h1>
              <p className="text-base text-[var(--hero-text)]">
                {item.code}
              </p>
            </header>

            {/* Description */}
            <div className="text-[var(--hero-text)] max-w-none mb-12">
              <p className="text-lg leading-relaxed">
                {item.fullDescription}
              </p>
            </div>

            {/* Features */}
            {item.features && (
              <div className="mb-12">
                <h3 className="text-xl font-semibold mb-4 text-[var(--hero-text)]">
                  Product Features
                </h3>
                <ul className="grid sm:grid-cols-2 gap-3 list-disc pl-5 text-[var(--hero-text)]">
                  {item.features.map((f, idx) => (
                    <li key={idx}>{f}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Scope */}
            {item.scopeOfLearning && (
              <div className="mb-14">
                <h3 className="text-xl font-semibold mb-4 text-[var(--hero-text)]">
                  Scope of Learning
                </h3>
                <ul className="grid sm:grid-cols-2 gap-3 list-disc pl-5 text-[var(--hero-text)]">
                  {item.scopeOfLearning.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* CTA */}
            <div className="text-center">
              <button
                className="
                  inline-flex items-center justify-center
                  px-8 py-3 rounded-xl
                  bg-blue-600 hover:bg-blue-700
                  text-white font-semibold
                  transition
                  shadow-lg shadow-blue-600/30
                "
              >
                Request Quote
              </button>
            </div>

          </div>
        </div>
      </section>
</div>
      <Footer />
    </>
  );
}
