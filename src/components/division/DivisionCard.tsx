import { Link } from "react-router-dom";
import * as Icons from "lucide-react";
import { GRADIENT_MAP } from "../../context/gradients";
import { motion } from "framer-motion";
import GlassButton from "../GlassButton";

interface DivisionCardProps {
  division: {
    id: string;
    title: string;
    description?: string;
    icon?: string;
    color?: string;
  };
}

export default function DivisionCard({ division }: DivisionCardProps) {
  const Icon =
    division.icon && (Icons as any)[division.icon]
      ? (Icons as any)[division.icon]
      : Icons.Box;

  const color = GRADIENT_MAP[division.color || "green"];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.2 }}
      exit="hidden"
      className="flex flex-col h-full"
    >
      <Link
  to={`/${division.id}`}
  onMouseMove={(e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--y", `${e.clientY - rect.top}px`);
  }}
  className="
    group relative p-6 rounded-xl
    border border-[var(--category-border)]
    flex flex-col justify-between items-center text-center
    transition-all duration-300
    hover:-translate-y-1 hover:shadow-xl
    bg-[var(--category-card-bg)]
    overflow-hidden
    h-full
  "
>
  {/* 🔥 DYNAMIC BORDER SPOTLIGHT */}
  <div
    className={`
      pointer-events-none absolute -inset-[1px] rounded-xl
      opacity-0 group-hover:opacity-100
      transition duration-300
      bg-gradient-to-r ${color}
    `}
    style={{
      mask: `
        radial-gradient(
          250px circle at var(--x) var(--y),
          black 40%,
          transparent 70%
        )
      `,
      WebkitMask: `
        radial-gradient(
          250px circle at var(--x) var(--y),
          black 40%,
          transparent 70%
        )
      `,
      padding: "2px",
      borderRadius: "0.75rem",
      filter: "blur(8px)",
    }}
  />

  {/* 🔥 DYNAMIC INNER GLOW */}
  <div
    className={`
      pointer-events-none absolute inset-0 rounded-xl
      opacity-0 group-hover:opacity-100
      transition duration-300
    `}
  >
    <div
      className={`
        absolute inset-0
        bg-gradient-to-r ${color}
        opacity-30
      `}
      style={{
        mask: `
          radial-gradient(
            500px circle at var(--x) var(--y),
            black 20%,
            transparent 60%
          )
        `,
        WebkitMask: `
          radial-gradient(
            500px circle at var(--x) var(--y),
            black 20%,
            transparent 60%
          )
        `,
      }}
    />
  </div>

  {/* Gradient Background */}
  <div
    className={`
      absolute inset-0 rounded-xl bg-gradient-to-br ${color}
      opacity-[var(--category-hover-gradient-opacity)]
      transition-opacity duration-300
      group-hover:opacity-70
    `}
  />

  {/* Content */}
  <div className="relative z-10 flex flex-col items-center text-center">

    {/* Icon */}
    <div className="relative mb-4 flex justify-center">
      <div
        className={`
          w-11 h-11 sm:w-14 sm:h-14 rounded-xl overflow-hidden
          bg-gradient-to-br ${color}
          p-0.5
          transition-transform duration-300
          group-hover:scale-110
        `}
      >
        <div className="w-full h-full rounded-xl bg-[var(--category-card-bg)] flex items-center justify-center">
          <Icon className="w-5 h-5 sm:w-7 sm:h-7" />
        </div>
      </div>
    </div>

    {/* Title */}
    <h3 className="text-sm sm:text-base md:text-lg font-medium leading-[1.2] md:leading-[1.3]">
      {division.title}
    </h3>

    {division.description && (
      <p className="text-xs sm:text-sm md:text-sm mt-2 mb-2 text-muted-foreground leading-relaxed line-clamp-2">
        {division.description}
      </p>
    )}
  </div>

  {/* Button */}
  <GlassButton className="bg-white/50 dark:bg-white/20 mt-2">
    Explore →
  </GlassButton>

  {/* Corner Accent */}
  <span
    className="
      pointer-events-none absolute top-2 right-2 w-5 h-5
      border-t-2 border-r-2
      rounded-tr-xl
      border-[var(--category-corner-accent)]
      group-hover:border-[var(--category-corner-accent-hover)]
      transition-colors duration-300
    "
  />
</Link>

    </motion.div>
  );
}
