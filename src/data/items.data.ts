import ElectricityLabTrainerImg from "../assets/ElectricityLabTrainer.jpg";
import ElectricityImg from "../assets/digital-ic-trainers.png";
import ElectricityImg2 from "../assets/microchip.jpg";

import ExprementImg from "../assets/exprement.jpg";
import ElectroStaticImg from "../assets/electrostatic.jpg";
import RobotKitImg from "../assets/electrostatic.jpg"; // placeholder




export const educationalItems = {
  /* ---------------- ENGINEERING ---------------- */
  "basic-electronics": {
    title: "Basic Electronics",
    items: [
      {
        id: "nvis-6501",
        name: "Experimentation with Diodes 1",
        code: "Nvis 6501",
        image: ElectricityImg,
        shortDescription: "Hands-on diode experimentation for understanding PN junction.",
        fullDescription: "Full description for engineering diodes trainer.",
      },
      {
        id: "nvis-65012",
        name: "Experimentation with Diodes 2",
        code: "Nvis 6501",
        image: ElectricityImg2,
        shortDescription: "Hands-on diode experimentation for understanding PN junction.",
        fullDescription: "Full description for engineering diodes trainer.",
      },
      {
        id: "nvis-65013",
        name: "Experimentation with Diodes 3",
        code: "Nvis 6501",
        image: ExprementImg,
        shortDescription: "Hands-on diode experimentation for understanding PN junction.",
        fullDescription: "Full description for engineering diodes trainer.",
      },
      {
        id: "nvis-65014",
        name: "Experimentation with Diodes 4",
        code: "Nvis 6501",
        image: ExprementImg,
        shortDescription: "Hands-on diode experimentation for understanding PN junction.",
        fullDescription: "Full description for engineering diodes trainer.",
      },
      {
        id: "nvis-65015",
        name: "Experimentation with Diodes 5",
        code: "Nvis 6501",
        image: ExprementImg,
        shortDescription: "Hands-on diode experimentation for understanding PN junction.",
        fullDescription: "Full description for engineering diodes trainer.",
      },
      {
        id: "nvis-65016",
        name: "Experimentation with Diodes 6",
        code: "Nvis 6501",
        image: ExprementImg,
        shortDescription: "Hands-on diode experimentation for understanding PN junction.",
        fullDescription: "Full description for engineering diodes trainer.",
      },
    ],
    
  },

  "basic-science": {
    title: "Basic Science",
    items: [
      {
        id: "nvis-6000",
        name: "Electricity Lab Trainer",
        code: "Nvis 6000",
        image: ElectricityLabTrainerImg,
        shortDescription:
          "Versatile electricity lab kit for learning and experimenting with basic circuits and electromagnetic principles.",
        fullDescription: `Nvis 6000 Electricity Lab Equipment is a versatile Training System for the laboratory.
It is designed such that all the basic electrical circuits can be tested.

The experiments given with electricity lab kit will develop a clear understanding of series and parallel circuits, electromagnetic induction, coil behavior with AC and DC circuits, diode and transistor characteristics etc.

This simple training system provides a strong platform for detailed studies in electricals and electronics.

Nvis 6000, Electricity Lab Kit is an ideal platform to enhance education, training, skills & development among our young minds.`,
        features: [
          "Stand-alone operation",
          "Durable, easy to use kit",
          "Includes all the Basic Electrical fundamentals",
          "Solderless connections",
          "Complete set of coils and cores to understand the Basics of Electromagnetic induction and Transformers",
          "Provided with a component box to perform all the experiments",
          "CBT covering all the experiments",
          "Online product tutorial",
        ],
        scopeOfLearning: [
          "Study of the Resistances individually as well as in series and in parallel connections",
          "Study of the Ohm’s Law mathematical relationship between Voltage (V), Current (I) and Resistance (R)",
          "Study of the Kirchhoff’s Law for electrical circuits",
          "Study of the R-C circuit and L-C circuit and find out its behavior as resonance circuit",
          "Study of the characteristics of a semiconductor diode and transistor",
          "Study of the Lenz’s Law and effect of Eddy current",
          "Study of Oersted experiments",
          "Convert a Galvanometer into Voltmeter and Galvanometer into Ammeter",
          "Construct and study a step-down transformer and step up transformer",
          "Faraday’s Law of electromagnetic induction",
          "Phenomenon of mutual induction",
        ],
      },
      {
        id: "nvis-6002",
        name: "Electrostatic Lab",
        code: "Nvis 6002",
        image: ElectroStaticImg,
        shortDescription:
          "Demonstrates electrostatic principles through simple, effective experiments.",
        fullDescription:
          "Electrostatic Lab is designed to demonstrate electrostatic principles in a simple and effective way, allowing students to visualize electric forces and charges safely.",
        features: ["Clear experiment layout", "Safe operation", "Concept-oriented design"],
        scopeOfLearning: ["Coulomb’s Law", "Electric charges", "Electrostatic force"],
      },
    ],
  },

  "decade-boxes": {
    title: "Decade Boxes",
    items: [
      {
        id: "nvis-6501",
        name: "Resistance Decade Box",
        code: "NVIS DB-01",
        image: ExprementImg,
        shortDescription: "Hands-on diode experimentation for understanding PN junction.",
        fullDescription: "Full description for Resistance Decade Box trainer.",
      },
    ],
  },
  "decade-boxes2": {
    title: "Decade Boxes 2",
    items: [
      {
        id: "nvis-65012",
        name: "Resistance Decade Box 2",
        code: "NVIS DB-012",
        image: ExprementImg,
        shortDescription: "2Hands-on diode experimentation for understanding PN junction.",
        fullDescription: "2Full description for Resistance Decade Box trainer.",
      },
    ],
  },


  
  "digital-electronics": {
    title: "Digital Electronics",
    items: [
      {
        id: "nvis-7001",
        name: "Logic Gates Trainer",
        code: "Nvis 7001",
        image: ExprementImg,
        shortDescription: "Trainer for logic gates.",
        fullDescription: "Full description for Logic Gates Trainer.",
      },
    ],
  },
  "robotics": {
    title: "Robotics",
    items: [
      {
        id: "nvis-8001",
        name: "Basic Robotics Kit",
        code: "Nvis 8001",
        image: RobotKitImg,
        shortDescription: "Hands-on robotics kit for engineering students.",
        fullDescription: "Full description for Basic Robotics Kit.",
      },
    ],
  },

  /* ---------------- ITI ---------------- */
  "iti-basic-electronics": {
    title: "Basic Electronics",
    items: [
      {
        id: "resistors",
        name: "Resistors Trainer",
        code: "ITI101",
        image: ExprementImg,
        shortDescription: "Hands-on resistors trainer for ITI students.",
        fullDescription: "Learn series, parallel, and color code of resistors.",
      },
      {
        id: "capacitors",
        name: "Capacitors Trainer",
        code: "ITI102",
        image: ExprementImg,
        shortDescription: "Hands-on capacitors trainer for ITI students.",
        fullDescription: "Understand capacitor charging/discharging & circuits.",
      },
    ],
  },

  "iti-basic-science": {
    title: "Basic Science",
    items: [
      {
        id: "electricity-lab",
        name: "Electricity Lab Trainer",
        code: "ITI200",
        image: ElectricityLabTrainerImg,
        shortDescription: "Basic electricity experiments for ITI.",
        fullDescription: "Study circuits, series/parallel connections, and basic physics principles.",
      },
    ],
  },

  "iti-digital-electronics": {
    title: "Digital Electronics",
    items: [
      {
        id: "logic-gates",
        name: "Logic Gates Trainer",
        code: "ITI301",
        image: ExprementImg,
        shortDescription: "Learn AND, OR, NOT, NAND, NOR gates.",
        fullDescription: "Hands-on digital electronics kit for ITI students.",
      },
      {
        id: "flip-flop",
        name: "Flip-Flop Trainer",
        code: "ITI302",
        image: ExprementImg,
        shortDescription: "Learn SR, JK, D, T Flip-Flops.",
        fullDescription: "Hands-on sequential circuits for ITI students.",
      },
    ],
  },

  "iti-robotics": {
    title: "Robotics",
    items: [
      {
        id: "basic-robotics",
        name: "Basic Robotics Kit",
        code: "ITI401",
        image: RobotKitImg,
        shortDescription: "Assemble and program simple robots.",
        fullDescription: "Learn motors, sensors, and basic programming logic for ITI students.",
      },
      {
        id: "advanced-robotics",
        name: "Advanced Robotics Kit",
        code: "ITI402",
        image: RobotKitImg,
        shortDescription: "Build autonomous robots.",
        fullDescription: "Advanced programming and robotics for ITI students.",
      },
    ],
  },
};
