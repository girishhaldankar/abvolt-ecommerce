import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import GlowBackground from "../../components/ui/GlowBackground";
import { getDivisionById } from "../../services/divisions.service";
import placeholderImage from "../../assets/microchip.jpg";
import GlassButton from "../../components/GlassButton";

export default function CategoryPage() {
  const { divisionId, audienceId, streamId, categoryId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!divisionId || !audienceId || !streamId || !categoryId) return;

    setLoading(true);

    getDivisionById(divisionId)
      .then((division: any) => {
        const audience = division?.audiences?.find(
          (a: any) => String(a._id) === String(audienceId)
        );

        const stream = audience?.streams?.find(
          (s: any) => String(s._id) === String(streamId)
        );

        const category = stream?.categories?.find(
          (c: any) => String(c._id) === String(categoryId)
        );

        if (!audience || !stream || !category) {
          setData(null);
          return;
        }

        setData({ division, audience, stream, category });
      })
      .catch((err: any) => {
        console.error("Failed to fetch category:", err);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [divisionId, audienceId, streamId, categoryId]);

  /* -----------------------------
     INVALID URL
  ----------------------------- */
  if (!divisionId || !audienceId || !streamId || !categoryId) {
    return (
      <>
        <Header />
        <div className="pt-40 text-center text-red-500 text-lg font-medium">
          Invalid URL
        </div>
        <Footer />
      </>
    );
  }

  /* -----------------------------
     LOADING
  ----------------------------- */
  if (loading) {
    return (
      <>
        <Header />
        <div className="pt-40 text-center text-gray-500 text-lg">
          Loading...
        </div>
        <Footer />
      </>
    );
  }

  /* -----------------------------
     NOT FOUND
  ----------------------------- */
  if (!data) {
    return (
      <>
        <Header />
        <div className="pt-40 text-center text-red-500 text-lg font-medium">
          Category not found
        </div>
        <Footer />
      </>
    );
  }

  const { division, audience, stream, category } = data;

  return (
    <>
      <Header />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 mt-28 mb-6">
        <div className="flex items-center gap-3 text-sm flex-wrap">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 hover:text-blue-600 transition"
          >
            ← Back
          </button>

          <span className="opacity-40">|</span>

          <nav className="flex items-center gap-1 flex-wrap">
            <Link
              to={`/${divisionId}`}
              className="hover:text-blue-600 capitalize"
            >
              {division?.title || divisionId}
            </Link>

            <span>/</span>
            <span className="font-medium">{audience?.title}</span>

            <span>/</span>
            <span className="font-medium">{stream?.title}</span>

            <span>/</span>
            <span className="font-medium text-gray-500">
              {category?.title}
            </span>
          </nav>
        </div>
      </div>

      <section className="section relative overflow-hidden !mt-0">
        <GlowBackground />

        <main className="max-w-7xl mx-auto space-y-12">
          {/* Title */}
          <div className="text-center space-y-2">
            <p className="text-sm uppercase tracking-wide text-gray-400">
              {audience?.title} · {division?.title}
            </p>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display">
              {category?.title}
            </h1>
          </div>

          {/* Items */}
          {category?.items?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {category.items.map((item: any) => (
                <div
                  key={item._id}
                  className="group relative rounded-2xl p-6 bg-[var(--glass-bg)]
                             border border-[var(--glass-border)]
                             backdrop-blur-xl transition-all duration-300
                             hover:-translate-y-1"
                >
                  {/* Image */}
                  <div className="mb-4 overflow-hidden rounded-xl">
                    <img
                      src={item.image || placeholderImage}
                      alt={item.name}
                      onError={(e) => {
                        e.currentTarget.src = placeholderImage;
                      }}
                      className={`h-40 w-full object-cover transition-transform duration-300
                        group-hover:scale-105
                        ${!item.image ? "opacity-70 grayscale" : ""}`}
                    />
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-lg font-semibold">{item.name}</h2>

                    {item.code && (
                      <p className="text-xs uppercase opacity-60">
                        {item.code}
                      </p>
                    )}

                    {item.shortDescription && (
                      <p className="text-sm opacity-80 line-clamp-3">
                        {item.shortDescription}
                      </p>
                    )}

                    <Link
                      to={`/${divisionId}/${audienceId}/stream/${streamId}/${categoryId}/${item._id}`}
                      className="inline-flex group pt-4"
                    >
                     
                      <GlassButton>Learn More →</GlassButton> 
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center opacity-60">
              No items available in this category
            </p>
          )}
        </main>
      </section>

      <Footer />
    </>
  );
}
