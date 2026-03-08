import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  // Load theme on mount (DARK is default)
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const html = document.documentElement;

    const theme = savedTheme ?? "dark";

    if (theme === "dark") {
      html.classList.add("dark");
      html.setAttribute("data-theme", "dark");
      setIsDark(true);
    } else {
      html.classList.remove("dark");
      html.setAttribute("data-theme", "light");
      setIsDark(false);
    }
  }, []);

  // Toggle handler
  const toggleTheme = () => {
    const html = document.documentElement;

    if (isDark) {
      html.classList.remove("dark");
      html.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      html.classList.add("dark");
      html.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="
        p-2 rounded-full transition
        bg-gray-200 text-gray-700
        hover:bg-gray-300
        dark:bg-gray-700 dark:text-gray-200
        dark:hover:bg-gray-600
      "
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
