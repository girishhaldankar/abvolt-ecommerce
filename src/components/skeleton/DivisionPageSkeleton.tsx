export default function DivisionPageSkeleton() {
  return (
    <div className="animate-pulse">

      {/* HERO SKELETON */}
      <section className="pt-32 pb-20 text-center">
        <div className="h-6 w-24 rounded-full mx-auto mb-6 bg-gray-300 dark:bg-white/10"></div>

        <div className="h-10 w-80 rounded mx-auto mb-4 bg-gray-300 dark:bg-white/10"></div>

        <div className="h-4 w-96 rounded mx-auto bg-gray-200 dark:bg-white/10"></div>
      </section>

      {/* TABS SKELETON */}
      <div className="flex justify-center gap-3 mb-10 px-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-10 w-32 rounded-full 
                       border border-[var(--category-border)] 
                       bg-[var(--category-card-bg)]"
          />
        ))}
      </div>

      {/* CARDS GRID SKELETON */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="p-6 rounded-xl
                       border border-[var(--category-border)]
                       bg-[var(--category-card-bg)]"
          >
            <div className="flex flex-col items-center text-center">

              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-gray-300 dark:bg-white/10 mb-4"></div>

              {/* Title */}
              <div className="h-4 w-24 rounded bg-gray-300 dark:bg-white/10 mb-3"></div>

              {/* Description */}
              <div className="h-3 w-full rounded bg-gray-200 dark:bg-white/10 mb-2"></div>
              <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-white/10"></div>

            </div>
          </div>
        ))}
      </div>

    </div>
  );
}