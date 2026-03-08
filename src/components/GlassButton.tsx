// GlassButton.tsx
import React from "react";

const GlassButton = ({ children, className = "", ...props }) => {
  return (
   <div
  className={`
    relative
    px-6 py-2
    rounded-full
    text-xs md:text-sm font-medium
    transition-all duration-300
    backdrop-blur-md
    bg-blue-500/20
    text-black
    shadow-[inset_0_0_12px_rgba(0,0,0,0.2)]
    hover:bg-blue-500/30
    dark:bg-white/10
    dark:text-white
    dark:shadow-[inset_0_0_12px_rgba(255,255,255,0.25)]
    dark:hover:bg-white/20
    ${className}
  `}
  {...props}
>
  {children}
</div>

  );
};

export default GlassButton;
