import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import {
  Blocks,
  Code2,
  Cpu,
  Volume2,
  Play,
  Sparkles,
} from "lucide-react";

import droneAnimationSVG from "../assets/drownanimation.svg";
import HeroBackground from "../components/HeroBackground";

export function HeroSection2() {
  const slides = [
    {
      title: "Blueprint View",
      subtitle: "Structural wireframe visualization of the drone system.",
      floatActive: false,
      type: "drone",
    },
    {
      title: "Advanced Drone Components",
      subtitle:
        "Learn about drones, FPV systems, flight controllers, motors and propellers.",
      floatActive: true,
      type: "drone",
    },
    {
      title: "Fully Assembled Drone",
      subtitle: "Experience the final calibrated drone ready for flight.",
      floatActive: true,
      type: "drone",
    },
    {
      title: "Meet QUBI Studio",
      subtitle:
        "A fun visual coding platform where students build, code and control real ESP32 projects.",
      floatActive: false,
      type: "qubi",
    },
  ];

  const [current, setCurrent] = useState(0);
  const [svgContent, setSvgContent] = useState("");
  const slideTimer = useRef<NodeJS.Timeout | null>(null);

  /* ---------------- Load SVG ---------------- */
  useEffect(() => {
    const loadSVG = async () => {
      const res = await fetch(droneAnimationSVG);
      const text = await res.text();
      setSvgContent(text);
    };

    loadSVG();
  }, []);

  /* ---------------- Auto Slide ---------------- */
  useEffect(() => {
    if (!svgContent) return;

    if (slideTimer.current) clearTimeout(slideTimer.current);

    const delay = current === 0 ? 5000 : 4000;

    slideTimer.current = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, delay);

    return () => {
      if (slideTimer.current) clearTimeout(slideTimer.current);
    };
  }, [current, svgContent]);

  /* ---------------- Wireframe Draw Animation ---------------- */
  const animateWireframe = () => {
    const elements = document.querySelectorAll(
      "#droneWire path, \
       #droneWire line, \
       #droneWire polyline, \
       #droneWire polygon, \
       #droneWire rect, \
       #droneWire circle, \
       #droneWire ellipse"
    );

    elements.forEach((el, index) => {
      const shape = el as SVGGeometryElement;

      if (!shape.getTotalLength) return;

      const length = shape.getTotalLength();

      shape.style.transition = "none";
      shape.style.strokeDasharray = length.toString();
      shape.style.strokeDashoffset = length.toString();
      shape.style.opacity = "0";

      void shape.getBoundingClientRect();

      const duration = 0.45;
      const delay = index * 0.012;

      shape.style.transition = `
        stroke-dashoffset ${duration}s cubic-bezier(0.22,1,0.36,1) ${delay}s,
        opacity 0.3s ease ${delay}s
      `;

      shape.style.strokeDashoffset = "0";
      shape.style.opacity = "1";
    });
  };

  /* ---------------- Slide Visual Control ---------------- */
  useEffect(() => {
    if (!svgContent) return;

    const wire = document.getElementById("droneWire");
    const color = document.getElementById("droneColor");

    if (!wire || !color) return;

    // RESET transitions
    wire.style.transition = "none";
    color.style.transition = "none";

    if (current === 0) {
      wire.style.opacity = "1";
      color.style.opacity = "0";

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          animateWireframe();
        });
      });
    }

    if (current === 1) {
      wire.style.transition = "opacity 0.8s ease";
      color.style.transition = "opacity 0.8s ease";

      wire.style.opacity = "0";
      color.style.opacity = "1";
    }

    if (current === 2) {
      wire.style.opacity = "0";
      color.style.opacity = "1";
    }
  }, [current, svgContent]);

  /* ---------------- Fan Lift + Spin Animation ---------------- */
  useEffect(() => {
    if (!svgContent) return;

    const fanIds = [
      "fanTopLeft",
      "fanTopRight",
      "fanBottomLeft",
      "fanBottomRight",
    ];

    const timer = setTimeout(() => {
      fanIds.forEach((id, index) => {
        const fan = document.getElementById(id) as HTMLElement | null;

        if (!fan) return;

        fan.style.transition =
          "transform 1.4s cubic-bezier(0.22,1,0.36,1), opacity 0.6s ease";

        const spinAnimation =
          id === "fanTopLeft" || id === "fanBottomRight"
            ? "spinCW 0.5s linear infinite"
            : "spinCCW 0.5s linear infinite";

        // Slide 0
        if (current === 0) {
          fan.style.animation = "none";
          fan.style.transform = "translateY(0px)";
          fan.style.opacity = "1";
        }

        // Slide 1 → Lift
        if (current === 1) {
          fan.style.animation = "none";
          fan.style.opacity = "1";

          const delay = 200 + index * 200;

          setTimeout(() => {
            fan.style.transform = "translateY(-28px)";
          }, delay);

          setTimeout(() => {
            fan.style.transform = "translateY(0px)";
          }, delay + 1000);
        }

        // Slide 2 → Spin
        if (current === 2) {
          fan.style.transform = "translateY(0px)";
          fan.style.opacity = "1";
          fan.style.animation = spinAnimation;
        }
      });
    }, 1100);

    return () => clearTimeout(timer);
  }, [current, svgContent]);

  return (
    <section className="relative isolate min-h-screen flex items-center overflow-hidden py-20 text-[var(--hero-text)]">
      <HeroBackground />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center justify-center">
          {/* =========================================
              LEFT CONTENT
          ========================================= */}
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
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                  {slides[current].title}
                </h1>

                <p className="mt-4 text-base sm:text-lg md:text-xl opacity-90 max-w-full lg:max-w-lg">
                  {slides[current].subtitle}
                </p>

                {/* =========================================
                    QUBI BUTTONS
                ========================================= */}
                {current === 3 && (
                  <div className="flex justify-center lg:justify-start pt-4">
  <a
    href="https://qubi.abvoltindia.com"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/30 bg-white/10 backdrop-blur-sm font-semibold hover:bg-white/20 transition"
  >
    <Play size={18} fill="currentColor" />
    Try QUBI
  </a>
</div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* =========================================
              RIGHT VISUAL AREA
              
              IMPORTANT:
              The drone stays mounted at all times.
              We only hide it visually on QUBI slide.
              This preserves the existing drone DOM
              and animation lifecycle.
          ========================================= */}
          <div className="relative flex justify-center lg:justify-end mt-8 lg:mt-0">
            <div className="absolute w-64 sm:w-72 md:w-80 h-64 sm:h-72 md:h-80 bg-teal-500/30 blur-3xl rounded-full pointer-events-none" />

            {/* =========================================
                ORIGINAL DRONE
            ========================================= */}
            <motion.div
              className={`relative w-full max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl ${
                slides[current].floatActive ? "animate-float-drone" : ""
              }`}
              animate={{
                opacity: current === 3 ? 0 : 1,
                scale: current === 3 ? 0.96 : 1,
              }}
              transition={{ duration: 0.35 }}
              style={{
                pointerEvents: current === 3 ? "none" : "auto",
              }}
            >
              <div
                id="heroSvgContainer"
                style={{
                  width: "100%",
                  height: "auto",
                  minHeight: "160px",
                }}
                dangerouslySetInnerHTML={{
                  __html: svgContent,
                }}
              />
            </motion.div>

            {/* =========================================
                QUBI VISUAL
            ========================================= */}
            <AnimatePresence>
              {current === 3 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{
                    duration: 0.6,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="relative w-full max-w-xl">
                    {/* QUBI Glow */}
                    <div className="absolute inset-0 bg-cyan-400/20 blur-3xl rounded-full scale-75" />

                    {/* =====================================
                        QUBI STUDIO CARD
                    ===================================== */}
                    <div className="relative rounded-3xl border border-white/20 bg-white/90 backdrop-blur-xl shadow-2xl overflow-hidden">
                      {/* Header */}
                      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                            <Sparkles
                              size={20}
                              className="text-white"
                            />
                          </div>

                          <div>
                            <div className="font-bold text-slate-900">
                              QUBI Studio
                            </div>
                            <div className="text-xs text-slate-500">
                              Visual Coding for ESP32
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          Ready
                        </div>
                      </div>

                      {/* Main Editor */}
                      <div className="grid grid-cols-[115px_1fr] min-h-[280px]">
                        {/* Toolbox */}
                        <div className="bg-slate-50 border-r border-slate-200 p-3 space-y-2">
                          <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 px-1 pb-1">
                            Blocks
                          </div>

                          <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-purple-100 text-purple-700 text-xs font-semibold">
                            <Blocks size={14} />
                            Display
                          </div>

                          <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-pink-100 text-pink-700 text-xs font-semibold">
                            <Sparkles size={14} />
                            RGB
                          </div>

                          <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-orange-100 text-orange-700 text-xs font-semibold">
                            <Volume2 size={14} />
                            Sound
                          </div>

                          <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-blue-100 text-blue-700 text-xs font-semibold">
                            <Cpu size={14} />
                            Pins
                          </div>

                          <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-green-100 text-green-700 text-xs font-semibold">
                            <Play size={14} />
                            Control
                          </div>
                        </div>

                        {/* Blockly Area */}
                        <div className="relative bg-slate-100 p-5">
                          <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-3">
                            Program
                          </div>

                          {/* Start Block */}
                          <motion.div
                            animate={{ y: [0, -3, 0] }}
                            transition={{
                              duration: 2.5,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                            className="w-fit px-4 py-2.5 rounded-lg bg-yellow-400 text-yellow-950 font-bold text-xs shadow-sm"
                          >
                            when program starts
                          </motion.div>

                          <div className="ml-5 w-0.5 h-3 bg-slate-300" />

                          {/* RGB Block */}
                          <div className="ml-5 w-fit px-4 py-2.5 rounded-lg bg-pink-500 text-white font-semibold text-xs shadow-sm">
                            set RGB color
                            <span className="ml-2 inline-block w-3 h-3 rounded-full bg-red-200 align-middle" />
                          </div>

                          <div className="ml-10 w-0.5 h-3 bg-slate-300" />

                          {/* Wait Block */}
                          <div className="ml-10 w-fit px-4 py-2.5 rounded-lg bg-orange-400 text-orange-950 font-semibold text-xs shadow-sm">
                            wait 1 sec
                          </div>

                          <div className="ml-15 w-0.5 h-3 bg-slate-300" />

                          {/* Tone Block */}
                          <div className="ml-15 w-fit px-4 py-2.5 rounded-lg bg-purple-500 text-white font-semibold text-xs shadow-sm">
                            play tone
                            <Volume2
                              size={12}
                              className="inline ml-2"
                            />
                          </div>

                          {/* Cursor */}
                          <motion.div
                            animate={{
                              x: [0, 5, 0],
                              y: [0, -3, 0],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                            className="absolute right-8 bottom-8"
                          >
                            <div className="w-0 h-0 border-l-[7px] border-l-slate-900 border-t-[10px] border-t-transparent border-b-[4px] border-b-transparent rotate-[-25deg]" />
                          </motion.div>
                        </div>
                      </div>

                      {/* Code / Hardware Footer */}
                      <div className="border-t border-slate-200 bg-slate-50 px-5 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Code2
                              size={16}
                              className="text-slate-600"
                            />
                            <span className="text-xs font-semibold text-slate-700">
                              BLOCKS → CODE
                            </span>
                          </div>

                          <div className="text-slate-300">→</div>

                          <div className="flex items-center gap-2">
                            <Cpu
                              size={16}
                              className="text-slate-600"
                            />
                            <span className="text-xs font-semibold text-slate-700">
                              ESP32
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* =========================================
          DOT NAV
      ========================================= */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
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