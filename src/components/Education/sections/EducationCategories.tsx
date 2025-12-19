import CategoryCard from "../ui/CategoryCard";
import { categories } from "../data/categories";

const EducationCategories = () => {
  return (
    <div className="px-2">
    <section className="app-section ">
      <div className="max-w-7xl mx-auto px-2">
        {/* Header */}
        
         <header className="text-center mb-14 space-y-4">
          <h2 className="text-[var(--hero-text)] text-2xl sm:text-3xl md:text-4xl font-display leading-tight">
            Educational Categories
          </h2>
          <p className="text-[var(--category-subtext)] max-w-2xl mx-auto text-sm sm:text-base md:text-lg font-sans">
            Browse all educational product categories and lab solutions.
          </p>
        </header>


        {/* Grid */}
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {categories.map((cat) => (
           <CategoryCard
  key={cat.path}
  title={cat.name}
  description={cat.description}
  icon={cat.icon}
  color={cat.color}
  path={cat.path}
/>

          ))}
        </div>
      </div>
    </section>
    </div>
  );
};

export default EducationCategories;
