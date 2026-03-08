import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import wireframeSVG from "../assets/drone-wireframe.svg";
import solidSVG from "../assets/drone.svg";
import HeroBackground from "../components/HeroBackground";

export function HeroSection2() {
  const slides = [
    {
      title: "Blueprint View",
      subtitle: "Structural wireframe visualization of the drone system.",
      svg: wireframeSVG,
      floatActive: false,
    },
    {
      title: "Advanced Drone Components",
      subtitle:
        "Learn about drones, FPV systems, flight controllers, motors and propellers.",
      svg: solidSVG,
      floatActive: true,
    },
    {
      title: "Fully Assembled Drone",
      subtitle: "Experience the final calibrated drone ready for flight.",
      svg: solidSVG,
      floatActive: true,
    },
  ];

  const [current, setCurrent] = useState(0);
  const [SVGs, setSVGs] = useState<string[]>([]);
  const [svgContent, setSvgContent] = useState("");
  const [isMorphing, setIsMorphing] = useState(false);

  /* ---------------- Load SVGs ---------------- */
  useEffect(() => {
    const loadSVG = async (url: string) => {
      const res = await fetch(url);
      return await res.text();
    };

    Promise.all(slides.map((s) => loadSVG(s.svg))).then((contents) => {
      setSVGs(contents);
      setSvgContent(contents[0]);
    });
  }, []);

  /* ---------------- Auto Slide ---------------- */
  useEffect(() => {
    if (!SVGs.length) return;

    const interval = setInterval(() => {
      setCurrent((prev) => {
        const next = (prev + 1) % slides.length;

        if (prev === 0 && next === 1) {
          setIsMorphing(true);
          setTimeout(() => {
            setSvgContent(SVGs[next]);
            requestAnimationFrame(() => setIsMorphing(false));
          }, 600);
          return next;
        }

        setSvgContent(SVGs[next]);
        return next;
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [SVGs]);

  /* ---------------- Fan Animation ---------------- */
  useEffect(() => {
    if (!svgContent) return;

    const fanIds = [
      "fanTopLeft",
      "fanTopRight",
      "fanBottomLeft",
      "fanBottomRight",
    ];

    const BASE_DELAY = 300;
    const STAGGER = 300;

    const timer = setTimeout(() => {
      fanIds.forEach((id, index) => {
        const fan = document.getElementById(id) as HTMLElement | null;
        if (!fan) return;

        fan.style.transition =
          "transform 1.6s cubic-bezier(0.22,1,0.36,1), opacity 0.6s ease";

        const spinAnimation =
          id === "fanTopLeft" || id === "fanBottomRight"
            ? "spinCW 0.4s linear infinite"
            : "spinCCW 0.4s linear infinite";

        if (current === 0) {
          fan.style.animation = "none";
          fan.style.transform = "translateY(0px)";
          fan.style.opacity = "1";
        }

        if (current === 1) {
          fan.style.animation = "none";
          fan.style.opacity = "1";

          const delay = BASE_DELAY + index * STAGGER;
          setTimeout(() => (fan.style.transform = "translateY(-32px)"), delay);
          setTimeout(() => (fan.style.transform = "translateY(0px)"), delay + 1200);
        }

        if (current === 2) {
          fan.style.transform = "translateY(0px)";
          fan.style.opacity = "1";
          fan.style.animation = spinAnimation;
        }
      });
    }, 120);

    return () => clearTimeout(timer);
  }, [current, svgContent]);

  return (
    <section className="relative isolate min-h-screen flex items-center overflow-hidden py-20 text-[var(--hero-text)]">
      <HeroBackground />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center justify-center">
          {/* LEFT CONTENT */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              className="space-y-6 text-center lg:text-left"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.8 }}
            >
              <div className="min-h-[160px] flex flex-col justify-center">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight break-words">
                  {slides[current].title}
                </h1>
                <p className="mt-4 text-base sm:text-lg md:text-xl opacity-90 max-w-full lg:max-w-lg break-words">
                  {slides[current].subtitle}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* RIGHT SVG */}
          <div className="relative flex justify-center lg:justify-end mt-8 lg:mt-0">
            <div className="absolute w-64 sm:w-72 md:w-80 h-64 sm:h-72 md:h-80 bg-teal-500/30 blur-3xl rounded-full pointer-events-none" />

            <motion.div
              className={`relative w-full max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl ${
                slides[current].floatActive ? "animate-float-drone" : ""
              }`}
            >
              <div
                id="heroSvgContainer"
                style={{
                  width: "100%",
                  height: "auto",
                  opacity: isMorphing ? 0 : 1,
                  transform: isMorphing ? "scale(0.96)" : "scale(1)",
                  filter: isMorphing ? "blur(4px)" : "blur(0px)",
                  transition:
                    "opacity 0.6s ease, transform 0.6s ease, filter 0.6s ease",
                }}
                className={
                  current === 0
                    ? "dark:[&_path]:stroke-cyan-400 [&_path]:stroke-cyan-700 dark:[&_path]:drop-shadow-[0_0_6px_#0ff]"
                    : ""
                }
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* DOT NAV */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrent(index);
              setSvgContent(SVGs[index]);
            }}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === current
                ? "bg-white scale-110"
                : "bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
}