import React from "react";
import { Link } from "react-router-dom";
import * as LucideIcons from "lucide-react";

/* ---------------- ICON HELPERS ---------------- */
const getLucideIcon = (iconName?: string): any => {
  if (!iconName) return undefined;
  return (LucideIcons as any)[iconName];
};

const getIconComponent = (icon?: any): any => {
  if (!icon) return "📁";
  if (typeof icon === "function") return icon;

  if (typeof icon === "string") {
    const lucideIcon = getLucideIcon(icon);
    if (lucideIcon) return lucideIcon;
    if (/\p{Emoji}/u.test(icon)) return icon;
  }
  return "📁";
};

/* ---------------- PROPS ---------------- */
interface CategoryCardProps {
  title: string;
  description?: string;
  icon?: any;
  path: string;
  color: string;
  itemsCount?: number;
  className?: string;
}

/* ---------------- COMPONENT ---------------- */
export default function CategoryCard({
  title,
  description,
  icon,
  path,
  color,
  itemsCount = 0,
  className,
}: CategoryCardProps) {
  const Icon = getIconComponent(icon);

  return (
    <Link
      to={path}
      className={`
        group relative p-4 rounded-xl overflow-hidden cursor-pointer
        bg-[var(--category-card-bg)]
        border border-[var(--category-border)]
        transition-all duration-300
        hover:scale-[1.03]
        hover:shadow-[0_10px_24px_var(--category-card-shadow)]
        ${className || ""}
      `}
    >
      {/* Hover gradient */}
      <div
        className={`
          absolute inset-0 rounded-xl
          bg-gradient-to-br ${color}
          opacity-60
          group-hover:opacity-80
          dark:opacity-50            
          dark:group-hover:opacity-80 
          transition-opacity duration-300
        `}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* TOP ROW */}
        <div className="flex items-start justify-between gap-3">
          {/* Title + description */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[var(--category-text)] leading-tight line-clamp-1">
              {title}
            </h3>

            {description && (
              <p className="text-xs text-muted-foreground opacity-60 line-clamp-2">
                {description}
              </p>
            )}
          </div>

          {/* Icon */}
          <div
            className={`
              shrink-0 w-10 h-10 rounded-xl
              bg-gradient-to-br ${color} p-0.5
              transition-transform duration-300
              group-hover:scale-110
            `}
          >
            <div className="w-full h-full rounded-lg bg-[var(--category-card-bg)] flex items-center justify-center">
              {typeof Icon === "string" ? (
                <span className="text-lg">{Icon}</span>
              ) : (
                <Icon className="w-5 h-5 text-[var(--category-text)]" />
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM ROW */}
        <div className="mt-auto pt-4 flex items-center justify-between">
  {/* Item count pill */}
  <span
    className="
      px-3 py-1 rounded-full 
      text-xs font-medium
      bg-white/10
      border border-white/20
      backdrop-blur-sm
      opacity-60
    "
  >
    {itemsCount} items
  </span>

  {/* CTA */}
  <span
    className="
      px-1 py-.5 
      text-xs font-medium"
  >
    View all →
  </span>
</div>

      </div>
    </Link>
  );
}
