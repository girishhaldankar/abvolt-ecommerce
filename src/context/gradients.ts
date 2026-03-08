// constants for colors & their Tailwind gradient classes
export const GRADIENT_MAP: Record<string, string> = {
  green: "from-green-400 to-green-600",
  cyan: "from-cyan-400 to-cyan-600",
  blue: "from-blue-400 to-blue-600",
  purple: "from-purple-400 to-purple-600",
  orange: "from-orange-400 to-orange-600",
  red: "from-red-400 to-red-600",
  emerald: "from-emerald-400 to-emerald-600",
};

// all available colors for dropdown / selection
export const COLOR_NAMES = Object.keys(GRADIENT_MAP);

// fallback default gradient if no color selected
export const DEFAULT_GRADIENT = "from-gray-400 to-gray-600";
