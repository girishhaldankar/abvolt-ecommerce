import { useNavigate } from "react-router-dom";

interface CategoryCardProps {
  title: string;
  description?: string;
  icon: React.ElementType;
  color: string; // ex: "from-cyan-500 to-blue-500"
  path: string;
}

const CategoryCard = ({
  title,
  description,
  icon: Icon,
  color,
  path,
}: CategoryCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(path)}
      className="group relative cursor-pointer"
      aria-label={title}
    >
      {/* Card */}
      <div
        className="
          relative h-full rounded-xl p-5 sm:p-6 overflow-hidden
          bg-[var(--category-card-bg)]
          border border-[var(--category-border)]
          transition-all duration-300
          hover:scale-[1.04]
          hover:shadow-[0_12px_32px_var(--category-card-shadow)]
          text-center
        "
      >
        {/* Hover Gradient Overlay */}
        <div
          className={`
            absolute inset-0 rounded-xl
            bg-gradient-to-br ${color}
            opacity-[var(--category-hover-gradient-opacity)]
            group-hover:opacity-[calc(var(--category-hover-gradient-opacity)*5)]
            transition-opacity duration-300
          `}
        />

        {/* Icon */}
        <div className="relative mb-4 flex justify-center">
          <div
            className={`
              w-12 h-12 sm:w-14 sm:h-14 rounded-xl
              bg-gradient-to-br ${color}
              p-0.5
              transition-transform duration-300
              group-hover:scale-110
            `}
          >
            <div className="w-full h-full rounded-xl bg-[var(--category-card-bg)] flex items-center justify-center">
              <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--category-text)]" />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="relative z-10 space-y-1.5">
          <h3
            className="
              text-[var(--category-text)]
              text-sm sm:text-base
              font-semibold
              transition-colors
              group-hover:text-[var(--category-hover-text)]
            "
          >
            {title}
          </h3>

          {description && (
            <p className="text-[var(--category-subtext)] text-xs sm:text-sm leading-relaxed">
              {description}
            </p>
          )}
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
};

export default CategoryCard;
