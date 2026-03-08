export default function DivisionCardSkeleton() {
  return (
    <div className="flex flex-col h-full">
      <div
        className="relative p-6 rounded-xl overflow-hidden
                   border border-[var(--category-border)]
                   flex flex-col justify-between items-center text-center
                   shadow-lg h-full
                   animate-pulse"
        style={{ background: "var(--category-card-bg)" }}
      >
        {/* Content */}
        <div className="flex flex-col flex-1 items-center justify-center w-full">
          
          {/* Icon Skeleton */}
          <div className="mb-4">
            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl bg-gray-300 dark:bg-white/10" />
          </div>

          {/* Title Skeleton */}
          <div className="h-5 w-3/4 bg-gray-300 dark:bg-white/10 rounded mb-3" />

          {/* Description Skeleton */}
          <div className="h-3 w-full bg-gray-200 dark:bg-white/10 rounded mb-2" />
          <div className="h-3 w-5/6 bg-gray-200 dark:bg-white/10 rounded" />
        </div>

        {/* Button Skeleton */}
        <div className="mt-4 h-9 w-24 rounded-full bg-gray-300 dark:bg-white/10" />

        {/* Corner Accent Placeholder */}
        <span className="pointer-events-none absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 rounded-tr-xl border-gray-300 dark:border-white/10" />
      </div>
    </div>
  );
}
