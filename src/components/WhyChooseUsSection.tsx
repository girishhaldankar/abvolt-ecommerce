import {
  GraduationCap,
  Settings,
  Building2,
  Wrench,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import GlassButton from "./GlassButton";

type WhyChooseVariant = "landing" | "page";

type WhyChooseUsSectionProps = {
  variant?: WhyChooseVariant;
};

const points = [
  {
    icon: GraduationCap,
    title: "Curriculum Aligned",
    desc: "Products designed as per academic and training standards.",
  },
  {
    icon: Wrench,
    title: "Hands-on Learning",
    desc: "Practical kits that bridge theory and real-world application.",
  },
  {
    icon: Building2,
    title: "Industry Proven",
    desc: "Solutions trusted by institutions and industrial clients.",
  },
  {
    icon: Settings,
    title: "Custom Lab Solutions",
    desc: "Tailor-made labs and training setups as per requirements.",
  },
  {
    icon: Truck,
    title: "Pan-India Support",
    desc: "Reliable delivery, installation, and after-sales support.",
  },
  {
    icon: ShieldCheck,
    title: "Quality & Reliability",
    desc: "Built with high-quality components and long-term durability.",
  },
];

export default function WhyChooseUsSection({
  variant = "landing",
}: WhyChooseUsSectionProps) {
  const isLanding = variant === "landing";
  const visiblePoints = isLanding ? points.slice(0, 3) : points;

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section className="section relative overflow-hidden">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        {/* HEADER */}
        <motion.div
          variants={itemVariants}
          className={`text-center ${isLanding ? "mb-12" : "mb-16"}`}
        >
          <h2 className={`font-bold ${isLanding ? "text-3xl" : "text-4xl"}`}>
            Why Choose Abvolt
          </h2>

          <p className="mt-2 text-[var(--page-text)]/70 max-w-3xl mx-auto">
            {isLanding
              ? "Trusted solutions for education, training, and industry"
              : "Why institutions, trainers, and industries rely on Abvolt for long-term, real-world solutions"}
          </p>

          <div className="mt-6 mx-auto h-[2px] w-24 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full" />
        </motion.div>

        {/* POINTS GRID */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {visiblePoints.map((item, i) => {
            const Icon = item.icon;

            return (
              <motion.div
  key={i}
  variants={itemVariants}
  onMouseMove={(e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--y", `${e.clientY - rect.top}px`);
  }}
  className="
    group relative rounded-2xl p-6
    [background:var(--category-card-bg)]
    border border-[var(--category-border)]
    shadow-[var(--category-card-shadow)]
    hover:shadow-[var(--category-card-shadow-hover)]
    transition-all duration-300
    hover:-translate-y-1
    text-center
    overflow-hidden
  "
>
  {/* 🔥 PERFECT BORDER SPOTLIGHT (Fixed Corners) */}
  <div
    className="
      pointer-events-none absolute -inset-[1px] rounded-2xl
      opacity-0 group-hover:opacity-100
      transition duration-300
    "
    style={{
      background: `
        radial-gradient(
          280px circle at var(--x) var(--y),
          rgba(99,102,241,0.7),
          transparent 45%
        )
      `,
      WebkitMask:
        "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
      WebkitMaskComposite: "xor",
      maskComposite: "exclude",
      padding: "2px",
      borderRadius: "1rem", // 🔑 MATCHES rounded-2xl
    }}
  />

  {/* 🔥 SOFT INNER GLOW */}
  <div
    className="
      pointer-events-none absolute inset-0 rounded-2xl
      opacity-0 group-hover:opacity-100
      transition duration-300
    "
  >
    <div
      className="
        absolute inset-0
        bg-[radial-gradient(600px_circle_at_var(--x)_var(--y),rgba(99,102,241,0.18),transparent_60%)]
      "
    />
  </div>

  {/* Icon */}
  <div className="relative z-10 mb-4 w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mx-auto">
    <Icon className="w-6 h-6 text-white" />
  </div>

  {/* Title */}
  <h4 className="relative z-10 font-semibold mb-2">
    {item.title}
  </h4>

  {/* Description */}
  <p className="relative z-10 text-sm leading-relaxed">
    {item.desc}
  </p>
</motion.div>


            );
          })}
        </motion.div>

        {/* CTA */}
        {isLanding && (
          <motion.div variants={itemVariants} className="text-center mt-12">
            <Link to={`/about`} className="inline-flex group pt-4">
              <GlassButton>Learn More →</GlassButton>
            </Link>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
