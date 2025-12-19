import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

interface SubMenuItem {
  name: string;
  path: string;
}

interface ServiceMenu {
  title: string;
  items: SubMenuItem[];
}

/* ---------------------------------------------------
   TOP MENU
----------------------------------------------------- */
const navItems = [
  { name: "Home", path: "/" },
  { name: "Shop", path: "/shop" },

  // DROPDOWN MENUS
  { name: "Educational", type: "educational" },
  { name: "Industrial & Commercial", type: "industrial" },
  { name: "Training Services", type: "training" },

  { name: "Services", path: "/services" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

/* ---------------------------------------------------
   DROPDOWN MENU DATA
----------------------------------------------------- */
const services: ServiceMenu[] = [
  {
    title: "Educational",
    items: [
      { name: "Basic Electronics Products", path: "/educational/basic-electronics" },
      { name: "Basic Science", path: "/educational/basic-science" },
      { name: "Decade Boxes", path: "/educational/decade-boxes" },
      { name: "Digital Communication", path: "/educational/digital-communication" },
      { name: "Digital Electronics", path: "/educational/digital-electronics" },
      { name: "Discovery Series", path: "/educational/discovery-series" },
      { name: "Electrical Engineering Products", path: "/educational/electrical-engineering" },
      { name: "Embedded System Solutions", path: "/educational/embedded-systems" },
      { name: "Engineering & Vocational Products", path: "/educational/engineering-vocational" },
      { name: "Instrumentation & Control", path: "/educational/instrumentation-control" },
      { name: "Mechanical Engineering", path: "/educational/mechanical-engineering" },
      { name: "Microwave Lab", path: "/educational/microwave-lab" },
      { name: "Physics", path: "/educational/physics" },
      { name: "Power Electronics", path: "/educational/power-electronics" },
      { name: "Robotics", path: "/educational/robotics" },
      { name: "STEM", path: "/educational/stem" },
    ],
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

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredService, setHoveredService] = useState("");

  // Scroll detection for header background
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mobileOpen]);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500
        ${scrolled
          ? "bg-[rgba(255,255,255,0.95)] dark:bg-[rgba(11,15,63,0.95)] backdrop-blur-lg shadow-md py-3 md:py-4"
          : "bg-transparent py-4 md:py-5"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">

        {/* LOGO */}
        <Link
          to="/"
          className="text-2xl font-bold text-[var(--header-text)] whitespace-nowrap"
        >
          Logo
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

  {/* Animated underline */}
  <span
    className={`
      absolute left-0 -bottom-1 h-[2px] w-full
      bg-green-500
      transform scale-x-0 origin-left
      transition-transform duration-300
      ${location.pathname === item.path ? "scale-x-100" : "hover:scale-x-100"}
    `}
  />
</Link>

                );
              }

              // Dropdown menu
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
                    className={`absolute left-1/2 -translate-x-1/2 top-full mt-2 w-60
                      bg-[rgba(var(--page-bg-rgb),0.95)] text-[var(--page-text)]
                      backdrop-blur-md shadow-lg rounded-md transition-all duration-300 z-50
                      ${hoveredService === item.name ? "opacity-100 visible scale-100" : "opacity-0 invisible scale-95"}`}
                    style={{ boxShadow: "0 10px 25px rgba(0,0,0,0.1), 0 0 30px rgba(0,255,255,0.1)" }}
                  >
                    {dropdown.items.map((sub) => (
                      <Link
                        key={sub.name}
                        to={sub.path}
                        className="block px-4 py-2 text-sm transition-colors duration-200
                                   hover:bg-[var(--dropdown-hover-bg)]
                                   hover:text-[var(--dropdown-hover-text)]"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* RIGHT SIDE BUTTONS */}
        <div className="flex items-center space-x-4">
          <ThemeToggle />

          {/* MOBILE MENU BUTTON */}
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
                    setHoveredService(hoveredService === item.name ? "" : item.name)
                  }
                >
                  <span className="text-[var(--header-text)]">{item.name}</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${hoveredService === item.name ? "rotate-180" : ""}`}
                  />
                </div>

                {hoveredService === item.name && (
                  <div className="ml-4 mt-2 text-[var(--header-text)]">
                    {dropdown.items.map((sub) => (
                      <Link
                        key={sub.name}
                        to={sub.path}
                        className="block py-1 text-sm transition-colors duration-200
                                   hover:bg-[var(--dropdown-hover-bg)]
                                   hover:text-[var(--dropdown-hover-text)]"
                        onClick={() => setMobileOpen(false)}
                      >
                        {sub.name}
                      </Link>
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
