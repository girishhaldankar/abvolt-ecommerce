import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import AbvoltLogo from "./AbvoltLogo";
import { getAllDivisions } from "../services/divisions.service";

interface MenuItem {
  name: string;
  path?: string;
  children?: MenuItem[];
}

const formatMenuLabel = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDesktop, setOpenDesktop] = useState<Record<string, boolean>>({});
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [openMobile, setOpenMobile] = useState<Record<string, boolean>>({});
  const [navItems, setNavItems] = useState<MenuItem[]>([]);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll on mobile open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "auto";
  }, [mobileOpen]);

  // Load dynamic divisions
  useEffect(() => {
    getAllDivisions().then((divisions: any[]) => {
      const divisionMenus: MenuItem[] = divisions.map((div) => ({
        name: div.title,
        children: div.audiences.map((aud: any) => ({
          name: aud.title,
          children: aud.streams.map((stream: any) => ({
            name: stream.title,
            children: stream.categories.map((cat: any) => ({
              name: cat.title,
              path: `/${div.id}/${aud.id}/stream/${stream.id}/${cat.id}`,
            })),
          })),
        })),
      }));

      setNavItems([
        { name: "Home", path: "/" },
        ...divisionMenus,
        { name: "Shop", path: "/shop" },
        { name: "About", path: "/about" },
        { name: "Contact", path: "/contact" },
      ]);
    });
  }, []);

  // Desktop recursive menu
  const renderDesktopMenu = (
    items: MenuItem[],
    parentKey = "",
    bgClass = "bg-white/30 dark:bg-slate-900/50"
  ) =>
    items.map((item, idx) => {
      const key = parentKey + idx;
      const isOpen = openDesktop[key];

      return (
        <div
          key={key}
          className="relative"
          onMouseEnter={() => setOpenDesktop((p) => ({ ...p, [key]: true }))}
          onMouseLeave={() => setOpenDesktop((p) => ({ ...p, [key]: false }))}
        >
          {item.children ? (
            <div className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-slate-800/50 rounded transition">
              <span>{formatMenuLabel(item.name)}</span>
              <ChevronDown size={12} />
            </div>
          ) : (
            <Link
              to={item.path!}
              className="block px-4 py-2 hover:bg-slate-800/50 rounded transition"
            >
              {formatMenuLabel(item.name)}
            </Link>
          )}

          {item.children && isOpen && (
            <div
              className={`absolute top-0 left-full min-w-[220px]
                ${bgClass} backdrop-blur-2xl backdrop-saturate-150
                border border-white/20 dark:border-white/10
                shadow-xl rounded-xl z-50`}
            >
              {renderDesktopMenu(item.children, key + "-", bgClass)}
            </div>
          )}
        </div>
      );
    });

  // Mobile recursive menu
  const renderMobileMenu = (items: MenuItem[], parentKey = "") =>
    items.map((item, idx) => {
      const key = parentKey ? `${parentKey}-${idx}` : `${idx}`;
      const isOpen = openMobile[key] || false;

      if (!item.children && item.path) {
        return (
          <Link
            key={key}
            to={item.path}
            className="block px-4 py-2 text-sm rounded-md hover:bg-white/20 dark:hover:bg-white/10 transition"
            onClick={() => setMobileOpen(false)}
          >
            {formatMenuLabel(item.name)}
          </Link>
        );
      }

      return (
        <div key={key} className="ml-2">
          <button
            type="button"
            className="w-full flex justify-between items-center px-2 py-2 text-left hover:bg-white/20 dark:hover:bg-white/10 transition"
            onClick={() =>
              setOpenMobile((p) => ({ ...p, [key]: !isOpen }))
            }
          >
            <span>{formatMenuLabel(item.name)}</span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isOpen && (
            <div className="ml-4 border-l border-white/20 transition-all duration-300">
              {item.children && renderMobileMenu(item.children, key)}
            </div>
          )}
        </div>
      );
    });

  return (
    <>
      {/* Header wrapper WITHOUT blur */}
      <header className="fixed top-0 left-0 w-full z-50">
        {/* Glass container (blur applied here) */}
        <div
          className={`transition-all duration-500 ${
            scrolled
              ? "bg-white/20 dark:bg-slate-900/30 backdrop-blur-xl backdrop-saturate-150 shadow-md"
              : "bg-white/0 backdrop-blur-0"
          }`}
        >
          <div
            className={`relative container mx-auto px-6 flex items-center justify-between transition-all duration-300 ${
              scrolled ? "h-16" : "h-20"
            }`}
          >
            <Link to="/">
              <AbvoltLogo className="w-40" />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-8 text-sm">
              {navItems.map((item) =>
                !item.children ? (
                  <Link
                    key={item.name}
                    to={item.path!}
                    className="hover:text-cyan-500 transition"
                  >
                    {formatMenuLabel(item.name)}
                  </Link>
                ) : (
                  <div
                    key={item.name}
                    className="relative"
                    onMouseEnter={() => setActiveMenu(item.name)}
                    onMouseLeave={() => setActiveMenu(null)}
                  >
                    <div className="flex items-center cursor-pointer">
                      {formatMenuLabel(item.name)}
                      <ChevronDown size={14} className="ml-1" />
                    </div>

                    {activeMenu === item.name && (
                      <div
                        className="absolute left-1/2 top-full -translate-x-1/2 min-w-[240px]
                          bg-slate-900/50
                          backdrop-blur-2xl backdrop-saturate-150
                          border border-white/20 dark:border-white/10
                          shadow-xl rounded-xl z-50"
                      >
                        <div className="py-2">
                          {renderDesktopMenu(item.children, "", "bg-slate-900/50")}
                        </div>
                      </div>
                    )}
                  </div>
                )
              )}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <button
                className="md:hidden"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden absolute top-full left-0 w-full
            bg-white/30 dark:bg-slate-900/40
            backdrop-blur-2xl backdrop-saturate-150
            border-t border-white/20
            shadow-xl
            transition-all duration-300 ${
              mobileOpen
                ? "opacity-100 max-h-screen"
                : "opacity-0 max-h-0 overflow-hidden"
            }`}
        >
          {renderMobileMenu(navItems)}
        </div>
      </header>

      {/* Spacer */}
      
    </>
  );
}
