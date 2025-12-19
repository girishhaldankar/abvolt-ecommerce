import { Link } from "react-router-dom";

interface ExperimentCardProps {
  id: number;
  title: string;
  code: string;
  description: string;
  image: string;
}

const ExperimentCard = ({
  id,
  title,
  code,
  description,
  image,
}: ExperimentCardProps) => {
  return (
    <div
      className="
        group
        rounded-xl
        border border-[var(--category-border)]
        bg-[var(--category-card-bg)]
        overflow-hidden
        transition-all duration-300
        hover:scale-[1.02]
        hover:shadow-[0_12px_32px_var(--category-card-shadow)]
      "
    >
      {/* Image */}
      <div className="aspect-[4/3] bg-black/20">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-5 space-y-2">
        <h3 className="text-sm font-semibold text-white">
          {title}
        </h3>

        <p className="text-xs text-white/60">{code}</p>

        <p className="text-sm text-white/70 line-clamp-3">
          {description}
        </p>

        <Link
          to={`/educational/${id}`}
          className="inline-block mt-3 text-sm font-medium text-cyan-400 hover:underline"
        >
          Know More →
        </Link>
      </div>
    </div>
  );
};

export default ExperimentCard;
