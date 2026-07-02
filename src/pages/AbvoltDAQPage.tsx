import { useState } from "react";

import {
  LayoutDashboard,
  Cpu,
  Activity,
  TerminalSquare,
  LineChart,
} from "lucide-react";

import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

import { useDAQ } from "../hooks/useDAQ";

import DAQHeader from "../components/daq/DAQHeader";
import OverviewTab from "../components/daq/OverviewTab";
import DigitalTab from "../components/daq/DigitalTab";
import AnalogTab from "../components/daq/AnalogTab";
import SerialTab from "../components/daq/SerialTab";
import PlotterTab from "../components/daq/PlotterTab";

export default function AbvoltDAQPage() {
  const daq = useDAQ();

  const [activeTab, setActiveTab] =
    useState("overview");

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      id: "digital",
      label: "Digital I/O",
      icon: Cpu,
    },
    {
      id: "analog",
      label: "Analog I/O",
      icon: Activity,
    },
    {
      id: "serial",
      label: "Serial Monitor",
      icon: TerminalSquare,
    },
    {
      id: "plotter",
      label: "Plotter",
      icon: LineChart,
    },
  ];

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#0f1117] text-white pt-24">

        <DAQHeader daq={daq} />

        {/* ===================== TAB BAR ===================== */}

        <div className="sticky top-[72px] z-30 bg-[#111827]/95 backdrop-blur border-y border-slate-800">

          <div className="max-w-7xl mx-auto px-6">

            <div className="flex gap-3 overflow-x-auto py-4">

              {tabs.map((tab) => {

                const Icon = tab.icon;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-5 py-3 transition-all duration-300 font-medium

                    ${
                      activeTab === tab.id
                        ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/30"
                        : "bg-[#1b2232] text-slate-400 hover:bg-[#263248] hover:text-white"
                    }`}
                  >
                    <Icon size={18} />

                    {tab.label}
                  </button>
                );

              })}

            </div>

          </div>

        </div>

        {/* ===================== CONTENT ===================== */}

        <div className="max-w-7xl mx-auto px-6 py-8">

          {activeTab === "overview" && (
            <OverviewTab daq={daq} />
          )}

          {activeTab === "digital" && (
            <DigitalTab daq={daq} />
          )}

          {activeTab === "analog" && (
            <AnalogTab daq={daq} />
          )}

          {activeTab === "serial" && (
            <SerialTab daq={daq} />
          )}

          {activeTab === "plotter" && (
            <PlotterTab daq={daq} />
          )}

        </div>

      </main>

      <Footer />
    </>
  );
}