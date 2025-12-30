import ElectricityLabTrainerImg from "../../../assets/ElectricityLabTrainer.jpg";
import ExprementImg from "../../../assets/exprement.jpg";
import ElectroStaticImg from "../../../assets/electrostatic.jpg";
export const industrialItems = {
  "basic-electronics": {
    title: "Basic Electronics",
    items: [
      {
        id: "nvis-6501",
        name: "Experimentation with Diodes",
        code: "Nvis 6501",
        image: ExprementImg,
        shortDescription:
          "Hands-on diode experimentation for understanding PN junction and rectifier circuits.",
        fullDescription:
          "The Nvis 6501 Experimentation with Diodes is designed for basic electronics learning and hands-on experimentation. It supports multiple diode experiments and is easy to use, making it ideal for students and labs.",
        features: [
          "Stand-alone operation",
          "Durable and easy to use",
          "Solderless connections",
          "Supports multiple diode experiments",
        ],
        scopeOfLearning: [
          "PN junction behavior",
          "Zener diode characteristics",
          "Rectifier circuits",
        ],
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
      {
        id: "nvis-6003",
        name: "Electrostatic Lab",
        code: "Nvis 6003",
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
};
