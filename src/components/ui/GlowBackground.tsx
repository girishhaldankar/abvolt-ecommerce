interface GlowBackgroundProps {
  className?: string;
}

export default function GlowBackground({
  className = "",
}: GlowBackgroundProps) {
  return (
    <div className={`absolute inset-0 -z-10 overflow-hidden rounded-2xl ${className}`}>

      {/* ================= LIGHT MODE ================= */}
      <div
        className="absolute inset-0 dark:hidden"
        style={{
          background: `
            /* Soft upper tech glow */
            radial-gradient(
              800px circle at 50% 10%,
              oklch(0.97 0.015 255),
              transparent 70%
            ),

            /* Section depth layer */
            linear-gradient(
              to bottom,
              oklch(0.92 0.015 255),
              oklch(0.88 0.02 255)
            )
          `,
        }}
      />

      {/* ================= DARK MODE ================= */}
      <div
  className="absolute inset-0 hidden dark:block"
  style={{
    background: `
      radial-gradient(
        950px circle at 50% -10%,
        oklch(0.40 0.14 262 / 0.35),
        transparent 70%
      ),

      linear-gradient(
        to bottom,
        oklch(0.22 0.06 265),
        oklch(0.16 0.05 270)
      )
    `,
  }}
/>


    </div>
  );
}
