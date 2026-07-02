import { useState, useRef, useEffect } from "react";

interface Props {
  daq: any;
}

export default function SerialTab({ daq }: Props) {
  const {
    logs,
    quickSend,
    clearLogs,
  } = daq;

  const [command, setCommand] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);

  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && logRef.current) {
      logRef.current.scrollTop =
        logRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const handleSend = () => {
    if (!command.trim()) return;

    quickSend(command);
    setCommand("");
  };

  // ==========================
  // Export TXT
  // ==========================

  const exportTXT = () => {
    if (logs.length === 0) return;

    const now = new Date();

    const header = `
==========================================
          ABVOLT DAQ SERIAL LOG
==========================================

Date : ${now.toLocaleDateString()}
Time : ${now.toLocaleTimeString()}

------------------------------------------

`;

    const body = logs
      .map((log: any) => {
        const prefix =
          log.type === "tx"
            ? "TX >"
            : log.type === "rx"
            ? "RX <"
            : log.type === "err"
            ? "ERR"
            : "SYS";

        return `[${log.time}] ${prefix} ${log.text}`;
      })
      .join("\n");

    const footer = `

------------------------------------------
End of Log
==========================================
`;

    const blob = new Blob(
      [header + body + footer],
      {
        type: "text/plain;charset=utf-8",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download = `ABVOLT_SerialLog_${now
      .toISOString()
      .replace(/:/g, "-")}.txt`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">

      {/* ================= QUICK COMMANDS ================= */}

      <div>

        <h3 className="uppercase tracking-widest text-xs text-slate-500 mb-3">
          Quick Commands
        </h3>

        <div className="flex flex-wrap gap-3">

          <button
            onClick={() => quickSend("0")}
            className="px-5 py-3 rounded-xl border border-slate-700 hover:border-cyan-500 hover:bg-cyan-500/10 transition"
          >
            0 — DI Read
          </button>

          <button
            onClick={() => quickSend("1")}
            className="px-5 py-3 rounded-xl border border-slate-700 hover:border-cyan-500 hover:bg-cyan-500/10 transition"
          >
            1 — DO Mode
          </button>

          <button
            onClick={() => quickSend("2")}
            className="px-5 py-3 rounded-xl border border-slate-700 hover:border-cyan-500 hover:bg-cyan-500/10 transition"
          >
            2 — AI Read
          </button>

          <button
            onClick={() => quickSend("3")}
            className="px-5 py-3 rounded-xl border border-slate-700 hover:border-cyan-500 hover:bg-cyan-500/10 transition"
          >
            3 — AO Mode
          </button>

          <button
            onClick={() => quickSend("4")}
            className="px-5 py-3 rounded-xl border border-slate-700 hover:border-cyan-500 hover:bg-cyan-500/10 transition"
          >
            4 — Frequency
          </button>

          <button
            onClick={() => quickSend("R")}
            className="px-5 py-3 rounded-xl border border-red-500 text-red-400 hover:bg-red-500/10 transition"
          >
            Reset DAQ
          </button>

        </div>

      </div>

      {/* ================= SERIAL LOG ================= */}

      <div
        ref={logRef}
        className="bg-black border border-slate-700 rounded-xl h-[500px] overflow-y-auto p-5 font-mono text-sm"
      >

        {logs.length === 0 && (
          <div className="text-slate-500">
            Waiting for serial data...
          </div>
        )}

        {logs.map(
          (log: any, index: number) => (
            <div
              key={index}
              className={`mb-1 ${
                log.type === "rx"
                  ? "text-green-400"
                  : log.type === "tx"
                  ? "text-cyan-400"
                  : log.type === "err"
                  ? "text-red-400"
                  : "text-slate-500"
              }`}
            >
              [{log.time}] {log.text}
            </div>
          )
        )}

      </div>

      {/* ================= COMMAND INPUT ================= */}

      <div className="flex flex-col lg:flex-row gap-4">

        <input
          type="text"
          value={command}
          onChange={(e) =>
            setCommand(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
          }}
          placeholder="Type command and press Enter..."
          className="flex-1 bg-[#1c2333] border border-slate-700 rounded-xl px-5 py-3"
        />

        <button
          onClick={handleSend}
          className="px-6 py-3 rounded-xl bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition"
        >
          Send
        </button>

      </div>

      {/* ================= FOOTER ================= */}

      <div className="flex flex-wrap items-center gap-3">

        <button
          onClick={() =>
            setAutoScroll(!autoScroll)
          }
          className="px-5 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 transition"
        >
          {autoScroll
            ? "✓ Auto Scroll"
            : "Auto Scroll"}
        </button>

        <button
          onClick={clearLogs}
          className="px-5 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 transition"
        >
          Clear
        </button>

        <button
          onClick={exportTXT}
          className="px-5 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 transition"
        >
          Export TXT
        </button>

      </div>

    </div>
  );
}