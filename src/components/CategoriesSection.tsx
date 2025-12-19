import {
  Cpu,
  Radio,
  Battery,
  Cog,
  Zap,
  Wifi,
  Bot,
  Wrench,
  Box,
  Monitor,
  Smartphone,
  Cable,
  Settings,
  Plane,
  Plug,
} from "lucide-react";

/* -----------------------------------------------------------
   CATEGORY DATA
----------------------------------------------------------- */
const categories = [
  {
    name: "Development Boards",
    description: "Arduino, Raspberry Pi",
    icon: Cpu,
    color: "from-cyan-500 to-blue-500",
  },
  {
    name: "Sensors",
    description: "Motion, Temperature, Distance",
    icon: Radio,
    color: "from-blue-500 to-indigo-500",
  },
  {
    name: "Battery & Power",
    description: "Li-ion, 18650, BMS",
    icon: Battery,
    color: "from-indigo-500 to-purple-500",
  },
  {
    name: "Motors & Drivers",
    description: "DC, Stepper, ESCs",
    icon: Cog,
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "Components",
    description: "Resistors, ICs, Connectors",
    icon: Zap,
    color: "from-pink-500 to-rose-500",
  },
  {
    name: "Wireless Modules",
    description: "WiFi, Bluetooth, LoRa",
    icon: Wifi,
    color: "from-rose-500 to-orange-500",
  },
  {
    name: "Robotics Parts",
    description: "Wheels, Chassis, Gears",
    icon: Bot,
    color: "from-orange-500 to-amber-500",
  },
  {
    name: "Tools & Accessories",
    description: "Soldering, Multimeters",
    icon: Wrench,
    color: "from-amber-500 to-yellow-500",
  },
  {
    name: "3D Printing",
    description: "Filaments, Nozzles",
    icon: Box,
    color: "from-yellow-500 to-lime-500",
  },
  {
    name: "Displays & Screens",
    description: "OLED, LCD, TFT",
    icon: Monitor,
    color: "from-lime-500 to-green-500",
  },
  {
    name: "IoT Modules",
    description: "ESP32, NodeMCU",
    icon: Smartphone,
    color: "from-green-500 to-emerald-500",
  },
  {
    name: "Cables & Connectors",
    description: "JST, Jumper Wires",
    icon: Cable,
    color: "from-emerald-500 to-teal-500",
  },
  {
    name: "Mechanical Parts",
    description: "Aluminium, Mounts",
    icon: Settings,
    color: "from-teal-500 to-cyan-500",
  },
  {
    name: "Drone Parts",
    description: "Propellers, Controllers",
    icon: Plane,
    color: "from-cyan-500 to-sky-500",
  },
  {
    name: "Power Supplies",
    description: "SMPS, Adapters",
    icon: Plug,
    color: "from-sky-500 to-blue-500",
  },
];

/* -----------------------------------------------------------
   COMPONENT
----------------------------------------------------------- */
export function CategoriesSection() {
  return (
    <section className="app-section special">
  <div className="max-w-7xl mx-auto px-4">
    <header className="section-header text-center mb-8">
      <h2 className="section-title text-3xl md:text-4xl">
        Our Categories
      </h2>
      <p className="section-desc mt-3">
        Browse premium electronic components and hardware solutions.
      </p>
    </header>

        {/* Category Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <div
                key={category.name}
                className="group relative"
                aria-label={category.name}
              >
                {/* Card */}
                <div
                  className="
                    relative h-full rounded-xl p-4 sm:p-6 overflow-hidden
                    cursor-pointer
                    bg-[var(--category-card-bg)]
                    border border-[var(--category-border)]
                    transition-all duration-300
                    hover:scale-[1.04]
                    hover:shadow-[0_12px_32px_var(--category-card-shadow)]
                  "
                >
                  {/* Hover Gradient */}
                  <div
                    className={`
                      absolute inset-0 rounded-xl
                      bg-gradient-to-br ${category.color}
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
                        bg-gradient-to-br ${category.color}
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
                      className="
                        text-[var(--category-text)]
                        text-sm sm:text-base
                        font-semibold
                        transition-colors
                        group-hover:text-[var(--category-hover-text)]
                      "
                    >
                      {category.name}
                    </h3>

                    <p className="text-[var(--category-subtext)] text-xs sm:text-sm leading-relaxed">
  {category.description}
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
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
