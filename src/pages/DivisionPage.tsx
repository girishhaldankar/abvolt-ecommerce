import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import GlowBackground from "../components/ui/GlowBackground";
import HeroBackground from "../components/HeroBackground";
import CategoryCard from "../components/category/CategoryCard";
import { gradients } from "../utils/gradients";
import { getDivisionById } from "../services/divisions.service";
import trainingImage1 from "../assets/Group.png";
import trainingImage2 from "../assets/training.svg";
import DivisionPageSkeleton from "../components/skeleton/DivisionPageSkeleton";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../components/ui/accordion";

/* ---------------- ICON HELPERS ---------------- */
const getLucideIcon = (iconName?: string): any => {
  if (!iconName) return undefined;
  return (LucideIcons as any)[iconName];
};

const getIconComponent = (iconString?: string): any => {
  if (!iconString) return "📋";
  if (iconString.length <= 2) return iconString;

  try {
    const emojiRegex = /^[\p{Emoji}\s]+$/u;
    if (emojiRegex.test(iconString)) return iconString;
  } catch {}

  return getLucideIcon(iconString) || "📋";
};

/* ---------------- TYPES ---------------- */
interface Category {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  color?: string;
}

interface Stream {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  categories: Category[];
}

interface Audience {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  color?: string;
  streams: Stream[];
}

interface DivisionData {
  title: string;
  description?: string;
  audiences: Audience[];
}

