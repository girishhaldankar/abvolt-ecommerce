import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Header } from "../../../components/Header";
import { Footer } from "../../../components/Footer";
import educationalImage from "../../../assets/electrostatic.jpg";

import { Cog, Monitor, Plane, GraduationCap } from "lucide-react";

import { educationData } from "../../../data/educationData";
import GlowBackground from "../../../components/ui/GlowBackground";

/* ---------------- TYPES ---------------- */
type AudienceType = "engineering" | "iti" | "science-school" | "preschool";

/* ---------------- UI ONLY (CARDS) ---------------- */
const audiences = [
  {
    id: "engineering",
    title: "Engineering",
    subtitle: "Higher Education",
    icon: GraduationCap,
    color: "from-yellow-400 to-orange-500",
  },
  {
    id: "iti",
    title: "Volt ITI",
    subtitle: "Skill Training",
    icon: Cog,
    color: "from-cyan-500 to-blue-500",
  },
  {
    id: "science-school",
    title: "Science School",
    subtitle: "Physics, Chemistry & Labs",
    icon: Monitor,
    color: "from-teal-400 to-green-500",
  },
  {
    id: "preschool",
    title: "Preschool",
    subtitle: "Early STEM & Learning",
    icon: Plane,
    color: "from-pink-400 to-purple-500",
  },
];

