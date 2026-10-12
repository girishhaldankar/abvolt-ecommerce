type Props = {
  daq: any;
};

export default function DigitalTab({ daq }: Props) {
  return (
    <div className="grid xl:grid-cols-2 gap-8">

      {/* ================= DIGITAL INPUTS ================= */}

      <div>

        <div className="flex justify-between items-center mb-5">

          <h3 className="uppercase tracking-[3px] text-xs text-slate-500 font-medium">
            Digital Inputs — X0 to X10
          </h3>

          <button
            onClick={() => daq.quickSend?.("0")}
             className="px-5 py-2 rounded-lg border border-slate-600 hover:border-cyan-400 hover:text-cyan-400 transition"
          >
            Read DI
          </button>

        </div>

      

        {/* Inputs */}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">

          {daq.diState?.map(
            (value: number, index: number) => (

              <div
                key={index}
                className={`rounded-2xl border p-4 text-center transition duration-300 ${
                  value
                    ? "border-green-500 bg-green-900/30"
                    : "border-slate-700 bg-[#20283a]"
                }`}
              >

                <div
                  className={`w-4 h-4 rounded-full mx-auto mb-4 ${
                    value
                      ? "bg-green-400 shadow-lg shadow-green-500/70"
                      : "bg-slate-500"
                  }`}
                />

                <div className="text-xl font-semibold tracking-wide text-white">
                  X{index}
                </div>

                <div
                  className={`mt-2 text-sm font-semibold ${
                    value
                      ? "text-green-400"
                      : "text-slate-400"
                  }`}
                >
                  {value ? "HIGH" : "LOW"}
                </div>

              </div>

            )
          )}

        </div>

      </div>

      {/* ================= DIGITAL OUTPUTS ================= */}

      <div>

        <div className="flex justify-between items-center mb-5">

          <h3 className="uppercase tracking-[3px] text-xs text-slate-500 font-medium">
            Digital Outputs — Y0 to Y10
          </h3>

          <button
            onClick={() => daq.quickSend?.("1")}
            className="px-5 py-2 rounded-lg border border-slate-600 hover:border-cyan-400 hover:text-cyan-400 transition"
          >
            DO Mode
          </button>

        </div>

        <div className="space-y-3">

          {daq.doState?.map(
            (value: number, index: number) => (

              <div
                key={index}
                className="bg-[#20283a] border border-slate-700 rounded-xl px-5 py-4 flex items-center justify-between"
              >

                <div className="flex items-center gap-4">

                  {/* Toggle */}

                  <button
                    onClick={() =>
                      daq.toggleDO?.(index)
                    }
                    className={`relative w-11 h-6 rounded-full transition ${
                      value
                        ? "bg-cyan-500"
                        : "bg-slate-700"
                    }`}
                  >

                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${
                        value
                          ? "left-6"
                          : "left-1"
                      }`}
                    />

                  </button>

                  <span className="text-lg font-semibold tracking-wide text-white">
                    Y{index}
                  </span>

                </div>

                <span
                  className={`px-3 py-1 rounded-md text-xs font-medium tracking-wide ${
                    value
                      ? "bg-cyan-500/20 text-cyan-400"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {value ? "ON" : "OFF"}
                </span>

              </div>

            )
          )}

        </div>

      </div>

    </div>
  );
}