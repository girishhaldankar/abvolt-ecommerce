import React from "react";


import IndustrialHero from "../../../components/Industrial/sections/IndustrialHero";
import IndustrialCategories from "../../../components/Industrial/sections/IndustrialCategories";

import { Header } from "../../../components/Header";
import { Footer } from "../../../components/Footer";

const IndustrialPage = () => {
  return (
    <>
      <Header />
      <IndustrialHero />
      <IndustrialCategories />
      
      <Footer />
    </>
  );
};

export default IndustrialPage;
