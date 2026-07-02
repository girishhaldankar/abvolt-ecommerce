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

  const formatMenuLabel = (text: string) =>
    text.charAt(0).toUpperCase() + text.slice(1);

  /* ---------------- ICON HELPER ---------------- */
  const getIconComponent = (iconString?: string): any => {
    if (!iconString) return "📋";

    if (iconString.length <= 2) return iconString;

    try {
      const emojiRegex = /^[\p{Emoji}\s]+$/u;
      if (emojiRegex.test(iconString)) return iconString;
    } catch {}

    return (LucideIcons as any)[iconString] || "📋";
  };

  export function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [navItems, setNavItems] = useState<MenuItem[]>([]);

    const [level1, setLevel1] = useState<any>(null);
    const [level2, setLevel2] = useState<any>(null);
    const [level3, setLevel3] = useState<any>(null);

    const [hoverTimeout, setHoverTimeout] = useState<any>(null);

    useEffect(() => {
      const onScroll = () => setScrolled(window.scrollY > 50);
      window.addEventListener("scroll", onScroll);
      return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
      document.body.style.overflow = mobileOpen ? "hidden" : "auto";
    }, [mobileOpen]);

    useEffect(() => {
      getAllDivisions().then((divisions: any[]) => {
        const divisionMenus: MenuItem[] = divisions.map((div) => ({
          name: div.title,
          children: div.audiences.map((aud: any) => ({
            name: aud.title,
            icon: aud.icon,
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

    const renderMobileMenu = (items: MenuItem[]) =>
      items.map((item, idx) => {
        if (!item.children && item.path) {
          return (
            <Link
              key={idx}
              to={item.path}
              className="block py-3 px-4 text-base text-white hover:bg-white/10"
              onClick={() => setMobileOpen(false)}
            >
              {formatMenuLabel(item.name)}
            </Link>
          );
        }

        return (
          <details key={idx} className="border-b border-white/10">
            <summary className="py-3 px-4 cursor-pointer text-white">
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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"></div>
        )}

        <header className="fixed top-0 left-0 w-full z-50">
          <div
            className={`transition-all duration-500 ${
              scrolled
                ? "bg-white/70 dark:bg-slate-900/30 backdrop-blur-xl shadow-md"
                : ""
            }`}
          >
            <div className="container mx-auto px-6 flex items-center justify-between h-16">
              <Link to="/">
                <AbvoltLogo className="w-36" />
              </Link>

              {/* ================= DESKTOP ================= */}
              <nav className="hidden md:flex items-center space-x-8 text-sm relative z-50">
                {navItems.map((item) =>
                  !item.children ? (
                    <Link
                      key={item.name}
                      to={item.path!}
                      className="flex items-center h-16 relative group 
                      text-gray-800 dark:text-white/80 
                      hover:text-cyan-500 transition"
                    >
                      <span>{formatMenuLabel(item.name)}</span>

                      <span className="absolute left-0 bottom-3 h-[2px] w-0 bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                  ) : (
                    <div
                      key={item.name}
                      className="group flex items-center h-16"
                      onMouseEnter={() => {
                        clearTimeout(hoverTimeout);
                        setActiveMenu(item.name);
                        setLevel1(item.children?.[0]);
                        setLevel2(item.children?.[0]?.children?.[0]);
                        setLevel3(null);
                      }}
                      onMouseLeave={() => {
                        const t = setTimeout(() => setActiveMenu(null), 150);
                        setHoverTimeout(t);
                      }}
                    >
                      {/* TOP */}
                      <div
                        className={`flex items-center h-16 cursor-pointer relative group transition ${
                          activeMenu === item.name
                            ? "text-cyan-500 drop-shadow-[0_0_6px_rgba(34,211,238,0.6)]"
                            : "text-gray-800 dark:text-white/80 hover:text-cyan-500"
                        }`}
                      >
                        <span className="flex items-center">
                          {formatMenuLabel(item.name)}
                          <ChevronDown size={14} className="ml-1 mt-[1px]" />
                        </span>

                        <span
                          className={`absolute left-0 bottom-3 h-[2px] bg-cyan-400 transition-all duration-300 ${
                            activeMenu === item.name
                              ? "w-full"
                              : "w-0 group-hover:w-full"
                          }`}
                        />
                      </div>

                      {/* 🔥 MEGA MENU — UNCHANGED */}
                      <div
                        className={`absolute left-0 top-full mt-4
                        w-[950px] max-w-[calc(100vw-2rem)] max-h-[80vh]
                        bg-slate-900/95 backdrop-blur-2xl rounded-xl shadow-2xl p-6
                        overflow-visible
                        transition-all duration-300 ${
                          activeMenu === item.name
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-2 pointer-events-none"
                        }`}
                      >
                        <div className="grid grid-cols-3 gap-6 px-2">

                          {/* LEVEL 1 */}
                          <div className="pl-2 pr-4 border-r border-white/10 max-h-[70vh] overflow-y-auto custom-scroll pb-6">
                            <h4 className="text-xs uppercase text-white/60 mb-4">
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
                                  className={`flex items-center gap-3 px-3 py-2 rounded transition-all cursor-pointer ${
                                    level1?.name === lvl1.name
                                      ? "bg-white/15 text-white shadow-[0_0_8px_rgba(34,211,238,0.3)]"
                                      : "hover:bg-white/5 text-white/80"
                                  }`}
                                >
                                  <div className="w-5 h-5 flex items-center justify-center">
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
                          <div className="pl-2 pr-4 border-r border-white/10 max-h-[70vh] overflow-y-auto custom-scroll pb-6">
                            <h4 className="text-xs uppercase text-white/60 mb-4">
                              Streams
                            </h4>

                            {level1?.children?.map((lvl2: any, i: number) => (
                              <div
                                key={i}
                                onMouseEnter={() => {
                                  setLevel2(lvl2);
                                  setLevel3(null);
                                }}
                                className={`flex items-center gap-2 px-3 py-2 rounded transition-all cursor-pointer ${
                                  level2?.name === lvl2.name
                                    ? "bg-white/15 text-white shadow-[0_0_8px_rgba(34,211,238,0.3)]"
                                    : "hover:bg-white/5 text-white/80"
                                }`}
                              >
                                <span className="w-[3px] h-4 bg-cyan-400 opacity-70"></span>
                                {lvl2.name}
                              </div>
                            ))}
                          </div>

                          {/* LEVEL 3 */}
                          <div className="pl-2 pr-4 max-h-[70vh] overflow-y-auto overflow-x-hidden custom-scroll pb-6">
                            <h4 className="text-xs uppercase text-white/60 mb-4">
                              Categories
                            </h4>

                            {level2?.children?.map((lvl3: any, i: number) => (
                              <Link
                                key={i}
                                to={lvl3.path}
                                onMouseEnter={() => setLevel3(lvl3)}
                                className={`flex items-center gap-2 px-3 py-2 rounded transition-all ${
                                  level3?.name === lvl3.name
                                    ? "bg-white/15 text-white shadow-[0_0_10px_rgba(34,211,238,0.4)]"
                                    : "text-white/80 hover:text-white hover:bg-white/10"
                                }`}
                              >
                                <span className="w-[3px] h-4 bg-cyan-400 opacity-70"></span>
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

              {/* RIGHT */}
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

          {/* MOBILE */}
          <div
            className={`fixed top-0 left-0 h-full w-full bg-slate-900 z-50
            transition-transform duration-300 ${
              mobileOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <span className="font-semibold text-white">Menu</span>
              <X className="text-white" onClick={() => setMobileOpen(false)} />
            </div>

            <div className="overflow-y-auto h-full pb-20">
              {renderMobileMenu(navItems)}
            </div>
          </div>
        </header>
      </>
    );
  }