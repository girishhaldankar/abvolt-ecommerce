import { divisions } from "../../data/divisions";
import DivisionCard from "./DivisionCard";

import GlowBackground from "../ui/GlowBackground";

export default function DivisionGrid() {
  return (
    

    <section className="app-section relative overflow-hidden">
      <GlowBackground />
  <div className="max-w-7xl mx-auto px-4">
    <header className="section-header text-center mb-6">
      <h2 className="section-title text-3xl md:text-4xl">
        Explore Our Divisions
      </h2>
      <p className="section-desc mt-3 text-sm md:text-lg">
        Discover our services, training programs, and online shop offerings.
      </p>
    </header>

   <div className="
  grid 
  grid-cols-2 
  sm:grid-cols-3 
  md:grid-cols-4 
  lg:grid-cols-5 
  gap-3 
  sm:gap-4 
  md:gap-6
">
  {divisions.map(d => (
    <DivisionCard key={d.id} division={d} />
  ))}
</div>

  </div>
</section>
  );
}
