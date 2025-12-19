import { Book, Factory, GraduationCap, Wrench, ShoppingBag } from "lucide-react";

export const divisions = [
  {
    id: "educational",
    type: "internal",
    title: "Educational",
    description: "Educational kits and laboratory solutions",
    path: "/educational",
    icon: Book,
    color: "from-cyan-500 to-blue-500",
  },
  {
    id: "industrial",
    type: "internal",
    title: "Industrial & Commercial",
    description: "Industrial automation and testing solutions",
    path: "/industrial",
    icon: Factory,
    color: "from-blue-500 to-indigo-500",
  },
  {
    id: "training",
    type: "internal",
    title: "Training Services",
    description: "Professional training and certification programs",
    path: "/training",
    icon: GraduationCap,
    color: "from-indigo-500 to-purple-500",
  },
  {
    id: "services",
    type: "internal",
    title: "Services",
    description: "Technical assistance and support",
    path: "/services",
    icon: Wrench,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "shop",
    type: "shop", // 🔑 SPECIAL
    title: "Online Shop",
    description: "Purchase products online",
    path: "/shop",
    icon: ShoppingBag,
    color: "from-pink-500 to-rose-500",
  },
];
