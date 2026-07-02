import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface Props {
  daq: any;
}

export default function PlotterTab({ daq }: Props) {
  const [showAI0, setShowAI0] = useState(true);
  const [showAI1, setShowAI1] = useState(true);
  const [showAI2, setShowAI2] = useState(true);
  const [showAI3, setShowAI3] = useState(true);

  const chartData = useMemo(() => {
    const max = Math.max(
      daq.aiHistory[0]?.length || 0,
      daq.aiHistory[1]?.length || 0,
      daq.aiHistory[2]?.length || 0,
      daq.aiHistory[3]?.length || 0
    );

    return Array.from({ length: max }, (_, i) => ({
      sample: i,
      AI0: daq.aiHistory[0][i],
      AI1: daq.aiHistory[1][i],
      AI2: daq.aiHistory[2][i],
      AI3: daq.aiHistory[3][i],
    }));
  }, [daq.aiHistory]);

  return (
    <div className="space-y-6 p-6">

      {/* Header */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

        <div>
          <h2 className="text-2xl font-bold text-white">
            Live Analog Plotter
          </h2>

          <p className="text-gray-400 mt-1">
            Real-time monitoring of Analog Inputs
          </p>
        </div>

        <button
          onClick={() => daq.quickSend("2")}
          className="px-5 py-2 rounded-lg border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black transition"
        >
          Refresh Analog Input
        </button>
      </div>

      {/* Channel Toggle */}

      <div className="flex flex-wrap gap-3">

        <button
          onClick={() => setShowAI0(!showAI0)}
          className={`px-4 py-2 rounded-lg ${
            showAI0
              ? "bg-sky-500 text-white"
              : "bg-gray-700"
          }`}
        >
          AI0
        </button>

        <button
          onClick={() => setShowAI1(!showAI1)}
          className={`px-4 py-2 rounded-lg ${
            showAI1
              ? "bg-green-500 text-white"
              : "bg-gray-700"
          }`}
        >
          AI1
        </button>

        <button
          onClick={() => setShowAI2(!showAI2)}
          className={`px-4 py-2 rounded-lg ${
            showAI2
              ? "bg-yellow-500 text-black"
              : "bg-gray-700"
          }`}
        >
          AI2
        </button>

        <button
          onClick={() => setShowAI3(!showAI3)}
          className={`px-4 py-2 rounded-lg ${
            showAI3
              ? "bg-pink-500 text-white"
              : "bg-gray-700"
          }`}
        >
          AI3
        </button>

      </div>

      {/* Graph */}

      <div className="bg-[#1b2234] rounded-2xl border border-cyan-600 p-5">

        <ResponsiveContainer width="100%" height={500}>

          <LineChart data={chartData}>

            <CartesianGrid
              stroke="#374151"
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="sample"
              stroke="#94a3b8"
            />

            <YAxis
              domain={[0, 5]}
              stroke="#94a3b8"
              label={{
                value: "Voltage (V)",
                angle: -90,
                position: "insideLeft",
                fill: "#94a3b8",
              }}
            />

            <Tooltip />

            <Legend />

            {showAI0 && (
              <Line
                type="monotone"
                dataKey="AI0"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            )}

            {showAI1 && (
              <Line
                type="monotone"
                dataKey="AI1"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            )}

            {showAI2 && (
              <Line
                type="monotone"
                dataKey="AI2"
                stroke="#facc15"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            )}

            {showAI3 && (
              <Line
                type="monotone"
                dataKey="AI3"
                stroke="#ec4899"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            )}

          </LineChart>

        </ResponsiveContainer>

      </div>

      {/* Live Values */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        {daq.aiValues.map((value: number, index: number) => (
          <div
            key={index}
            className="bg-[#1b2234] rounded-xl p-5"
          >
            <div className="text-gray-400">
              AI{index}
            </div>

            <div className="text-3xl font-bold mt-2 text-cyan-400">
              {value.toFixed(2)}
            </div>

            <div className="text-gray-500">
              Volts
            </div>
          </div>
        ))}

      </div>

    </div>
  );
}