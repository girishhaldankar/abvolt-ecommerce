import React from "react";
import EducationHero from "../../../components/Education/sections/EducationHero";
import EducationCategories from "../../../components/Education/sections/EducationCategories";

import { Header } from "../../../components/Header";
import { Footer } from "../../../components/Footer";

const EducationalPage = () => {
  return (
    <>
      <Header />
      <EducationHero />
      <EducationCategories />
      
      <Footer />
    </>
  );
};

export default EducationalPage;
