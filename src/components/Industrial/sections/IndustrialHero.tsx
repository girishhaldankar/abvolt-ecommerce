import { motion } from "framer-motion";
import ElectroStaticImg from "../../../assets/microchip.jpg";
import educationalImage from "../../../assets/industrialCommercial.jpg";

export default function EducationHero() {
  return (
    <section
      className="
        relative min-h-screen flex items-center overflow-hidden
        pt-24 sm:pt-32 lg:pt-0
        
        z-0
      "
      style={{ background: "var(--hero-bg)" }}
    >
      {/* Background Image */}
      <img
        src={ElectroStaticImg}
        alt="Education Hero"
        className="absolute inset-0 w-full h-full object-cover opacity-25"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30" />

      <div className="container max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* LEFT: Text & Buttons */}
          <motion.div
            className="space-y-6 text-center lg:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display leading-tight">
              Industrial & Commercial Solutions
            </h1>

            <p className="text-base md:text-lg opacity-80 max-w-md mx-auto lg:mx-0">
             Industrial Automation, Electrical Systems, Machinery Components & Commercial Equipment
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <motion.button
                className="px-6 py-3 text-sm rounded-full bg-gradient-to-r from-cyan-600 to-blue-800 text-white font-medium shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Explore Products
              </motion.button>

              <motion.button
                className="px-6 py-3 text-sm rounded-full bg-gradient-to-r from-cyan-600 to-blue-800 text-white font-medium shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Categories
              </motion.button>
            </div>
          </motion.div>

          {/* RIGHT: Hero Image */}
          <motion.div
            className="flex justify-center lg:justify-end"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
          >
            <img
              src={educationalImage}
              alt="Classroom"
              className="rounded-3xl shadow-2xl w-full max-w-sm md:max-w-md lg:max-w-lg"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
