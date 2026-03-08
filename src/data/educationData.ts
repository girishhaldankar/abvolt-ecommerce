import {
  Cpu,
  FlaskConical,
  Bot,
  Atom,
  GraduationCap,
  Battery,
  Cog,
  Plane,
} from "lucide-react";

import ElectricityLabTrainerImg from "../assets/ElectricityLabTrainer.jpg";
import ElectricityImg from "../assets/digital-ic-trainers.png";
import ElectricityImg2 from "../assets/microchip.jpg";
import ExprementImg from "../assets/exprement.jpg";
import ElectroStaticImg from "../assets/electrostatic.jpg";
import RobotKitImg from "../assets/electrostatic.jpg";

/* ================= TYPES ================= */

export interface Item {
  id: string;
  name: string;
  code: string;
  image?: string;
  shortDescription?: string;
  fullDescription?: string;
  features?: string[];
  scopeOfLearning?: string[];
  path: string;
}

export interface Category {
  id: string;
  title: string;
  icon?: any;
  items: Item[];
  path: string;
}

export interface Stream {
  id: string;
  title: string;
  description?: string;
  categories: Category[];
}

export interface Audience {
  id: string;
  title: string;
  subtitle?: string;
  icon?: any;
  streams: Stream[];
}

export interface DivisionData {
  id: string;
  title: string;
  description?: string;
  audiences: Audience[];
}

/* ================= DATA ================= */

