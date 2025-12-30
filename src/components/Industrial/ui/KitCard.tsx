// src/components/Education/ui/KitCard.tsx
import React from "react";
import { Kit } from "../data/educationKits";

interface KitCardProps {
  kit: Kit;
}

const KitCard: React.FC<KitCardProps> = ({ kit }) => {
  return (
    <div className="border rounded-lg p-4 shadow hover:shadow-lg transition">
      <img
        src={kit.image}
        alt={kit.name}
        className="w-full h-40 object-cover mb-4 rounded"
      />
      <h3 className="text-lg font-semibold">{kit.name}</h3>
      <p className="text-gray-600 text-sm">{kit.description}</p>
      <p className="mt-2 font-bold text-green-600">₹{kit.price}</p>
    </div>
  );
};

export default KitCard;
