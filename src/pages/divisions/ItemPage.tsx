import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import GlowBackground from "../../components/ui/GlowBackground";
import { getDivisionById } from "../../services/divisions.service";
import defaultImage from "../../assets/microchip.jpg";

export default function ItemPage() {
  const { divisionId, audienceId, streamId, categoryId, itemId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!divisionId || !audienceId || !streamId || !categoryId || !itemId)
      return;

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

        const item = category?.items?.find(
          (i: any) => String(i._id) === String(itemId)
        );

        if (!audience || !stream || !category || !item) {
          setData(null);
          return;
        }

        // Map backend title → frontend name (safe fallback)
        const mappedItem = {
          ...item,
          name: item.name || item.title,
        };

        setData({ division, audience, stream, category, item: mappedItem });
      })
      .catch((err: any) => {
        console.error("Failed to fetch item:", err);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [divisionId, audienceId, streamId, categoryId, itemId]);

  /* -----------------------------
     INVALID URL
  ----------------------------- */
  if (!divisionId || !audienceId || !streamId || !categoryId || !itemId) {
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
          Loading item…
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
          Item not found
        </div>
        <Footer />
      </>
    );
  }

  const { division, audience, stream, category, item } = data;

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
            <span className="font-medium">{category?.title}</span>

            <span>/</span>
            <span className="font-medium text-gray-500">{item?.name}</span>
          </nav>
        </div>
      </div>

      {/* CONTENT */}
      <section className="section relative overflow-hidden !mt-0">
        <GlowBackground />

        <div className="max-w-5xl mx-auto px-4">
          {/* Image */}
          <div className="mb-10 overflow-hidden rounded-xl">
            <img
              src={item?.image || defaultImage}
              alt={item?.name || "Item image"}
              onError={(e) => {
                e.currentTarget.src = defaultImage;
              }}
              className={`w-full h-[260px] sm:h-[380px] object-cover transition-transform duration-500 hover:scale-105
                ${!item?.image ? "opacity-70 grayscale" : ""}`}
            />
          </div>

          {/* Header */}
          <header className="text-center space-y-2 mb-10">
            <p className="text-sm uppercase tracking-wide text-gray-400">
              {audience?.title} · {category?.title}
            </p>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display">
              {item?.name}
            </h1>

            {item?.code && (
              <p className="text-base opacity-70">{item.code}</p>
            )}
          </header>

          {/* Description */}
          {item?.fullDescription && (
  <div className="mb-12 space-y-4 text-lg leading-relaxed">
    {item.fullDescription
      .split("\n\n") // split paragraphs by double newline
      .map((para: string, idx: number) => (
        <p key={idx}>{para}</p>
      ))}
  </div>
)}

          {/* Features */}
          {item?.features?.length > 0 && (
            <div className="mb-12">
              <h3 className="text-xl font-semibold mb-4">
                Product Features
              </h3>
              <ul className="grid sm:grid-cols-2 gap-3 list-disc pl-5">
                {item.features.map((feature: string, idx: number) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA */}
          <div className="text-center">
            <button className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition shadow-lg shadow-blue-600/30">
              Request Quote
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
