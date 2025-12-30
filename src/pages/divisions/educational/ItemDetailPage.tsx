import { useParams, Link } from "react-router-dom";
import { educationalItems } from "../../../components/Education/data/educationalItems";
import { Header } from "../../../components/Header";
import { Footer } from "../../../components/Footer";
import GlowBackground from "../../../components/ui/GlowBackground";

export default function ItemDetailPage() {
  const { categoryId } = useParams();
  const category = educationalItems[categoryId as keyof typeof educationalItems];

  if (!category) {
    return (
      <p className="p-10 text-center text-red-500 text-lg font-medium">
        Category not found
      </p>
    );
  }

  return (
    <div>
      <Header />
      <div className="mt-32 px-2">
        <section className="app-section relative overflow-hidden">
          <GlowBackground  />
          <main className="flex-1 max-w-7xl mx-auto space-y-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display leading-tight text-center">
              {category.title}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {category.items.map((item) => (
                <div
  key={item.id}
  className="
    group relative rounded-2xl p-6
    bg-[var(--glass-bg)]
    border border-[var(--glass-border)]
    text-[var(--glass-text)]
    backdrop-blur-xl
    shadow-[0_8px_30px_rgba(0,0,0,0.06)]
    transition-all duration-300
    hover:-translate-y-1
    hover:shadow-[0_20px_60px_rgba(0,0,0,0.12)]
    overflow-hidden
  "
>
  {/* soft glass sheen */}
  <div className="pointer-events-none absolute -inset-1 rounded-3xl
    bg-gradient-to-br from-cyan-400/0 via-blue-400/10 to-purple-400/0
    opacity-60 group-hover:opacity-100
    blur-xl transition-opacity duration-500"
  />

  {/* hover glow */}
  <div className="pointer-events-none absolute -inset-1 rounded-3xl
    bg-gradient-to-br from-cyan-400/0 via-blue-400/10 to-purple-400/0
    opacity-60 group-hover:opacity-100
    blur-xl transition-opacity duration-500"
  />

  <div className="relative z-10 space-y-3">
    {/* title */}
    <h2 className="text-lg sm:text-xl font-semibold leading-tight">
      {item.name}
    </h2>

    {/* code */}
    <p className="text-[11px] uppercase tracking-wide opacity-60">
      {item.code}
    </p>

    {/* description */}
    <p
      className="
        !text-[11px] sm:!text-[12px]
        leading-[1.45]
        opacity-80
        line-clamp-3
      "
    >
      {item.shortDescription}
    </p>

    {/* CTA */}
    <Link
      to={`/educational/${categoryId}/${item.id}`}
      className="
        inline-flex items-center gap-1
        text-sm font-medium
        text-blue-600 dark:text-blue-400
        group-hover:gap-2
        transition-all duration-300
      "
    >
      Know more
      <span className="transition-transform group-hover:translate-x-1">→</span>
    </Link>
  </div>
</div>

              ))}
            </div>
          </main>
        </section>
      </div>
      <Footer />
    </div>
  );
}
