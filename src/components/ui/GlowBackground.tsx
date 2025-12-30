interface GlowBackgroundProps {
  className?: string;
}

export default function GlowBackground({ className = "" }: GlowBackgroundProps) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="absolute -top-32 -left-32 w-80 h-80
                      bg-cyan-500/20 blur-3xl rounded-full" />

      <div className="absolute -bottom-32 -right-32 w-80 h-80
                      bg-purple-500/20 blur-3xl rounded-full" />
    </div>
  );
}
