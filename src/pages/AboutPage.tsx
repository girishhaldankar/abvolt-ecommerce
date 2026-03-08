import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import AboutSection from "../components/AboutSection";
import WhyChooseUsSection from "../components/WhyChooseUsSection";
import { Link } from "react-router-dom";
import aboutImage from "../assets/microchip.jpg";
import training from "../assets/motherboard.svg";
import { motion } from "framer-motion";
import GlowBackground from "../components/ui/GlowBackground";
import HeroBackground from "../components/HeroBackground";

export default function AboutPage() {
  return (
    <div className="relative min-h-screen text-[var(--page-text)] transition-colors duration-500">
      {/* Header */}
      <Header />

      {/* HERO SECTION */}
    <section
  className="
    relative isolate overflow-hidden
    pt-32 sm:pt-40 pb-32
    text-[var(--hero-text)]
  "
>
  <HeroBackground />

  {/* Soft tech texture */}
  <div
    className="
      absolute inset-0 bg-cover bg-center
      opacity-5 dark:opacity-20
      mix-blend-overlay
    "
    style={{ backgroundImage: `url(${aboutImage})` }}
  />

  {/* Bottom fade */}
  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--page-bg)]" />

  <div className="relative z-10 max-w-7xl mx-auto px-6">
    <div className="grid lg:grid-cols-2 gap-16 items-center">
      
      {/* LEFT TEXT */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="space-y-8"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-[1px] bg-cyan-500" />
          <p className="uppercase tracking-widest text-sm text-cyan-600 dark:text-cyan-400">
            About Abvolt
          </p>
        </div>

        <h1 className="
          text-4xl sm:text-5xl md:text-6xl
          font-display font-semibold
          leading-tight
        ">
          Innovating Learning
          <br />
          & Industry
        </h1>

        <p className="
          max-w-xl
          text-lg md:text-xl
          text-[var(--hero-text)]/75
          leading-relaxed
        ">
          We empower students, professionals, and organizations
          with cutting-edge educational kits, industrial solutions,
          and skill-based training programs built for real-world impact.
        </p>
      </motion.div>

      {/* RIGHT VISUAL BLOCK */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative hidden lg:block"
      >
        <div className="
          rounded-2xl overflow-hidden
          border border-white/10
          backdrop-blur-sm
          shadow-2xl
        ">
          <img
            src={training}
            alt="Microchip"
            className="w-full h-[420px] object-cover"
          />
        </div>

        {/* Soft glow behind image */}
        <div className="
          absolute -inset-10
          bg-cyan-500/10
          blur-3xl
          -z-10
        " />
      </motion.div>
    </div>
  </div>
</section>


      {/* ABOUT SECTION */}
     <motion.div
  className="relative"
  initial="hidden"
  whileInView="visible"
  viewport={{ once: false, amount: 0.3 }}
  transition={{ staggerChildren: 0.2 }}
>
  <GlowBackground />
  <AboutSection variant="page" />
</motion.div>



      {/* WHY CHOOSE US */}
      <motion.div
       className="relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
        transition={{ staggerChildren: 0.15 }}
      >
         <GlowBackground  /> 
        <WhyChooseUsSection variant="page" />
      </motion.div>

      {/* CTA SECTION */}
      <motion.section
        className="app-section relative overflow-hidden py-16"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-4xl mx-auto px-4 space-y-6 text-center">
          <h3 className="text-3xl md:text-4xl font-bold">
            Let’s Build the Future Together
          </h3>

          <p className="text-[var(--page-text)]/70 text-lg">
            Partner with Abvolt for cutting-edge educational kits, industrial
            solutions, and skill-based training programs.
          </p>

          <div className="flex justify-center gap-4 flex-wrap mt-4">
            <Link
              to="/educational"
              className="px-6 py-3 rounded-xl bg-cyan-500 font-semibold hover:bg-cyan-600 transition"
            >
              Explore Education
            </Link>

            <Link
              to="/contact"
              className="px-6 py-3 rounded-xl border border-white/20 hover:bg-white/5 transition"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </motion.section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
