// src/data/industrialData.ts
import { Wrench, Factory, Cog } from "lucide-react";

export const industrialData = {
  audiences: [
    {
      id: "automation",
      title: "Automation",
      subtitle: "Industrial Automation",
      icon: Cog,
      streams: [
        {
          id: "plc-control",
          title: "PLC & Control Systems",
          description: "Industrial controllers & automation",
          categories: [
            {
              id: "plc-units",
              title: "PLC Units",
              icon: Factory,
              path: "/industrial/automation/plc-units",
              items: [
                {
                  id: "plc-101",
                  name: "PLC Trainer Kit",
                  code: "PLC-101",
                  path: "/industrial/automation/plc-units/plc-101",
                  shortDescription: "Hands-on PLC training kit",
                  fullDescription: "Full description of PLC trainer kit.",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "machinery",
      title: "Machinery",
      subtitle: "Industrial Machines",
      icon: Factory,
      streams: [
        {
          id: "robots",
          title: "Robotics & Conveyors",
          description: "Industrial assembly line solutions",
          categories: [
            {
              id: "robotic-arms",
              title: "Robot Arms",
              icon: Wrench,
              path: "/industrial/machinery/robotic-arms",
              items: [
                {
                  id: "ra-01",
                  name: "Robot Arm Model 1",
                  code: "RA-01",
                  path: "/industrial/machinery/robotic-arms/ra-01",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
