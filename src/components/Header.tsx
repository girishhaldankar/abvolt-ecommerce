import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import AbvoltLogo from "./AbvoltLogo";
import { divisions } from "../data/divisions";
import { getEducationHeaderMenu, SubMenuItem } from "../data/adapters/educationHeaderAdapter";

interface ServiceMenu {
  title: string;
  items: SubMenuItem[];
}

// Dynamic services menu
const services: ServiceMenu[] = [
  {
    title: "Educational",
    items: getEducationHeaderMenu(), // generated from educationData
  },
  {
    title: "Industrial & Commercial",
    items: [
      { name: "Industrial Machines", path: "/industrial/machines" },
      { name: "Commercial Tools", path: "/industrial/tools" },
    ],
  },
  {
    title: "Training Services",
    items: [
      { name: "Vocational Training", path: "/training/vocational" },
      { name: "STEM Workshops", path: "/training/stem" },
    ],
  },
];

// Standard nav items
const navItems = [
  { name: "Home", path: "/" },
  ...divisions.map((d) => ({ name: d.title, path: d.path })),
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredService, setHoveredService] = useState(""); // desktop hover
  const [mobileServiceOpen, setMobileServiceOpen] = useState(""); // mobile main menu
  const [mobileSubOpen, setMobileSubOpen] = useState(""); // mobile nested submenu
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "auto";
  }, [mobileOpen]);

  // Render desktop dropdown
  const renderDesktopDropdown = (items: SubMenuItem[]) =>
    items.map((sub) =>
      sub.children ? (
        <div key={sub.name} className="group relative">
          <span className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-[var(--dropdown-hover-bg)] whitespace-nowrap">
  <span>{sub.name}</span>
  <ChevronDown size={12} className="ml-2 shrink-0" />
</span>

          <div className="absolute top-0 left-full ml-1 w-56 bg-[var(--page-bg)] text-[var(--page-text)] shadow-lg rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            {sub.children.map((child) => (
              <Link
                key={child.name}
                to={child.path || "#"}
                className="block px-4 py-2 hover:bg-[var(--dropdown-hover-bg)] hover:text-[var(--dropdown-hover-text)]"
              >
                {child.name}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <Link
          key={sub.name}
          to={sub.path || "#"}
          className="block px-4 py-2 hover:bg-[var(--dropdown-hover-bg)] hover:text-[var(--dropdown-hover-text)]"
        >
          {sub.name}
        </Link>
      )
    );

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[rgba(255,255,255,0.95)] dark:bg-[rgba(11,15,63,0.95)] backdrop-blur-lg shadow-md h-16 md:h-20"
          : "bg-transparent h-20 md:h-24"
      }`}
    >
      <div className="container mx-auto px-6 h-full flex items-center justify-between">
        <Link to="/">
          <AbvoltLogo className="w-44 h-auto" />
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex flex-1 justify-center">
          <nav className="flex space-x-8 items-center text-sm font-medium">
            {navItems.map((item) => {
              const dropdown = services.find(
                (s) => s.title.toLowerCase() === item.name.toLowerCase()
              );

              if (!dropdown) {
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="relative text-[var(--header-text)] hover:text-[var(--menu-hover-color)] transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                );
              }

              return (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => setHoveredService(item.name)}
                  onMouseLeave={() => setHoveredService("")}
                >
                  <span className="flex items-center cursor-pointer text-[var(--header-text)]">
                    {item.name} <ChevronDown size={14} className="ml-1" />
                  </span>

                  {/* Dropdown Panel */}
                  <div
                    className={`absolute left-1/2 -translate-x-1/2 top-full mt-2 min-w-[220px] bg-[rgba(var(--page-bg-rgb),0.95)] text-[var(--page-text)] backdrop-blur-md shadow-lg rounded-md transition-all duration-300 z-50 ${
                      hoveredService === item.name
                        ? "opacity-100 visible scale-100"
                        : "opacity-0 invisible scale-95"
                    }`}
                  >
                    {renderDesktopDropdown(dropdown.items)}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* RIGHT SIDE BUTTONS */}
        <div className="flex items-center space-x-4">
          <ThemeToggle />

          <button
            className="md:hidden text-[var(--header-text)]"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="md:hidden bg-[rgba(var(--page-bg-rgb),0.95)] backdrop-blur-lg shadow-xl px-6 py-4">
          {navItems.map((item) => {
            const dropdown = services.find(
              (s) => s.title.toLowerCase() === item.name.toLowerCase()
            );

            if (!dropdown) {
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className="block py-2 text-[var(--header-text)]"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.name}
                </Link>
              );
            }

            return (
              <div key={item.name} className="py-2">
                <div
                  className="flex justify-between items-center cursor-pointer text-[var(--header-text)]"
                  onClick={() =>
                    setMobileServiceOpen(
                      mobileServiceOpen === item.name ? "" : item.name
                    )
                  }
                >
                  <span>{item.name}</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      mobileServiceOpen === item.name ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {mobileServiceOpen === item.name && (
                  <div className="ml-4 mt-2 space-y-1">
                    {dropdown.items.map((sub) => (
                      <div key={sub.name}>
                        {sub.children ? (
                          <>
                            <div
                              className="flex justify-between items-center cursor-pointer px-2 py-1 hover:bg-[var(--dropdown-hover-bg)]"
                              onClick={() =>
                                setMobileSubOpen(
                                  mobileSubOpen === sub.name ? "" : sub.name
                                )
                              }
                            >
                              <span>{sub.name}</span>
                              <ChevronDown
                                size={14}
                                className={`transition-transform ${
                                  mobileSubOpen === sub.name ? "rotate-180" : ""
                                }`}
                              />
                            </div>
                            {mobileSubOpen === sub.name &&
                              sub.children.map((child) => (
                                <Link
                                  key={child.name}
                                  to={child.path || "#"}
                                  className="block px-4 py-1 text-sm hover:bg-[var(--dropdown-hover-bg)]"
                                  onClick={() => setMobileOpen(false)}
                                >
                                  {child.name}
                                </Link>
                              ))}
                          </>
                        ) : (
                          <Link
                            key={sub.name}
                            to={sub.path || "#"}
                            className="block px-4 py-1 text-sm hover:bg-[var(--dropdown-hover-bg)]"
                            onClick={() => setMobileOpen(false)}
                          >
                            {sub.name}
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </header>
  );
}
