
import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import AbvoltLogo from "./AbvoltLogo";
import { getAllDivisions } from "../services/divisions.service";

interface MenuItem {
  name: string;
  icon?: string;
  path?: string;
  children?: MenuItem[];
}

interface HeaderProps {
  forceScrolled?: boolean;
}

const formatMenuLabel = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);

/* ---------------- ICON HELPER ---------------- */
const getIconComponent = (iconString?: string): any => {
  if (!iconString) return "📋";

  if (iconString.length <= 2) return iconString;

  try {
    const emojiRegex = /^[\p{Emoji}\s]+$/u;
    if (emojiRegex.test(iconString)) return iconString;
  } catch {
    // Continue to Lucide icon lookup.
  }

  return (LucideIcons as any)[iconString] || "📋";
};

export function Header({ forceScrolled = false }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [navItems, setNavItems] = useState<MenuItem[]>([]);

  const [level1, setLevel1] = useState<any>(null);
  const [level2, setLevel2] = useState<any>(null);
  const [level3, setLevel3] = useState<any>(null);

  const [hoverTimeout, setHoverTimeout] = useState<any>(null);

  // Preserve the normal scroll behavior on every page.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);

    window.addEventListener("scroll", onScroll);

    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Category pages can show the scrolled header immediately.
  const isScrolled = forceScrolled || scrolled;

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mobileOpen]);

  useEffect(() => {
    getAllDivisions()
      .then((divisions: any[]) => {
        const divisionMenus: MenuItem[] = divisions.map((div) => ({
          name: div.title,
          children: (div.audiences || []).map((aud: any) => ({
            name: aud.title,
            icon: aud.icon,
            children: (aud.streams || []).map((stream: any) => ({
              name: stream.title,
              children: (stream.categories || []).map((cat: any) => ({
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
      })
      .catch((error) => {
        console.error("Failed to load navigation:", error);
      });
  }, []);

  const renderMobileMenu = (items: MenuItem[]) =>
    items.map((item, idx) => {
      if (!item.children && item.path) {
        return (
          <Link
            key={`${item.name}-${idx}`}
            to={item.path}
            className="block px-4 py-3 text-base text-white hover:bg-white/10"
            onClick={() => setMobileOpen(false)}
          >
            {formatMenuLabel(item.name)}
          </Link>
        );
      }

      return (
        <details key={`${item.name}-${idx}`} className="border-b border-white/10">
          <summary className="cursor-pointer px-4 py-3 text-white">
            {formatMenuLabel(item.name)}
          </summary>

          <div className="ml-4">
            {item.children && renderMobileMenu(item.children)}
          </div>
        </details>
      );
    });

  return (
    <>
      {activeMenu && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
      )}

      <header className="fixed left-0 top-0 z-50 w-full">
        <div
          className={`transition-all duration-500 ${
            isScrolled
              ? "bg-white/90 shadow-md backdrop-blur-xl dark:bg-slate-900/90"
              : ""
          }`}
        >
          <div className="container mx-auto flex h-16 items-center justify-between px-6">
            <Link to="/">
              <AbvoltLogo className="w-36" />
            </Link>

            {/* ================= DESKTOP NAVIGATION ================= */}
            <nav className="relative z-50 hidden items-center space-x-8 text-sm md:flex">
              {navItems.map((item) =>
                !item.children ? (
                  <Link
                    key={item.name}
                    to={item.path!}
                    className="group relative flex h-16 items-center text-gray-800 transition hover:text-cyan-500 dark:text-white/80"
                  >
                    <span>{formatMenuLabel(item.name)}</span>

                    <span className="absolute bottom-3 left-0 h-[2px] w-0 bg-cyan-400 transition-all duration-300 group-hover:w-full" />
                  </Link>
                ) : (
                  <div
                    key={item.name}
                    className="group flex h-16 items-center"
                    onMouseEnter={() => {
                      clearTimeout(hoverTimeout);
                      setActiveMenu(item.name);
                      setLevel1(item.children?.[0]);
                      setLevel2(item.children?.[0]?.children?.[0]);
                      setLevel3(null);
                    }}
                    onMouseLeave={() => {
                      const timeout = setTimeout(
                        () => setActiveMenu(null),
                        150
                      );
                      setHoverTimeout(timeout);
                    }}
                  >
                    {/* TOP MENU ITEM */}
                    <div
                      className={`relative flex h-16 cursor-pointer items-center transition ${
                        activeMenu === item.name
                          ? "text-cyan-500 drop-shadow-[0_0_6px_rgba(34,211,238,0.6)]"
                          : "text-gray-800 hover:text-cyan-500 dark:text-white/80"
                      }`}
                    >
                      <span className="flex items-center">
                        {formatMenuLabel(item.name)}
                        <ChevronDown size={14} className="ml-1 mt-[1px]" />
                      </span>

                      <span
                        className={`absolute bottom-3 left-0 h-[2px] bg-cyan-400 transition-all duration-300 ${
                          activeMenu === item.name
                            ? "w-full"
                            : "w-0 group-hover:w-full"
                        }`}
                      />
                    </div>

                    {/* MEGA MENU */}
                    <div
                      className={`absolute left-0 top-full mt-4 max-h-[80vh] w-[950px] max-w-[calc(100vw-2rem)] overflow-visible rounded-xl bg-slate-900/95 p-6 shadow-2xl backdrop-blur-2xl transition-all duration-300 ${
                        activeMenu === item.name
                          ? "translate-y-0 opacity-100"
                          : "pointer-events-none translate-y-2 opacity-0"
                      }`}
                    >
                      <div className="grid grid-cols-3 gap-6 px-2">
                        {/* LEVEL 1 */}
                        <div className="custom-scroll max-h-[70vh] overflow-y-auto border-r border-white/10 pb-6 pl-2 pr-4">
                          <h4 className="mb-4 text-xs uppercase text-white/60">
                            Audiences
                          </h4>

                          {item.children?.map((lvl1: any, i: number) => {
                            const Icon = getIconComponent(lvl1.icon);

                            return (
                              <div
                                key={i}
                                onMouseEnter={() => {
                                  setLevel1(lvl1);
                                  setLevel2(lvl1.children?.[0]);
                                  setLevel3(null);
                                }}
                                className={`flex cursor-pointer items-center gap-3 rounded px-3 py-2 transition-all ${
                                  level1?.name === lvl1.name
                                    ? "bg-white/15 text-white shadow-[0_0_8px_rgba(34,211,238,0.3)]"
                                    : "text-white/80 hover:bg-white/5"
                                }`}
                              >
                                <div className="flex h-5 w-5 items-center justify-center">
                                  {typeof Icon === "string" ? (
                                    <span>{Icon}</span>
                                  ) : (
                                    <Icon size={16} />
                                  )}
                                </div>

                                {lvl1.name}
                              </div>
                            );
                          })}
                        </div>

                        {/* LEVEL 2 */}
                        <div className="custom-scroll max-h-[70vh] overflow-y-auto border-r border-white/10 pb-6 pl-2 pr-4">
                          <h4 className="mb-4 text-xs uppercase text-white/60">
                            Streams
                          </h4>

                          {level1?.children?.map((lvl2: any, i: number) => (
                            <div
                              key={i}
                              onMouseEnter={() => {
                                setLevel2(lvl2);
                                setLevel3(null);
                              }}
                              className={`flex cursor-pointer items-center gap-2 rounded px-3 py-2 transition-all ${
                                level2?.name === lvl2.name
                                  ? "bg-white/15 text-white shadow-[0_0_8px_rgba(34,211,238,0.3)]"
                                  : "text-white/80 hover:bg-white/5"
                              }`}
                            >
                              <span className="h-4 w-[3px] bg-cyan-400 opacity-70" />
                              {lvl2.name}
                            </div>
                          ))}
                        </div>

                        {/* LEVEL 3 */}
                        <div className="custom-scroll max-h-[70vh] overflow-x-hidden overflow-y-auto pb-6 pl-2 pr-4">
                          <h4 className="mb-4 text-xs uppercase text-white/60">
                            Categories
                          </h4>

                          {level2?.children?.map((lvl3: any, i: number) => (
                            <Link
                              key={i}
                              to={lvl3.path}
                              onMouseEnter={() => setLevel3(lvl3)}
                              className={`flex items-center gap-2 rounded px-3 py-2 transition-all ${
                                level3?.name === lvl3.name
                                  ? "bg-white/15 text-white shadow-[0_0_10px_rgba(34,211,238,0.4)]"
                                  : "text-white/80 hover:bg-white/10 hover:text-white"
                              }`}
                            >
                              <span className="h-4 w-[3px] bg-cyan-400 opacity-70" />
                              {lvl3.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </nav>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-4">
              <ThemeToggle />

              <button
                type="button"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                className="md:hidden"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU */}
        <div
          className={`fixed left-0 top-0 z-50 h-full w-full bg-slate-900 transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <span className="font-semibold text-white">Menu</span>

            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            >
              <X className="text-white" />
            </button>
          </div>

          <div className="h-full overflow-y-auto pb-20">
            {renderMobileMenu(navItems)}
          </div>
        </div>
      </header>
    </>
  );
}
