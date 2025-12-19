import { Link } from "react-router-dom";
import { Book, Factory, GraduationCap, Wrench, ShoppingBag } from "lucide-react";

const sections = [
  { title: "Educational", icon: Book, description: "Courses, Workshops", color: "from-cyan-500 to-blue-500", link: "/educational" },
  { title: "Industrial & Commercial", icon: Factory, description: "Solutions & Services", color: "from-blue-500 to-indigo-500", link: "/industrial" },
  { title: "Trainings", icon: GraduationCap, description: "Skill Development", color: "from-indigo-500 to-purple-500", link: "/trainings" },
  { title: "Services", icon: Wrench, description: "Technical Assistance", color: "from-purple-500 to-pink-500", link: "/services" },
  { title: "Online Shop", icon: ShoppingBag, description: "Products & Tools", color: "from-pink-500 to-rose-500", link: "/shop" },
];

export default function MainSections() {
  return (
    <section className="app-section ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        
        {/* Section Header */}
        <header className="text-center mb-14 space-y-4">
          <h2 className="text-[var(--hero-text)] text-2xl sm:text-3xl md:text-4xl font-display leading-tight">
            Explore Our Divisions
          </h2>
          <p className="text-[var(--category-subtext)] max-w-2xl mx-auto text-sm sm:text-base md:text-lg font-sans">
            Discover our services, training programs, and online shop offerings designed for your needs.
          </p>
        </header>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {sections.map((item) => {
            const Icon = item.icon;

            return (
              <Link key={item.title} to={item.link} className="group relative">
                <div
                  className={`
                    relative h-full rounded-xl p-4 sm:p-6 overflow-hidden
                    cursor-pointer
                    bg-[var(--category-card-bg)]
                    border border-[var(--category-border)]
                    transition-all duration-300
                    hover:scale-[1.04]
                    hover:shadow-[0_12px_32px_var(--category-card-shadow)]
                  `}
                >
                  {/* Hover Gradient */}
                  <div
                    className={`
                      absolute inset-0 rounded-xl
                      bg-gradient-to-br ${item.color}
                      opacity-[var(--category-hover-gradient-opacity)]
                      group-hover:opacity-[calc(var(--category-hover-gradient-opacity)*5)]
                      transition-opacity duration-300
                    `}
                  />

                  {/* Icon */}
                  <div className="relative mb-4 flex justify-center">
                    <div
                      className={`
                        w-11 h-11 sm:w-14 sm:h-14 rounded-xl
                        bg-gradient-to-br ${item.color}
                        p-0.5
                        transition-transform duration-300
                        group-hover:scale-110
                      `}
                    >
                      <div className="w-full h-full rounded-xl bg-[var(--category-card-bg)] flex items-center justify-center">
                        <Icon className="w-5 h-5 sm:w-7 sm:h-7 text-[var(--category-text)]" />
                      </div>
                    </div>
                  </div>

                  {/* Text */}
                  <div className="relative z-10 text-center space-y-1.5">
                    <h3
                      className="text-[var(--category-text)] text-sm sm:text-base font-semibold transition-colors group-hover:text-[var(--category-hover-text)]"
                    >
                      {item.title}
                    </h3>
                    <p className="text-[var(--category-subtext)] text-xs sm:text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Corner Accent */}
                <span
                  className="
                    pointer-events-none
                    absolute top-2 right-2
                    w-5 h-5 sm:w-6 sm:h-6
                    border-t-2 border-r-2
                    rounded-tr-xl
                    border-[var(--category-corner-accent)]
                    transition-colors duration-300
                    group-hover:border-[var(--category-corner-accent-hover)]
                  "
                />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
