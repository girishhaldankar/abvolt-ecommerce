// src/data/servicesData.ts
import { Users, Wrench, Cpu, ShieldCheck } from "lucide-react";

/* ---------------- TYPES ---------------- */
export interface Item {
  id: string;
  name: string;
  code?: string;
  image?: string;
  shortDescription?: string;
  fullDescription?: string;
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

/* ---------------- SERVICES DATA ---------------- */
export const servicesData: { audiences: Audience[] } = {
  audiences: [
    {
      id: "students",
      title: "Students",
      subtitle: "Skill development programs",
      icon: Users,
      streams: [
        {
          id: "technical",
          title: "Technical Services",
          description: "Hands-on technical learning",
          categories: [
            {
              id: "networking",
              title: "Networking",
              description: "Basics of network setup",
              icon: Cpu,
              path: "/services/students/networking",
              items: [
                {
                  id: "network-101",
                  name: "Networking Basics",
                  path: "/services/students/networking/network-101",
                  shortDescription: "Learn fundamentals of networking.",
                },
              ],
            },
            {
              id: "electronics",
              title: "Electronics",
              description: "Basic electronic circuits",
              icon: Wrench,
              path: "/services/students/electronics",
              items: [
                {
                  id: "electronics-101",
                  name: "Basic Electronics",
                  path: "/services/students/electronics/electronics-101",
                  shortDescription: "Learn basic electronic circuits.",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "professionals",
      title: "Working Professionals",
      subtitle: "Upskilling programs",
      icon: ShieldCheck,
      streams: [
        {
          id: "advanced",
          title: "Advanced Services",
          description: "Professional level services",
          categories: [
            {
              id: "automation",
              title: "Automation",
              description: "Industrial automation systems",
              icon: Cpu,
              path: "/services/professionals/automation",
              items: [
                {
                  id: "automation-201",
                  name: "Advanced Automation",
                  path: "/services/professionals/automation/automation-201",
                  shortDescription:
                    "Learn advanced industrial automation systems.",
                },
              ],
            },
            {
              id: "security",
              title: "Cyber Security",
              description: "IT security & risk management",
              icon: ShieldCheck,
              path: "/services/professionals/security",
              items: [
                {
                  id: "security-101",
                  name: "Cyber Security Basics",
                  path: "/services/professionals/security/security-101",
                  shortDescription:
                    "Introduction to cybersecurity principles.",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
