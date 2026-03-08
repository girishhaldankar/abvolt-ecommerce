import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import droneAnimationSVG from "../assets/drownanimation.svg";
import HeroBackground from "../components/HeroBackground";

export function HeroSection2() {
  const slides = [
    {
      title: "Blueprint View",
      subtitle: "Structural wireframe visualization of the drone system.",
      floatActive: false,
    },
    {
      title: "Advanced Drone Components",
      subtitle:
        "Learn about drones, FPV systems, flight controllers, motors and propellers.",
      floatActive: true,
    },
    {
      title: "Fully Assembled Drone",
      subtitle: "Experience the final calibrated drone ready for flight.",
      floatActive: true,
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
            ? "spinCW 0.4s linear infinite"
            : "spinCCW 0.4s linear infinite";

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
    }, 100);

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
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                  {slides[current].title}
                </h1>
                <p className="mt-4 text-base sm:text-lg md:text-xl opacity-90 max-w-full lg:max-w-lg">
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
                  minHeight: "160px",
                }}
                dangerouslySetInnerHTML={{
                  __html: svgContent,
                }}
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