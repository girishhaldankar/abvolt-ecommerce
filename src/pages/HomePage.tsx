import { Header } from "../components/Header";
import { HeroSection2 } from "../components/HeroSection2";
import { HeroSectionScroll } from "../components/HeroSectionScroll";
import { HeroSection3D } from "../components/HeroSection3D"; // make sure the path is correct
import MainSections from "../components/MainSections";
import { CategoriesSection } from "../components/CategoriesSection";
import { ProductGrid } from "../components/shop/ProductGrid";
import { Footer } from "../components/Footer";
import DivisionGrid from "../components/division/DivisionGrid";
import { products } from "../data/products";
import AboutSection from "../components/AboutSection";
import WhyChooseUsSection from "../components/WhyChooseUsSection";
import GlowBackground from "../components/ui/GlowBackground";
import aboutImage from "../assets/microchip.jpg";
import divisionImage from "../assets/microchip.jpg";


import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <div className="relative min-h-screen text-[var(--page-text)] transition-colors duration-500">

      <Header />

      {/* HERO - No glow (optional) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <HeroSection2 />
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 mb-16">

  <motion.div
  className="app-section relative rounded-2xl overflow-hidden mb-16"
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: false }}
  transition={{ duration: 0.8 }}
>

  {/* Background Base */}


  {/* Floating Geometric Particles */}
  <div className="absolute inset-0 overflow-hidden pointer-events-none">

    {/* Square */}
    <motion.div
      animate={{ y: [0, -30, 0], rotate: [0, 20, 0] }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      className="
        absolute top-20 left-20
        w-12 h-12
        border-2 border-indigo-400/40
        dark:border-indigo-500/40
        rotate-12
      "
    />

    {/* Triangle */}
    <motion.div
      animate={{ y: [0, 40, 0], rotate: [0, -15, 0] }}
      transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      className="
        absolute bottom-32 right-32
        w-0 h-0
        border-l-[30px] border-l-transparent
        border-r-[30px] border-r-transparent
        border-b-[50px]
        border-b-blue-400/40
        dark:border-b-blue-500/40
      "
    />

    {/* Circle Outline */}
    <motion.div
      animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      className="
        absolute top-1/2 left-1/3
        w-16 h-16
        rounded-full
        border-2 border-purple-400/40
        dark:border-purple-500/40
      "
    />

    {/* Large Faint Square */}
    <motion.div
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      className="
        absolute -top-20 -right-20
        w-64 h-64
        border border-slate-400/20
        dark:border-slate-600/20
        rotate-45
      "
    />

  </div>

  {/* Light readability overlay */}
   {/* Glow */}
  <GlowBackground className="opacity-90" />

  {/* Content */}
  <div className="relative z-20">
    <DivisionGrid />
  </div>

</motion.div>

        {/* About Section with Glow */}
        
<motion.div
  className="app-section relative rounded-2xl overflow-hidden mb-16"
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: false }}
  transition={{ duration: 0.8, delay: 0.1 }}
>

  {/* Glow */}
  <GlowBackground className="opacity-60" />

  {/* Content */}
  <div className="relative z-10">
    <AboutSection variant="landing" />
  </div>

</motion.div>



        <motion.div
  className="relative rounded-2xl overflow-hidden mb-16 app-section"
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: false }}
  transition={{ duration: 0.8, delay: 0.2 }}
>

  {/* Dark Mode Background Image */}
  <div
    className="absolute inset-0 bg-cover bg-center bg-no-repeat hidden dark:block"
    style={{ backgroundImage: `url(${aboutImage})` }}
  />

  {/* Theme Overlay */}
  <div className="absolute inset-0 dark:bg-black/40 " />
<GlowBackground className="opacity-90" />
  {/* Content */}
  <div className="relative z-20">
    <WhyChooseUsSection variant="landing" />
  </div>

</motion.div>



        {/* Categories with Glow */}
        <motion.div
          className="relative rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <GlowBackground className="opacity-40" />
          <CategoriesSection />
        </motion.div>

      </div>

      <Footer />
    </div>
  );
}