/* ---------------- COMPONENT ---------------- */
export default function DivisionPage() {
  const { divisionId } = useParams();
  const location = useLocation();

  const [divisionData, setDivisionData] = useState<DivisionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [openAudience, setOpenAudience] = useState<string | null>(null);
  const [openStream, setOpenStream] = useState<string | null>(null);

  const tabsContainerRef = useRef<HTMLDivElement | null>(null);

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    if (!divisionId) return;

    setLoading(true);
    getDivisionById(divisionId)
      .then((data) => {
        setDivisionData(data);
        if (data?.audiences?.length) {
          setOpenAudience(data.audiences[0].id);
          setOpenStream(data.audiences[0].streams?.[0]?.id || null);
        }
      })
      .finally(() => setLoading(false));
  }, [divisionId, location.search]);

  const activeAudience = divisionData?.audiences.find(
    (a) => a.id === openAudience
  );

  const streams = activeAudience?.streams || [];

  /* ---------------- ACTIVE ICON + COLOR ---------------- */
  const ActiveIcon = getIconComponent(activeAudience?.icon);

  const activeGradient =
    activeAudience?.color ||
    gradients[
      Math.max(
        0,
        divisionData?.audiences.findIndex(
          (a) => a.id === activeAudience?.id
        ) ?? 0
      ) % gradients.length
    ];

  if (loading) {
  return (
    <>
      <Header />
      <DivisionPageSkeleton />
      <Footer />
    </>
  );
}

  if (!divisionData) {
    return (
      <>
        <Header />
        <div className="pt-40 text-center text-red-500">
          Division not found
        </div>
        <Footer />
      </>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
     {/* ---------------- HERO SECTION ---------------- */}
<section className="relative w-full overflow-hidden pt-32 pb-28">


<HeroBackground />

  {/* Division Background Image */}
 {/* Microchip Background Layer */}
{/* Left Image */}
{/* Left Image */}
<div
  className="
    absolute inset-0
    bg-no-repeat
    bg-center md:bg-left
    bg-contain
    opacity-20 md:opacity-50
    bg-[length:80%] md:bg-[length:25%]
    pointer-events-none
  "
  style={{
    backgroundImage: `url(${trainingImage1})`,
    
  }}
/>


{/* Right Image */}
{/* Right Image */}
<div
  className="
    hidden md:block
    absolute inset-0
    bg-no-repeat
    bg-right
    bg-contain
    opacity-50
    bg-[length:25%]
    pointer-events-none
  "
  style={{
    backgroundImage: `url(${trainingImage2})`,
    
  }}
/>




  <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">

    {/* Top Label */}
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
      text-xs font-semibold tracking-wide
      bg-white/60 dark:bg-slate-800/70
      border border-slate-200 dark:border-slate-700
      backdrop-blur-md
      shadow-sm">
      
      <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 animate-pulse" />
      Division
    </div>

    {/* Title */}
    <h1 className="mt-6 text-4xl md:text-6xl font-extrabold tracking-tight
       leading-tight">
      {divisionData.title}
    </h1>

    {/* Description */}
    {divisionData.description && (
      <p className="mt-6 text-lg md:text-xl text-slate-600 dark:text-slate-300
        leading-relaxed max-w-2xl mx-auto">
        {divisionData.description}
      </p>
    )}

    {/* Decorative Divider */}
    <div className="flex justify-center mt-10">
      <div className="relative w-40 h-[2px]">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-70" />
      </div>
    </div>

  </div>
</section>


      <main className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-12 pt-0 pb-16  relative z-20">

        {/* ---------------- HERO ---------------- */}
        <section className="section   relative overflow-hidden ">
          <GlowBackground />

          

          {/* ---------------- AUDIENCE TABS ---------------- */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              ref={tabsContainerRef}
              className={`flex gap-2 overflow-x-auto overflow-y-hidden scroll-smooth px-2 py-2 scrollbar-none ${
                divisionData.audiences.length <= 3 ? "justify-center" : ""
              }`}
              style={{ touchAction: "pan-x", scrollBehavior: "smooth" }}
            >
              {divisionData.audiences.map((aud, index) => {
                const Icon = getIconComponent(aud.icon);
                const isActive = openAudience === aud.id;

                const handleClick = () => {
                  setOpenAudience(aud.id);
                  setOpenStream(aud.streams?.[0]?.id || null);

                  const container = tabsContainerRef.current;
                  const tab = document.getElementById(
                    `audience-tab-${aud.id}`
                  );
                  if (!container || !tab) return;

                  const containerRect = container.getBoundingClientRect();
                  const tabRect = tab.getBoundingClientRect();

                  const offset = tabRect.left - containerRect.left;
                  const containerWidth = containerRect.width;
                  const tabWidth = tabRect.width;

                  const scrollPosition =
                    offset - containerWidth / 2 + tabWidth / 2;

                  container.scrollBy({
                    left: scrollPosition,
                    behavior: "smooth",
                  });
                };

                return (
                  <div
                    key={aud.id}
                    id={`audience-tab-${aud.id}`}
                    className="flex-shrink-0"
                  >
                    <button
                      onClick={handleClick}
                     className={`relative flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap
  transition-all duration-300
  border
  min-w-[120px] sm:min-w-[160px]
  backdrop-blur-sm

  ${
    isActive
      ? `
        border-blue-800
        bg-white/50
        shadow-[0_2px_8px_rgba(0,0,0,0.12)]
        dark:border-cyan-400
        dark:bg-slate-800/80
      `
      : `
        border-blue-800/60
        bg-white/2
        hover:border-blue-900
        hover:bg-white/20
        dark:border-white/60
        dark:hover:border-white
      `
  }
`}

                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-br ${
                          aud.color || gradients[index % gradients.length]
                        } text-white`}
                      >
                        {typeof Icon === "string" ? (
                          <span className="text-xs">{Icon}</span>
                        ) : (
                          <Icon className="w-3 h-3" />
                        )}
                      </div>

                      <span
                        className={`text-xs sm:text-sm font-medium ${
                          isActive ? "" : "opacity-60"
                        }`}
                      >
                        {aud.title}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ---------------- STREAM ACCORDION ---------------- */}
         <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-12 py-8 sm:py-10 mb-12 sm:mb-16">


            <section className="  bg-blue-300/20
    dark:bg-sky-900 relative overflow-hidden rounded-xl py-6 px-4">
              

              {/* Title */}
              <div className="flex items-center gap-4  relative z-10 ">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center
                  bg-gradient-to-br ${activeGradient} `}
                >
                  {typeof ActiveIcon === "string" ? (
                    <span className="text-lg">{ActiveIcon}</span>
                  ) : (
                    <ActiveIcon className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <h3 className="text-lg">
                    {activeAudience?.title} ({activeAudience?.streams.length} streams)
                  </h3>
                  {activeAudience?.subtitle && (
                    <p className="text-sm ">
                      {activeAudience.subtitle}
                    </p>
                  )}
                </div>
              </div>
              </section>
<section className="relative overflow-hidden rounded-xl py-5">
              <div className="">
                <Accordion type="multiple" className="space-y-4 ">
                  {streams.map((stream) => (
                    <AccordionItem
  key={stream.id}
  value={stream.id}
  className="
    rounded-xl overflow-hidden
    border border-slate-200 dark:border-slate-700
    bg-blue-100 dark:bg-slate-800
    shadow-md dark:shadow-md dark:shadow-black/20
    transition-all duration-300
  "
>

                     <AccordionTrigger
  className="
    px-4
    hover:no-underline
    transition-all duration-300
    bg-blue-400/40
    dark:bg-slate-700
    hover:bg-blue-200/90
    dark:hover:bg-slate-600
    text-black
    dark:text-white
    border-b border-slate-200
    dark:border-slate-700
  "
>

                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            <div
  className={`w-3 h-3 rounded-full bg-gradient-to-br ${activeGradient}`}
/>

                            <span className="font-medium">
                              {stream.title} ({stream.categories.length} categories)
                            </span>
                          </div>
                        </div>
                      </AccordionTrigger>
<AccordionContent className="px-4 py-4 transition-all duration-300 ease-in-out">
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
    {stream.categories.map((cat, index) => (
      <CategoryCard
  key={cat.id}
  title={cat.title}
  description={cat.description}
  icon={cat.icon}
  color={cat.color || gradients[index % gradients.length]}
  itemsCount={cat.items?.length || 0}
  path={`/${divisionId}/${activeAudience?.id}/stream/${stream.id}/${cat.id}`}
  hoverOpacity={0.1} 
/>

    ))}
  </div>
</AccordionContent>


                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </section>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
