import { Link } from "react-router-dom";
import GlowBackground from "./ui/GlowBackground";
import { CheckCircle } from "lucide-react";
import aboutImage from "../assets/circuit-board.png";
import { motion } from "framer-motion";
import GlassButton from "./GlassButton";


type AboutVariant = "landing" | "page";

type AboutSectionProps = {
  variant?: AboutVariant;
};

export default function AboutSection({ variant = "landing" }: AboutSectionProps) {
  const isLanding = variant === "landing";

  // Variants
  const headerVariant = { hidden: { opacity: 0, y: -30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8 } } };
  const leftVariant = { hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8 } } };
  const rightVariant = { hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8 } } };
  const itemVariant = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

  return (
    <section className="section  relative overflow-hidden">
      

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        {isLanding && (
          <motion.header
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }} // allow reverse animation
            exit="hidden" // reverse animation
            variants={headerVariant}
            className="section-header text-center mb-14"
          > 
          
            <h2 className="section-title text-3xl md:text-4xl font-semibold">About Abvolt</h2>
            <p className="section-desc mt-3 text-sm md:text-lg max-w-4xl mx-auto">
              Bridging education, innovation, and industry with practical, future-ready solutions.
            </p>
            <div className="mt-6 mx-auto h-[2px] w-24 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full" />
          </motion.header>
        )}

        {/* CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* LEFT — TEXT */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            exit="hidden"
            variants={leftVariant}
            className="space-y-6"
          >
            {!isLanding && (
              <motion.div variants={itemVariant} className="space-y-2">
                <p className="text-xs uppercase tracking-widest mb-2">Company Overview</p>
                <h3 className="text-2xl md:text-3xl font-semibold">Who We Are</h3>
                <div className="h-[2px] w-14 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" />
              </motion.div>
            )}

            <motion.p variants={itemVariant} className="leading-relaxed text-sm md:text-base max-w-xl">
              Abvolt designs and delivers educational kits, laboratory infrastructure, industrial automation systems, and professional training programs focused on real-world application.
            </motion.p>

            {!isLanding && (
              <motion.p variants={itemVariant} className="leading-relaxed text-sm md:text-base max-w-xl">
                Our solutions empower institutions, industries, and learners to stay aligned with evolving technologies through hands-on learning, industry-grade systems, and structured skill development.
              </motion.p>
            )}

            {isLanding && (
              <motion.div variants={itemVariant} className="space-y-3 pt-2">
                <motion.p variants={itemVariant} className="font-semibold text-base">What Sets Us Apart</motion.p>
                <motion.ul className="space-y-3">
                  {[
                    { text: "Industry-aligned educational & lab solutions", color: "text-cyan-500" },
                    { text: "Practical training with real hardware exposure", color: "text-blue-500" },
                    { text: "End-to-end support from design to deployment", color: "text-purple-500" },
                  ].map((point, idx) => (
                    <motion.li
                      key={idx}
                      variants={itemVariant}
                      transition={{ delay: idx * 0.1 }}
                      className="flex gap-3"
                    >
                      <CheckCircle className={`w-5 h-5 mt-1 ${point.color}`} />
                      <span>{point.text}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>
            )}

            {isLanding && (
              <motion.div variants={itemVariant}>
                <Link to="/about" className="inline-flex group pt-4">
                   <GlassButton>Learn More →</GlassButton>     

                </Link>
              </motion.div>
            )}
          </motion.div>

          {/* RIGHT — IMAGE */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            exit="hidden"
            variants={rightVariant}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-xl">
              <img
                src={aboutImage}
                alt="Abvolt education and industrial solutions"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-black/10 to-transparent" />
            </div>

            {/* Glow */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 blur-xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