export const educationData: DivisionData = {
  id: "educational",
  title: "Educational",
  description: "Educational kits and laboratory solutions",

  audiences: [
    /* ================= ENGINEERING ================= */
    {
      id: "engineering",
      title: "Engineering",
      subtitle: "Higher Education",
      icon: GraduationCap,
      streams: [
        {
          id: "fundamentals",
          title: "Fundamentals",
          description: "Basics for engineering students",
          categories: [
            {
              id: "basic-electronics",
              title: "Basic Electronics",
              icon: Cpu,
              path: "/educational/engineering/basic-electronics",
              items: [
                {
                  id: "nvis-6501",
                  name: "Experimentation with Diodes 1",
                  code: "Nvis 6501",
                  image: ElectricityImg,
                  shortDescription:
                    "Hands-on diode experimentation for understanding PN junction.",
                  fullDescription:
                    "Full description for engineering diodes trainer.",
                  path: "/educational/engineering/basic-electronics/nvis-6501",
                },
                {
                  id: "nvis-65012",
                  name: "Experimentation with Diodes 2",
                  code: "Nvis 6501",
                  image: ElectricityImg2,
                  shortDescription:
                    "Hands-on diode experimentation for understanding PN junction.",
                  fullDescription:
                    "Full description for engineering diodes trainer.",
                  path: "/educational/engineering/basic-electronics/nvis-65012",
                },
                {
                  id: "nvis-65013",
                  name: "Experimentation with Diodes 3",
                  code: "Nvis 6501",
                  image: ExprementImg,
                  shortDescription:
                    "Hands-on diode experimentation for understanding PN junction.",
                  fullDescription:
                    "Full description for engineering diodes trainer.",
                  path: "/educational/engineering/basic-electronics/nvis-65013",
                },
              ],
            },
            {
              id: "basic-science",
              title: "Basic Science",
              icon: FlaskConical,
              path: "/educational/engineering/basic-science",
              items: [
                {
                  id: "nvis-6000",
                  name: "Electricity Lab Trainer",
                  code: "Nvis 6000",
                  image: ElectricityLabTrainerImg,
                  shortDescription:
                    "Versatile electricity lab kit for learning basic circuits.",
                  fullDescription:
                    "Full description of Nvis 6000 Electricity Lab Trainer.",
                  features: [
                    "Stand-alone operation",
                    "Durable, easy to use kit",
                    "Includes all Basic Electrical fundamentals",
                  ],
                  scopeOfLearning: [
                    "Study of resistances",
                    "Study of Ohm’s Law",
                    "Study of Kirchhoff’s Law",
                  ],
                  path: "/educational/engineering/basic-science/nvis-6000",
                },
                {
                  id: "nvis-6002",
                  name: "Electrostatic Lab",
                  code: "Nvis 6002",
                  image: ElectroStaticImg,
                  shortDescription:
                    "Demonstrates electrostatic principles through simple experiments.",
                  fullDescription:
                    "Electrostatic Lab designed for safe learning of electric forces.",
                  features: ["Clear experiment layout", "Safe operation"],
                  scopeOfLearning: [
                    "Coulomb’s Law",
                    "Electric charges",
                    "Electrostatic force",
                  ],
                  path: "/educational/engineering/basic-science/nvis-6002",
                },
              ],
            },
            {
              id: "decade-boxes",
              title: "Decade Boxes",
              icon: Battery,
              path: "/educational/engineering/decade-boxes",
              items: [
                {
                  id: "nvis-6501",
                  name: "Resistance Decade Box",
                  code: "NVIS DB-01",
                  image: ExprementImg,
                  shortDescription:
                    "Hands-on resistance experimentation for learning fundamentals.",
                  fullDescription:
                    "Full description for Resistance Decade Box trainer.",
                  path: "/educational/engineering/decade-boxes/nvis-6501",
                },
              ],
            },
          ],
        },

        {
          id: "advanced",
          title: "Advanced",
          description: "Advanced modules",
          categories: [
            {
              id: "robotics",
              title: "Robotics",
              icon: Bot,
              path: "/educational/engineering/robotics",
              items: [
                {
                  id: "nvis-8001",
                  name: "Basic Robotics Kit",
                  code: "Nvis 8001",
                  image: RobotKitImg,
                  shortDescription:
                    "Hands-on robotics kit for engineering students.",
                  fullDescription:
                    "Full description for Basic Robotics Kit.",
                  path: "/educational/engineering/robotics/nvis-8001",
                },
              ],
            },
          ],
        },
      ],
    },

    /* ================= ITI ================= */
    {
      id: "iti",
      title: "Volt ITI",
      subtitle: "Skill Training",
      icon: Cog,
      streams: [
        {
          id: "fundamentals",
          title: "Fundamentals",
          description: "Core skills and basics for ITI students",
          categories: [
            {
              id: "basic-electronics",
              title: "Basic Electronics",
              icon: Cpu,
              path: "/educational/iti/basic-electronics",
              items: [
                {
                  id: "resistors",
                  name: "Resistors Trainer",
                  code: "ITI101",
                  image: ExprementImg,
                  shortDescription:
                    "Hands-on resistors trainer for ITI students.",
                  fullDescription:
                    "Learn series, parallel, and color code of resistors.",
                  path: "/educational/iti/basic-electronics/resistors",
                },
              ],
            },
          ],
        },
      ],
    },

    /* ================= SCIENCE SCHOOL ================= */
    {
      id: "science",
      title: "Science School",
      subtitle: "Physics, Chemistry & Labs",
      icon: Atom,
      streams: [
        {
          id: "fundamentals",
          title: "Fundamentals",
          description: "Science basics",
          categories: [
            {
              id: "physics",
              title: "Physics",
              icon: Atom,
              items: [],
              path: "/educational/science/physics",
            },
          ],
        },
      ],
    },

    /* ================= PRESCHOOL ================= */
    {
      id: "preschool",
      title: "Preschool",
      subtitle: "Early STEM & Learning",
      icon: Plane,
      streams: [
        {
          id: "foundations",
          title: "Foundations",
          description: "Early learning & curiosity building",
          categories: [
            {
              id: "basic-learning",
              title: "Basic Learning",
              icon: GraduationCap,
              path: "/educational/preschool/basic-learning",
              items: [
                {
                  id: "shapes-colors",
                  name: "Shapes & Colors Kit",
                  code: "PS101",
                  path: "/educational/preschool/basic-learning/shapes-colors",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
