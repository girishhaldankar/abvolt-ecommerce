import { Link } from "react-router-dom";

interface Division {
  id: string;
  type: "internal" | "shop";
  title: string;
  description: string;
  path: string;
  icon: any;
  color: string;
}

interface DivisionCardProps {
  division: Division;
}

export default function DivisionCard({ division }: DivisionCardProps) {
  const Icon = division.icon;

  return (
    <Link
      to={division.path}
      className="group relative p-6 rounded-xl overflow-hidden cursor-pointer
                 bg-[var(--category-card-bg)] border border-[var(--category-border)]
                 flex flex-col items-center justify-center text-center
                 transition-all duration-300 hover:scale-[1.04]
                 hover:shadow-[0_12px_32px_var(--category-card-shadow)]"
    >
      {/* Hover Gradient */}
      <div
        className={`absolute inset-0 rounded-xl
                    bg-gradient-to-br ${division.color}
                    opacity-[var(--category-hover-gradient-opacity)]
                    group-hover:opacity-[calc(var(--category-hover-gradient-opacity)*5)]
                    transition-opacity duration-300`}
      />

      {/* Icon */}
      <div className="relative mb-4 z-10">
        <div
          className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl
                      bg-gradient-to-br ${division.color} p-0.5
                      transition-transform duration-300
                      group-hover:scale-110`}
        >
          <div className="w-full h-full rounded-xl bg-[var(--category-card-bg)]
                          flex items-center justify-center">
            <Icon className="w-5 h-5 sm:w-7 sm:h-7 text-[var(--category-text)]" />
          </div>
        </div>
      </div>

      {/* Text */}
      <div className="relative z-10 space-y-1.5">
        <h3 className="text-[var(--category-text)] text-sm sm:text-base font-semibold">
          {division.title}
        </h3>
        <p className="text-[var(--category-subtext)] text-xs sm:text-sm leading-relaxed">
          {division.description}
        </p>
      </div>

      {/* Corner Accent */}
      <span
        className="pointer-events-none absolute top-2 right-2 w-5 h-5 sm:w-6 sm:h-6
                   border-t-2 border-r-2 rounded-tr-xl
                   border-[var(--category-corner-accent)]
                   group-hover:border-[var(--category-corner-accent-hover)]
                   transition-colors"
      />
    </Link>
  );
}
