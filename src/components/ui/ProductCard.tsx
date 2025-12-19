import React from "react";

interface ProductCardProps {
  name: string;
  description: string;
  onClick?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ name, description, onClick }) => {
  return (
    <div
      className="border rounded-lg p-4 shadow hover:shadow-lg cursor-pointer transition"
      onClick={onClick}
    >
      <h3 className="font-semibold text-lg">{name}</h3>
      <p className="text-gray-600 mt-2">{description}</p>
    </div>
  );
};

export default ProductCard;
