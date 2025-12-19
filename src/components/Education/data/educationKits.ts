// src/components/Education/data/educationKits.ts
export interface Kit {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  featured?: boolean;
}

export const educationKits: Kit[] = [
  {
    id: 1,
    name: "Basic Electronics Starter Kit",
    category: "Basic Electronics",
    price: 799,
    description: "Learn electronics fundamentals with practical experiments.",
    image: "/images/kits/basic-electronics-1.jpg",
    featured: true,
  },
  {
    id: 2,
    name: "Arduino Electronics Kit",
    category: "Basic Electronics",
    price: 1299,
    description: "Hands-on Arduino projects for beginners.",
    image: "/images/kits/basic-electronics-2.jpg",
    featured: true,
  },
  {
    id: 3,
    name: "Electronic Components Kit",
    category: "Basic Electronics",
    price: 499,
    description: "Includes resistors, capacitors, LEDs, and more.",
    image: "/images/kits/basic-electronics-3.jpg",
    featured: false,
  },
];
