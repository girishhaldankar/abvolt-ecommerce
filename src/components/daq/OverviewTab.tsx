interface Props {
  daq: any;
}

export default function OverviewTab({ daq }: Props) {
  return (
    <div className="space-y-8 p-6">

      {/* ================= SUMMARY ================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        <div className="bg-[#1c2333] rounded-xl p-6">
          <h3 className="text-gray-400 text-sm">
            Digital Inputs
          </h3>

          <div className="text-4xl font-bold mt-2">
            {daq.diState.filter((x: number) => x).length}/11
          </div>
        </div>

        <div className="bg-[#1c2333] rounded-xl p-6">
          <h3 className="text-gray-400 text-sm">
            Digital Outputs
          </h3>

          <div className="text-4xl font-bold mt-2">
            {daq.doState.filter((x: number) => x).length}/11
          </div>
        </div>

        <div className="bg-[#1c2333] rounded-xl p-6">
          <h3 className="text-gray-400 text-sm">
            Frequency
          </h3>

          <div className="text-4xl font-bold mt-2 text-cyan-400">
            {daq.freqValue !== null
              ? daq.freqValue.toFixed(2)
              : "--"}
          </div>

          <div className="text-sm text-gray-500 mt-2">
            Hz
          </div>
        </div>

        <div className="bg-[#1c2333] rounded-xl p-6">
          <h3 className="text-gray-400 text-sm">
            RX Count
          </h3>

          <div className="text-4xl font-bold mt-2">
            {daq.rxCount}
          </div>
        </div>

      </div>

      {/* ================= DIGITAL INPUTS ================= */}

      <div>

        <h2 className="text-xl font-semibold mb-4">
          Digital Inputs
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 gap-4">

          {daq.diState.map(
            (value: number, index: number) => (
              <div
                key={index}
                className={`rounded-xl border transition-all duration-300 p-5 text-center ${
                  value
                    ? "bg-green-600 border-green-400"
                    : "bg-[#1c2333] border-gray-700"
                }`}
              >
                <div className="text-gray-400 text-sm">
                  X{index}
                </div>

                <div className="text-2xl font-bold mt-2">
                  {value ? "HIGH" : "LOW"}
                </div>
              </div>
            )
          )}

        </div>

      </div>

      {/* ================= ANALOG INPUTS ================= */}

      <div>

        <h2 className="text-xl font-semibold mb-4">
          Analog Inputs
        </h2>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

          {daq.aiValues.map(
            (value: number, index: number) => (
              <div
                key={index}
                className="bg-[#1c2333] rounded-xl p-5"
              >
                <div className="flex justify-between">

                  <span className="text-gray-400">
                    AI{index}
                  </span>

                  <span className="font-bold">
                    {value.toFixed(2)} V
                  </span>

                </div>

                <div className="w-full h-3 bg-[#111827] rounded-full mt-5 overflow-hidden">

                  <div
                    className={`h-full transition-all duration-300 ${
                      value > 4.5
                        ? "bg-red-500"
                        : value > 3.8
                        ? "bg-yellow-400"
                        : "bg-cyan-400"
                    }`}
                    style={{
                      width: `${Math.min(
                        (value / 5) * 100,
                        100
                      )}%`,
                    }}
                  />

                </div>

                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>0V</span>
                  <span>5V</span>
                </div>

              </div>
            )
          )}

        </div>

      </div>

     

      {/* ================= FREQUENCY ================= */}

      <div>

        <h2 className="text-xl font-semibold mb-4">
          Frequency Counter
        </h2>

        <div className="bg-[#1c2333] rounded-xl p-8 flex items-center justify-between">

          <div>

            <div className="text-gray-400">
              Current Frequency
            </div>

            <div className="text-5xl font-bold text-cyan-400 mt-2">

              {daq.freqValue !== null
                ? daq.freqValue.toFixed(2)
                : "--"}

            </div>

            <div className="text-gray-500 mt-2">
              Hz
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}