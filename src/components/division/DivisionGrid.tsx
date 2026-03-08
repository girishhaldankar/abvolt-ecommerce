import { useEffect, useState } from "react";
import { motion, time } from "framer-motion";
import DivisionCard from "./DivisionCard";
import DivisionCardSkeleton from "./DivisionCardSkeleton";

import { getAllDivisions } from "../../services/divisions.service";

export default function DivisionGrid() {
  const [divisions, setDivisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllDivisions()
      .then((data) => {

        // Static SHOP division
        const shopDivision = {
          id: "shop",
          title: "Shop",
          slug: "shop",
          description: "Explore our electronic components and kits",
          image: "/images/shop.jpg", // change if needed
          color: "blue",
          isStatic: true
        };

        // Merge backend divisions + static shop
        const mergedDivisions = [...(data || []), shopDivision];

        setDivisions(mergedDivisions);
      })
      .catch((err) => console.error("Failed to load divisions", err))
      .finally(() => setLoading(false));
  }, []);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="section relative overflow-hidden">

     

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <header className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-semibold">
            Explore Our Divisions
          </h2>

          <p className="mt-3 text-muted-foreground">
            Discover our services, training programs, and solutions
          </p>
        </header>

        {/* Skeleton Loading */}
        {loading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <DivisionCardSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && divisions.length === 0 && (
          <div className="text-center py-10 opacity-70">
            No divisions found
          </div>
        )}

        {/* Divisions Grid */}
        {!loading && divisions.length > 0 && (
          <motion.div
            className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false }}
          >
            {divisions.map((division) => {
              const color = division.color || "gray";

              return (
                <motion.div
                  key={division._id || division.id}
                  variants={itemVariants}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="w-full"
                >
                  <DivisionCard division={{ ...division, color }} />
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}