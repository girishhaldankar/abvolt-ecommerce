// src/data/trainingServices.ts
import { Users, Wrench, Cpu, ShieldCheck } from "lucide-react";

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

export const trainingData: { audiences: Audience[] } = {
  audiences: [
    {
      id: "students",
      title: "Students",
      subtitle: "Career-focused skill development",
      icon: Users,
      streams: [
        {
          id: "technical",
          title: "Technical Training",
          description: "Hands-on technical programs",
          categories: [
            {
              id: "embedded",
              title: "Embedded Systems",
              description: "Microcontrollers & IoT basics",
              icon: Cpu,
              path: "/training/students/embedded",
              items: [
                {
                  id: "embedded-101",
                  name: "Embedded Systems Basics",
                  path: "/training/students/embedded/embedded-101",
                  shortDescription: "Learn microcontrollers and IoT basics.",
                },
              ],
            },
            {
              id: "automation",
              title: "Industrial Automation",
              description: "PLC, SCADA & controls",
              icon: Wrench,
              path: "/training/students/automation",
              items: [
                {
                  id: "automation-101",
                  name: "PLC Fundamentals",
                  path: "/training/students/automation/automation-101",
                  shortDescription: "Hands-on PLC training for beginners.",
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
      subtitle: "Industry upskilling programs",
      icon: ShieldCheck,
      streams: [
        {
          id: "certification",
          title: "Certification Programs",
          description: "Industry-recognized certifications",
          categories: [
            {
              id: "plc", // ✅ changed from "plc-advanced" to "plc"
              title: "Advanced PLC",
              description: "Advanced automation systems",
              icon: Cpu,
              path: "/training/professionals/plc",
              items: [
                {
                  id: "plc-201",
                  name: "Advanced PLC Programming",
                  path: "/training/professionals/plc/plc-201",
                  shortDescription: "Advanced PLC programming techniques.",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
