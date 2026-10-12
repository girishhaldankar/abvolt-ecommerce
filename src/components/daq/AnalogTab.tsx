
interface Props {
  daq: any;
}

export default function AnalogTab({
  daq,
}: Props) {
  const {
  aiValues,
  aoValues,
  freqValue,
  aiHistory,
  setAOValue,
  sendAO,
  quickSend,
} = daq;

  const updateAO = (
    index: number,
    value: number
  ) => {
    setAOValue(index, value);
  };

  return (
    <div className="space-y-8">
      {/* Analog Inputs */}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="uppercase text-xs tracking-widest text-slate-400">
            Analog Inputs
          </h3>

          <button
            onClick={() => quickSend("2")}
            className="px-4 py-2 border border-slate-700 rounded"
          >
            Read AI
          </button>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {aiValues.map(
            (value: number, index: number) => {
              const pct = Math.min(
                100,
                (value / 5) * 100
              );

              return (
                <div
                  key={index}
                  className="bg-[#1c2333] border border-slate-700 rounded-xl p-4"
                >
                  <div className="text-xs text-slate-400 uppercase mb-2">
                    AI{index}
                  </div>

                  <div className="text-3xl font-bold font-mono">
                    {value.toFixed(2)}
                  </div>

                  <div className="text-sm text-slate-500 mb-4">
                    Volts
                  </div>

                  <div className="h-2 bg-slate-800 rounded overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{
                        width: `${pct}%`,
                      }}
                    />
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Analog Outputs */}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="uppercase text-xs tracking-widest text-slate-400">
            Analog Outputs
          </h3>

          <button
            onClick={sendAO}
            className="px-4 py-2 border border-blue-500 rounded text-blue-400"
          >
            Send AO
          </button>
        </div>

        <div className="space-y-4">
          {aoValues.map(
            (
              value: number,
              index: number
            ) => (
              <div
                key={index}
                className="bg-[#1c2333] border border-slate-700 rounded-xl p-4 flex items-center gap-4"
              >
                <div className="w-16 font-mono font-bold">
                  AO{index}
                </div>

                <input
                  type="range"
                  min={0}
                  max={5}
                  step={0.01}
                  value={value}
                  onChange={(e) =>
                    updateAO(
                      index,
                      Number(
                        e.target.value
                      )
                    )
                  }
                  className="flex-1"
                />

                <div className="w-20 text-right font-mono text-blue-400">
                  {value.toFixed(2)}V
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Frequency Counter */}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="uppercase text-xs tracking-widest text-slate-400">
            Frequency Counter
          </h3>

          <button
            onClick={() => quickSend("4")}
            className="px-4 py-2 border border-slate-700 rounded"
          >
            Read Frequency
          </button>
        </div>

        <div className="bg-[#1c2333] border border-slate-700 rounded-xl p-8">
          <div className="flex items-center gap-2">
  <div className="text-6xl font-bold font-mono  leading-none">
    {freqValue ?? "--"}
  </div>

  <div className="text-lg text-slate-400">
    Hz
  </div>
</div>

          
        </div>
      </div>
    </div>
  );
}