/* ---------------- COMPONENT ---------------- */
export default function EducationPage() {
  const [openAudience, setOpenAudience] = useState<AudienceType | null>(null);
  const [openStream, setOpenStream] = useState<string | null>(null);
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const accordionRef = useRef<HTMLDivElement | null>(null);

  const handleAudienceClick = (audId: AudienceType) => {
    const newId = openAudience === audId ? null : audId;
    setOpenAudience(newId);
    setOpenStream(null);
    setOpenCategory(null);

    setTimeout(() => {
      if (accordionRef.current && newId) {
        const offset = window.innerHeight * 0.15;
        const top = accordionRef.current.getBoundingClientRect().top + window.scrollY;

        window.scrollTo({
          top: top - offset,
          behavior: "smooth",
        });
      }
    }, 120);
  };

  const activeAudience = educationData.audiences.find((a) => a.id === openAudience);

  return (
    <div className="bg-[var(--page-bg)] min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-12 space-y-14">
        {/* ---------------- HERO ---------------- */}
        <section className="app-section relative overflow-hidden">
          <GlowBackground  />

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10">
            <div className="flex-1 text-center lg:text-left space-y-5">
              <h1 className="text-3xl md:text-4xl font-extrabold var(--pg-text)">
                Explore <span className="text-cyan-600">Educational Kits</span>
              </h1>
              <p className="var(--pg-text) max-w-xl mx-auto lg:mx-0">
                Engineering, ITI, Science School & Preschool learning solutions
              </p>
            </div>

            <div className="flex-1 flex justify-center lg:justify-end">
              <img
                src={educationalImage}
                alt="Education"
                className="rounded-2xl shadow-xl w-full max-w-sm"
              />
            </div>
          </div>
        </section>

        {/* ---------------- AUDIENCE CARDS ---------------- */}
        {/* ---------------- AUDIENCE CARDS ---------------- */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {audiences.map((aud) => {
    const Icon = aud.icon;
    const isActive = openAudience === aud.id;

    return (
     <button
  key={aud.id}
  onClick={() => handleAudienceClick(aud.id as AudienceType)}
  className={`group relative p-6 rounded-xl overflow-hidden cursor-pointer
    bg-[var(--category-card-bg)]
    border border-[var(--category-border)]
    shadow-[var(--category-card-shadow)]

    flex flex-col items-center justify-center text-center

    transition-all duration-300 ease-out
    hover:scale-[1.03]
    hover:shadow-[var(--category-card-shadow-hover)]

    ${
      isActive
        ? "scale-[1.03] shadow-[var(--category-card-shadow-hover)]"
        : ""
    }
  `}
>

        {/* Hover / Active Gradient */}
        <div
          className={`absolute inset-0 rounded-xl
            bg-gradient-to-br ${aud.color}
            transition-opacity duration-300
            ${
              isActive
                ? "opacity-[calc(var(--category-hover-gradient-opacity)*5)]"
                : "opacity-[var(--category-hover-gradient-opacity)] group-hover:opacity-[calc(var(--category-hover-gradient-opacity)*2)]"
            }
          `}
        />

        {/* Icon */}
        <div className="relative mb-4 z-10">
          <div
            className={`w-14 h-14 rounded-xl bg-gradient-to-br ${aud.color} p-0.5
              transition-transform duration-300
              ${isActive ? "scale-110" : "group-hover:scale-110"}
            `}
          >
            <div className="w-full h-full rounded-xl bg-[var(--category-card-bg)]
              flex items-center justify-center">
              <Icon className="w-7 h-7 text-[var(--category-text)]" />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="relative z-10 space-y-1.5">
          <h3 className="text-[var(--category-text)] text-sm sm:text-base font-semibold">
            {aud.title}
          </h3>
          <p className="text-[var(--category-subtext)] text-xs sm:text-sm leading-relaxed">
            {aud.subtitle}
          </p>
        </div>

        {/* Corner Accent */}
        <span
          className={`pointer-events-none absolute top-2 right-2 w-5 h-5 sm:w-6 sm:h-6
            border-t-2 border-r-2 rounded-tr-xl transition-colors
            ${
              isActive
                ? "border-[var(--category-corner-accent-hover)]"
                : "border-[var(--category-corner-accent)] group-hover:border-[var(--category-corner-accent-hover)]"
            }
          `}
        />
      </button>
    );
  })}
</div>

        {/* ---------------- ACCORDION ---------------- */}
        {openAudience && activeAudience && (
          <section ref={accordionRef} className="space-y-10">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-[var(--pg-text)]">{activeAudience.title}</h2>
              <p className="text-slate-300 mt-2">{activeAudience.subtitle}</p>
            </div>

            {/* STREAMS */}
            <div className="space-y-6 max-w-5xl mx-auto">
              {activeAudience.streams.map((stream) => (
                <div key={stream.id}>
                  <div
                    onClick={() => setOpenStream(openStream === stream.id ? null : stream.id)}
                    className="cursor-pointer rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 p-5 hover:bg-white/10 flex justify-between items-center"
                  >
                    <div>
                      <h4 className="font-semibold text-white">{stream.title}</h4>
                      <p className="text-sm text-slate-300">{stream.description}</p>
                    </div>
                    <span className="text-white">{openStream === stream.id ? "▲" : "▼"}</span>
                  </div>

                  {/* CATEGORIES */}
                  {openStream === stream.id && (
                    <div className="ml-4 mt-3 space-y-3">
                      {stream.categories.map((cat) => (
                        <div key={cat.id}>
                          {/* Category header */}
                          {cat.path ? (
                            <Link
                              to={cat.path}
                              className="bg-gradient-to-tr from-slate-900 to-slate-800 p-4 rounded-xl flex justify-between cursor-pointer hover:bg-white/15"
                              onClick={(e) => e.stopPropagation()} // prevent toggling
                            >
                              <span className="text-white font-medium">{cat.title}</span>
                              <span className="text-white">→</span>
                            </Link>
                          ) : (
                            <div
                              onClick={() =>
                                setOpenCategory(openCategory === cat.id ? null : cat.id)
                              }
                              className="bg-gradient-to-tr from-slate-900 to-slate-800 p-4 rounded-xl flex justify-between cursor-pointer hover:bg-white/10"
                            >
                              <span className="text-white font-medium">{cat.title}</span>
                              <span className="text-white">{openCategory === cat.id ? "▲" : "▼"}</span>
                            </div>
                          )}

                          {/* ITEMS */}
                          {openCategory === cat.id && (
                            <div className="ml-4 mt-2 space-y-1">
                              {cat.items.map((item) => (
                                <Link
                                  key={item.id}
                                  to={item.path}
                                  className="block bg-white/5 p-3 rounded-lg hover:bg-white/10"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <p className="text-white text-sm">{item.name}</p>
                                  <p className="text-xs text-slate-400">{item.code}</p>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
