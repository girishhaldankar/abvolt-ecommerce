import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import heroSVG1 from "../assets/hero.svg";
import heroSVG2 from "../assets/hero.svg";
import heroSVG3 from "../assets/hero.svg";
import HeroBackground from "../components/HeroBackground";

export function HeroSection() {
  const slides = [
    {
      title: "Advanced Drone Components",
      subtitle:
        "Learn about drones, FPV systems, flight controllers, motors, propellers, batteries, and kits.",
      svg: heroSVG1,
      floatActive: true,
    },
    {
      title: "Hands-On Assembly",
      subtitle:
        "See how each component integrates seamlessly into a complete training system.",
      svg: heroSVG2,
      floatActive: false,
    },
    {
      title: "Fully Assembled Drone",
      subtitle:
        "Experience the final build — optimized, calibrated, and ready for flight.",
      svg: heroSVG3,
      floatActive: true,
    },
  ];

  const [current, setCurrent] = useState(0);
  const [svgContent, setSvgContent] = useState("");
  const [SVGs, setSVGs] = useState<string[]>([]);

  /* ---------------- Load SVGs Once ---------------- */
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
        setSvgContent(SVGs[next]);
        return next;
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [SVGs]);

  /* ---------------- Fan Animation ---------------- */
  useEffect(() => {
    const fanIds = [
      "fanTopLeft",
      "fanTopRight",
      "fanBottomLeft",
      "fanBottomRight",
    ];

    const BASE_DELAY = 300;
    const STAGGER = 300;
    const timeouts: number[] = [];

    fanIds.forEach((id, index) => {
      const fan = document.getElementById(id) as HTMLElement | null;
      if (!fan) return;

      fan.style.transition =
        "transform 1.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.6s ease";

      const spinAnimation =
        id === "fanTopLeft" || id === "fanBottomRight"
          ? "spinCW 0.4s linear infinite"
          : "spinCCW 0.4s linear infinite";

      if (current === 0) {
        fan.style.opacity = "1";
        fan.style.transform = "translateY(0px)";
        fan.style.animation = spinAnimation;
      }

      if (current === 1) {
        fan.style.animation = "none";
        const t = window.setTimeout(() => {
          fan.style.transform = "translateY(-32px)";
        }, BASE_DELAY + index * STAGGER);
        timeouts.push(t);
      }

      if (current === 2) {
        fan.style.animation = "none";
        const t = window.setTimeout(() => {
          fan.style.transform = "translateY(0px)";
        }, index * STAGGER);
        timeouts.push(t);
      }
    });

    return () => timeouts.forEach(clearTimeout);
  }, [current]);

  return (
    <section className="relative isolate min-h-screen flex items-center overflow-hidden py-20 text-[var(--hero-text)]">

      {/* Background */}
      <HeroBackground />

      <div className="container max-w-7xl mx-auto px-6 z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

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
           <div className="min-h-[180px] flex flex-col justify-center">

  <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight">
    {(() => {
      const words = slides[current].title.split(" ");
      const lastWord = words.pop();
      const firstPart = words.join(" ");

      return (
        <>
          <span className="text-slate-900 dark:text-white">
            {firstPart}
          </span>
          <br />
          <span className="text-teal-700 dark:text-teal-500">
            {lastWord}
          </span>
        </>
      );
    })()}
  </h1>

  <p className="mt-4 text-lg opacity-90 max-w-lg mx-auto lg:mx-0">
    {slides[current].subtitle}
  </p>

</div>

              {/* Buttons */}
              <div className="flex flex-col gap-4 items-center lg:flex-row lg:items-start">

                {/* Primary CTA */}
                <motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="
    px-8 py-3 rounded-full font-medium
    transition-all duration-300
    text-white
    bg-gradient-to-r from-teal-600 to-cyan-600
    hover:from-teal-700 hover:to-cyan-700
    dark:from-teal-600 dark:to-cyan-500
    dark:hover:from-teal-500 dark:hover:to-cyan-600
    shadow-lg dark:shadow-teal-500/20
  "
>
  Shop Now
</motion.button>

                {/* Secondary CTA */}
                <motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="
    px-8 py-3 rounded-full font-medium
    transition-all duration-300
    border
    border-slate-300 text-slate-700
    hover:bg-slate-100
    dark:border-white/20 dark:text-white
    dark:hover:bg-white/10
  "
>
  View Categories
</motion.button>

              </div>
            </motion.div>
          </AnimatePresence>

          {/* RIGHT SVG + GLOW */}
          <div className="relative flex justify-center lg:justify-end">

            {/* Radial Glow */}
            <div className="absolute w-80 h-80 bg-teal-500/30 blur-3xl rounded-full pointer-events-none" />

            <motion.div
  className={`relative w-full max-w-md lg:max-w-lg xl:max-w-xl -translate-y-2 ${
    slides[current].floatActive ? "animate-float-drone" : ""
  }`}
>
              <div
                id="heroSvgContainer"
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* DOT NAVIGATION */}
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