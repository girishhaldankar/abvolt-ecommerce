import { useMemo } from "react";

interface HeroBackgroundProps {
  variant?: "default" | "soft";
  className?: string;
}

export default function HeroBackground({
  variant = "default",
  className = "",
}: HeroBackgroundProps) {

  // Generate stable random particles
  const particles = useMemo(
  () =>
    Array.from({ length: 50 }, () => ({
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 2.5 + 0.8,
      opacity: Math.random() * 0.5 + 0.2,
      duration: Math.random() * 8 + 6, // 6–14s
      delay: Math.random() * 5,
    })),
  []
);


  return (
    <div className={`absolute inset-0 overflow-hidden -z-10 ${className}`}>

      {/* Base radial gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            variant === "soft"
              ? "var(--hero-bg-soft)"
              : "var(--hero-bg)",
        }}
      />

      {/* Center glow (theme aware) */}
      <div
        className="
          absolute
          left-1/2
          top-1/2
          -translate-x-1/2
          -translate-y-1/2
          w-[900px]
          h-[600px]
          rounded-full
          blur-[160px]
          bg-blue-300/40
          dark:bg-indigo-500/40
        "
      />

      {/* Bottom fade to match page bg */}
      <div
        className="
          absolute inset-0
          bg-gradient-to-b
          from-transparent
          via-transparent
          to-[var(--page-bg)]
        "
      />

      {/* Random particles */}
     {/* Random particles - Dark mode only */}
<div className="absolute inset-0 pointer-events-none hidden dark:block">
  {particles.map((p, i) => (
    <span
  key={i}
  className="absolute rounded-full bg-gradient-to-br from-white to-blue-200"
  style={{
    top: `${p.top}%`,
    left: `${p.left}%`,
    width: `${p.size}px`,
    height: `${p.size}px`,
    opacity: p.opacity,
    filter: "blur(0.8px)",
    animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
  }}
/>

  ))}
</div>


    </div>
  );
}
