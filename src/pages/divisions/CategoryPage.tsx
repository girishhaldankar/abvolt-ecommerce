
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MessageSquareQuote } from "lucide-react";

import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import QuoteRequestModal from "../../components/QuoteRequestModal";
import type { QuoteItemReference } from "../../components/QuoteRequestModal";
import GlowBackground from "../../components/ui/GlowBackground";
import { getDivisionById } from "../../services/divisions.service";
import heroImage from "../../assets/microchip.jpg";

type QuoteItem = {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  code?: string;
  shortDescription?: string;
};

export default function CategoryPage() {
  const { divisionId, audienceId, streamId, categoryId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<QuoteItem | null>(null);

  /* =====================
     LOAD CATEGORY DATA
  ===================== */
  useEffect(() => {
    if (!divisionId || !audienceId || !streamId || !categoryId) {
      setLoading(false);
      setData(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getDivisionById(divisionId)
      .then((division: any) => {
        if (cancelled) return;

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
      .catch((err: unknown) => {
        console.error("Failed to fetch category:", err);
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [divisionId, audienceId, streamId, categoryId]);

  /* =====================
     QUOTE FORM
  ===================== */
  function openQuoteModal(item: QuoteItem) {
    setSelectedItem(item);
  }

  /* =====================
     VALIDATION STATES
  ===================== */
  if (!divisionId || !audienceId || !streamId || !categoryId) {
    return (
      <>
        <Header />
        <div className="px-4 pt-40 text-center text-lg font-medium text-red-600 dark:text-red-400">
          Invalid URL
        </div>
        <Footer />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="px-4 pt-40 text-center text-lg text-slate-600 dark:text-slate-300">
          Loading category...
        </div>
        <Footer />
      </>
    );
  }

  if (!data) {
    return (
      <>
        <Header />
        <div className="px-4 pt-40 text-center text-lg font-medium text-red-600 dark:text-red-400">
          Category not found
        </div>
        <Footer />
      </>
    );
  }

  const { division, audience, stream, category } = data;

  const items: QuoteItem[] = [...(category?.items || [])].sort(
    (a: QuoteItem, b: QuoteItem) =>
      (a.code || "").localeCompare(b.code || "")
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-[#0b1120] dark:text-slate-100">
      {/* ==================================================
          1. HEADER
          Keep the existing site navigation above the page.
          The hero below extends upward behind it.
      ================================================== */}
      <Header forceScrolled />

     
{/* ==================================================
    2. FULL-WIDTH HERO
================================================== */}
<section className="relative isolate min-h-[430px] w-full overflow-hidden bg-[#071a2b] text-white sm:min-h-[470px] lg:min-h-[520px]">


{/* Hero background image */}
<div className="absolute inset-0 -z-20 overflow-hidden bg-[#071a2b]">
  <img
    src={category?.image || heroImage}
    alt=""
    aria-hidden="true"
    className="h-full w-full object-cover object-[50%_35%]"
  />
</div>

{/* Existing dark overlay */}
<div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#061321]/95 via-[#071a2b]/75 to-[#071a2b]/20" />

{/* Subtle white shade for navigation in light mode */}
<div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-32 bg-gradient-to-b from-white/55 via-white/40 to-transparent dark:hidden" />

{/* Bottom image shade */}
<div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#071a2b]/50 via-transparent to-[#071a2b]/20" />

  {/* Hero content */}
  <div className="relative z-[2] mx-auto flex min-h-[430px] max-w-7xl items-center px-4 pb-12 pt-40 sm:min-h-[470px] sm:px-6 sm:pb-16 sm:pt-44 lg:min-h-[520px] lg:px-8 lg:pb-20 lg:pt-44">
    <div className="max-w-3xl space-y-5">

      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300 sm:text-sm">
        <span>{division?.title}</span>
        <span className="text-white/40">/</span>
        <span>{audience?.title}</span>
      </div>

      <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
        {category?.title}
      </h1>

      <p className="max-w-2xl text-sm leading-7 text-slate-200 sm:text-base sm:leading-8">
        {category?.description ||
          `Explore our ${category?.title} products. Find the components you need and request a quote for your project or business.`}
      </p>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm">
          <span className="inline-block h-2 w-2 rounded-full bg-cyan-300" />
          {items.length} {items.length === 1 ? "item" : "items"} available
        </div>
      </div>

    </div>
  </div>
</section>

      {/* ==================================================
          3. BREADCRUMB
          Appears after the hero, with a clear background.
      ================================================== */}
      <div className="relative z-10 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-[#111827]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex shrink-0 items-center gap-2 rounded-md px-2 py-1 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-cyan-300"
          >
            <span aria-hidden="true">←</span>
            Back
          </button>

          <span className="text-slate-300 dark:text-slate-600">/</span>

          <nav
            aria-label="Breadcrumb"
            className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm"
          >
            <Link
              to={`/${divisionId}`}
              className="font-medium text-slate-600 transition hover:text-blue-700 dark:text-slate-300 dark:hover:text-cyan-300"
            >
              {division?.title || divisionId}
            </Link>

            <span className="text-slate-300 dark:text-slate-600">/</span>

            <span className="text-slate-600 dark:text-slate-300">
              {audience?.title}
            </span>

            <span className="text-slate-300 dark:text-slate-600">/</span>

            <span className="text-slate-600 dark:text-slate-300">
              {stream?.title}
            </span>

            <span className="text-slate-300 dark:text-slate-600">/</span>

            <span
              aria-current="page"
              className="font-semibold text-slate-900 dark:text-white"
            >
              {category?.title}
            </span>
          </nav>
        </div>
      </div>

      {/* ==================================================
          4. PRODUCT LIST AREA
      ================================================== */}
      <section className="relative isolate overflow-hidden bg-slate-100 py-10 sm:py-14 lg:py-16 dark:bg-[#0b1120]">
        <GlowBackground />

        <main className="relative mx-auto max-w-7xl space-y-7 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-300 pb-5 dark:border-slate-700">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 dark:text-cyan-400 sm:text-sm">
                Browse products
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                Available Items
              </h2>

              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Find the right product for your application.
              </p>
            </div>

            <span className="inline-flex shrink-0 items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
          </div>

          {items.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
              {items.map((item) => (
                <article
                  key={item._id}
                  className="flex min-w-0 items-start gap-3 rounded-xl border border-slate-300 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md sm:gap-4 sm:p-5 dark:border-slate-700 dark:bg-[#172235] dark:hover:border-slate-500"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold leading-6 text-slate-900 sm:text-base dark:text-white">
                      {item.title || item.name || "Untitled item"}
                    </h3>

                    {item.code && (
                      <p className="mt-1.5 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-cyan-400">
                        {item.code}
                      </p>
                    )}

                    {item.shortDescription && (
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {item.shortDescription}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => openQuoteModal(item)}
                    aria-label={`Request a quote for ${
                      item.title || item.name || "this item"
                    }`}
                    title="Request a Quote"
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700 transition hover:border-blue-400 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-slate-600 dark:bg-slate-800 dark:text-cyan-300 dark:hover:border-cyan-500 dark:hover:bg-slate-700 dark:focus:ring-offset-slate-900"
                  >
                    <MessageSquareQuote size={19} strokeWidth={1.8} />
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-300 bg-white px-5 py-16 text-center dark:border-slate-700 dark:bg-[#172235]">
              <p className="text-base font-medium text-slate-700 dark:text-slate-200">
                No items available in this category.
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Please check back later for available products.
              </p>
            </div>
          )}
        </main>
      </section>

      {/* ==================================================
          5. REQUEST A QUOTE MODAL
      ================================================== */}
      {selectedItem && (selectedItem._id || selectedItem.id) && (
        <QuoteRequestModal
          item={
            {
              itemSource: "division",
              itemId: selectedItem._id || selectedItem.id || "",
              itemName: selectedItem.title || selectedItem.name || "Catalogue item",
              itemCode: selectedItem.code,
              divisionId,
              audienceId,
              streamId,
              categoryId,
            } satisfies QuoteItemReference
          }
          onClose={() => setSelectedItem(null)}
        />
      )}

      {/* ==================================================
          6. FOOTER
      ================================================== */}
      <Footer />
    </div>
  );
}
