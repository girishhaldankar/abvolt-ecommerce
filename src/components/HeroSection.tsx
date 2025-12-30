import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import heroSVG from "../assets/hero.svg";

export function HeroSection() {
  const [svgContent, setSvgContent] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 640);

    fetch(heroSVG)
      .then(res => res.text())
      .then(svg => setSvgContent(svg));

    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const updateColor = () => {
      const vector22 = document.getElementById("Vector_22");
      if (!vector22) return;
      vector22.setAttribute(
        "fill",
        document.documentElement.classList.contains("dark") ? "#EBEBEB" : "#EBEBEB"
      );
    };
    updateColor();
    const observer = new MutationObserver(updateColor);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [svgContent]);

  return (
    <section
      className="
        relative min-h-screen flex items-center overflow-hidden
        pt-24 sm:pt-32 lg:pt-0 transition-colors duration-500
        text-[var(--hero-text)]
      "
      style={{ background: "var(--hero-bg)" }}
    >
      
      <div className="container max-w-7xl mx-auto px-6 z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* LEFT CONTENT */}
          <motion.div
            className="space-y-4 text-center lg:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          >
            <h1 className="text-[var(--hero-title)] text-3xl sm:text-4xl md:text-5xl font-display leading-tight">
              Advanced Drone Technology & Components
            </h1>
            <p className="text-[var(--hero-text)] text-base md:text-lg opacity-80 max-w-md mx-auto lg:mx-0 ">
              Explore professional drones, FPV systems, flight controllers, brushless motors,
              propellers, ESCs, frames, batteries, and complete drone building kits.
            </p>
<div className="flex flex-col gap-4 justify-center items-center mt-4 lg:flex-row lg:justify-start lg:gap-6">
  <motion.button
    className="px-6 py-3 text-sm rounded-full flex items-center justify-center gap-2 font-semibold
               border border-transparent
               transition-all duration-300 hover:scale-105 hover:shadow-lg"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    style={{
      background: "var(--hero-primary-btn-bg)",
      color: "var(--hero-primary-btn-text)",
      boxShadow: "var(--hero-primary-btn-shadow)"
    }}
  >
    Shop Now
  </motion.button>

  <motion.button
    className="px-6 py-3 text-sm rounded-full flex items-center justify-center gap-2 font-semibold
               border border-transparent
               transition-all duration-300 hover:scale-105 hover:shadow-lg"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    style={{
      background: "var(--hero-secondary-btn-bg)",
      color: "var(--hero-secondary-btn-text)",
      boxShadow: "var(--hero-secondary-btn-shadow)",
      borderColor: "var(--hero-secondary-btn-text)"
    }}
  >
    View Categories
  </motion.button>
</div>


          </motion.div>

          {/* RIGHT CONTENT - SVG Drone */}
          <motion.div
            className="relative flex justify-center lg:justify-end"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
          >
            <motion.div
              className="w-full max-w-md lg:max-w-lg perspective-1000 animate-float-drone"
              animate={{ y: [0, -20, 0], rotateX: [0, 4, 0], rotateY: [0, -4, 0], rotateZ: [-2, 2, -2] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div
                id="heroSvgContainer"
                className="w-full max-w-md lg:max-w-lg"
                dangerouslySetInnerHTML={{ __html: svgContent }}
              ></div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
