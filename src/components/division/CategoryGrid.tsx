import { Link } from "react-router-dom";

interface CategoryCardProps {
  category: {
    id: string;
    title: string;
    description?: string;
    icon?: any;
    color: string;
  };
  divisionId: string;
}

export default function CategoryCard({
  category,
  divisionId,
}: CategoryCardProps) {
  const Icon = category.icon;

  return (
    <Link
      to={`/${divisionId}/${category.id}`}
      className="group card card-hover
                 flex flex-col items-center justify-center text-center
                 p-6 cursor-pointer"
    >
      {/* Hover Gradient Overlay */}
      <div
        className={`card-overlay bg-gradient-to-br ${category.color}`}
      />

      {/* Icon */}
      {Icon && (
        <div className="relative z-10 mb-4">
          <div
            className={`card-icon-wrap bg-gradient-to-br ${category.color}`}
          >
            <div className="card-icon-inner">
              <Icon className="w-5 h-5 sm:w-7 sm:h-7 text-[var(--category-text)]" />
            </div>
          </div>
        </div>
      )}

      {/* Text */}
      <div className="relative z-10 space-y-1.5">
        <h3 className="card-title text-sm sm:text-base">
          {category.title}
        </h3>

        {category.description && (
          <p className="card-desc text-xs sm:text-sm">
            {category.description}
          </p>
        )}
      </div>

      {/* Corner Accent */}
      <span className="card-corner" />
    </Link>
  );
}
