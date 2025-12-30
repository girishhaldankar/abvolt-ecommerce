import { useParams, Link } from "react-router-dom";
import { industrialItems } from "../../../components/Industrial/data/industrialItems";
import { Header } from "../../../components/Header";
import { Footer } from "../../../components/Footer";

export default function ItemDetailPage() {
  const { categoryId } = useParams();
  const category = industrialItems[categoryId as keyof typeof industrialItems];

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
<section className="app-section">
      <main className="flex-1 max-w-7xl mx-auto    space-y-10">
        <h1 className=" text-3xl sm:text-4xl md:text-5xl font-display leading-tight text-center">
          {category.title}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {category.items.map((item) => (
            <div
  key={item.id}
  className="
    relative rounded-2xl p-6
    bg-[var(--glass-bg)]
    border border-[var(--glass-border)]
    text-[var(--glass-text)]
    backdrop-blur-xl
    shadow-lg hover:shadow-2xl
    transition-all duration-300
    hover:-translate-y-1
    overflow-hidden
  "
>
  {/* Glass shine */}
  <div className="
    absolute inset-0
    bg-gradient-to-br
    from-white/40 to-transparent
    dark:from-white/10
    opacity-60
    pointer-events-none
  " />

  {/* Content */}
  <div className="relative z-10">
    <h2 className="text-xl font-semibold ">
      {item.name}
    </h2>

    <p className="text-sm opacity-70 mt-1">
      {item.code}
    </p>

    <p className="mt-3 text-sm leading-relaxed opacity-90">
      {item.shortDescription}
    </p>

    <Link
      to={`/educational/${categoryId}/${item.id}`}
      className="inline-block mt-5 font-semibold text-blue-600 dark:text-blue-400 hover:underline"
    >
      Know More →
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
