import { useEffect, useRef, useState } from "react";

const BAUD = 9600;
const MAX_HIST = 120;

export function useDAQ() {
  const [connected, setConnected] = useState(false);
  const [paused, setPaused] = useState(false);

  const [diState, setDiState] = useState<number[]>(
    Array(11).fill(0)
  );

  const [doState, setDoState] = useState<number[]>(
    Array(11).fill(0)
  );

  const [aiValues, setAiValues] = useState<number[]>(
    Array(4).fill(0)
  );

  const [aoValues, setAoValues] = useState<number[]>([
    0, 0,
  ]);

  const [freqValue, setFreqValue] =
    useState<number | null>(null);

  const [rxCount, setRxCount] = useState(0);

  const [logs, setLogs] = useState<any[]>([]);

  const [aiHistory, setAiHistory] = useState<
    number[][]
  >([[], [], [], []]);

  const portRef = useRef<any>(null);
  const readerRef = useRef<any>(null);
  const writerRef = useRef<any>(null);

  const parserState = useRef("idle");
  const lineBuffer = useRef("");

  const autoTimers = useRef<{
    di: any;
    ai: any;
  }>({
    di: null,
    ai: null,
  });

  //--------------------------------------------------
  // LOGS
  //--------------------------------------------------

  const addLog = (
    type: string,
    text: string
  ) => {
    setLogs((prev) => [
      ...prev,
      {
        type,
        text,
        time: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  //--------------------------------------------------
  // SERIAL CONNECT
  //--------------------------------------------------

 const connect = async () => {
  console.log("STEP 1 - Connect clicked");

  try {
    if (!("serial" in navigator)) {
      console.log("Web Serial not supported");
      addLog("err", "Web Serial not supported");
      return;
    }

    console.log("STEP 2 - Opening chooser");

    const port = await navigator.serial.requestPort();

    console.log("STEP 3 - Port selected");
    console.log("Port Object:", port);
    console.log("Port Info:", port.getInfo());

    console.log("STEP 4 - Opening port...");

    await port.open({
      baudRate: BAUD,
      dataBits: 8,
      stopBits: 1,
      parity: "none",
      flowControl: "none",
    });

    console.log("STEP 5 - Port opened successfully");

    portRef.current = port;

    console.log("STEP 6 - Creating writer");

    writerRef.current = port.writable.getWriter();

    console.log("STEP 7 - Connected");

    setConnected(true);

    addLog("sys", `Connected @ ${BAUD}`);

    console.log("STEP 8 - Starting read loop");

    readLoop();

    console.log("STEP 9 - Sending startup commands");

    setTimeout(() => sendRaw("0\n"), 300);
    setTimeout(() => sendRaw("2\n"), 600);
    setTimeout(() => sendRaw("4\n"), 900);

  } catch (err: any) {
    console.error("=========== CONNECT ERROR ===========");
    console.error(err);
    console.error("Name:", err?.name);
    console.error("Message:", err?.message);
    console.error("Stack:", err?.stack);
    console.error("=====================================");

    addLog("err", err?.message || "Connection failed");
  }
};

  const disconnect = async () => {
    try {
      stopAutoRead("di");
      stopAutoRead("ai");

      if (readerRef.current) {
        await readerRef.current.cancel();
      }

      if (writerRef.current) {
        writerRef.current.releaseLock();
      }

      if (portRef.current) {
        await portRef.current.close();
      }
    } catch {}

    setConnected(false);

    portRef.current = null;
    readerRef.current = null;
    writerRef.current = null;

    addLog("sys", "Disconnected");
  };

  //--------------------------------------------------
  // WRITE
  //--------------------------------------------------

  const sendRaw = async (
    text: string
  ) => {
    try {
      if (!writerRef.current) return;

      await writerRef.current.write(
        new TextEncoder().encode(text)
      );
    } catch (err: any) {
      addLog(
        "err",
        err?.message || "Write error"
      );
    }
  };

  const quickSend = (cmd: string) => {
    sendRaw(cmd + "\n");
    addLog("tx", cmd);
  };

  //--------------------------------------------------
  // READER
  //--------------------------------------------------

  const readLoop = async () => {
    if (!portRef.current) return;

    const decoder =
      new TextDecoderStream();

    portRef.current.readable.pipeTo(
      decoder.writable
    );

    readerRef.current =
      decoder.readable.getReader();

    while (true) {
      const { value, done } =
        await readerRef.current.read();

      if (done) break;

      lineBuffer.current += value;

      const lines =
        lineBuffer.current.split("\n");

      lineBuffer.current =
        lines.pop() || "";

      lines.forEach((line) => {
        const text = line.trim();

        if (!text) return;

        if (!paused) {
          addLog("rx", text);
        }

        parseLine(text);
      });
    }
  };

  //--------------------------------------------------
  // PARSER
  //--------------------------------------------------

  const parseLine = (
    text: string
  ) => {
    if (text === "DIGITAL INPUTS") {
      parserState.current = "di";
      return;
    }

    if (text === "ANALOG INPUTS") {
      parserState.current = "ai";
      return;
    }

    if (text === "FREQ COUNTER") {
      parserState.current = "freq";
      return;
    }

    //------------------------------------
    // DI
    //------------------------------------

    if (
      parserState.current === "di"
    ) {
      const match =
        text.match(
          /^X(\d+)\s*-\s*([01])$/
        );

      if (match) {
        const index =
          parseInt(match[1]);

        const value =
          parseInt(match[2]);

        setDiState((prev) => {
          const next = [...prev];
          next[index] = value;
          return next;
        });

        setRxCount(
          (count) => count + 1
        );

        return;
      }
    }

    //------------------------------------
    // AI
    //------------------------------------

    if (
      parserState.current === "ai"
    ) {
      const match =
        text.match(
          /^AI(\d)\s*-\s*([\d.]+)\s*V$/
        );

      if (match) {
        const index =
          parseInt(match[1]);

        const value =
          parseFloat(match[2]);

        setAiValues((prev) => {
          const next = [...prev];
          next[index] = value;
          return next;
        });

        setAiHistory((prev) => {
          const next = [...prev];

          next[index] = [
            ...next[index],
            value,
          ];

          if (
            next[index].length >
            MAX_HIST
          ) {
            next[index].shift();
          }

          return [...next];
        });

        setRxCount(
          (count) => count + 1
        );

        return;
      }
    }

    //------------------------------------
    // FREQ
    //------------------------------------

    if (
      parserState.current === "freq"
    ) {
      const match =
        text.match(
          /^FC\s*-\s*([\d.]+)\s*Hz$/
        );

      if (match) {
        setFreqValue(
          parseFloat(match[1])
        );

        setRxCount(
          (count) => count + 1
        );
      }
    }
  };

  //--------------------------------------------------
  // DIGITAL OUTPUTS
  //--------------------------------------------------

  const toggleDO = (
    index: number
  ) => {
    const next = [...doState];

    next[index] = next[index]
      ? 0
      : 1;

    setDoState(next);

    const values =
      next.join(",");

    sendRaw("1\n");

    setTimeout(() => {
      sendRaw(
        `Y - ${values}\n`
      );
    }, 100);
  };

  //--------------------------------------------------
  // ANALOG OUTPUTS
  //--------------------------------------------------

  const setAOValue = (
    index: number,
    value: number
  ) => {
    const next = [...aoValues];

    next[index] = value;

    setAoValues(next);
  };

  const sendAO = () => {
    sendRaw("3\n");

    const cmd = `A - ${aoValues[0].toFixed(
      2
    )},${aoValues[1].toFixed(2)}`;

    setTimeout(() => {
      sendRaw(cmd + "\n");
    }, 100);
  };

  //--------------------------------------------------
  // AUTO READ
  //--------------------------------------------------

  const startAutoRead = (
    type: "di" | "ai",
    interval = 500
  ) => {
    stopAutoRead(type);

    const cmd =
      type === "di" ? "0" : "2";

    sendRaw(cmd + "\n");

    autoTimers.current[type] =
      setInterval(() => {
        sendRaw(cmd + "\n");
      }, interval);

    addLog(
      "sys",
      `${type.toUpperCase()} auto-read started`
    );
  };

  const stopAutoRead = (
    type: "di" | "ai"
  ) => {
    if (
      autoTimers.current[type]
    ) {
      clearInterval(
        autoTimers.current[type]
      );

      autoTimers.current[type] =
        null;

      addLog(
        "sys",
        `${type.toUpperCase()} auto-read stopped`
      );
    }
  };

  //--------------------------------------------------
  // RESET
  //--------------------------------------------------

  const resetDAQ = () => {
    setDiState(
      Array(11).fill(0)
    );

    setDoState(
      Array(11).fill(0)
    );

    setAiValues(
      Array(4).fill(0)
    );

    setAoValues([0, 0]);

    setFreqValue(null);

    setAiHistory([
      [],
      [],
      [],
      [],
    ]);

    setRxCount(0);

    sendRaw("R\n");

    addLog("tx", "R");
  };

  //--------------------------------------------------

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    connected,
    paused,
    setPaused,

    diState,
    doState,
    aiValues,
    aoValues,
    freqValue,
    rxCount,

    aiHistory,

    logs,

    connect,
    disconnect,

    sendRaw,
    quickSend,

    toggleDO,

    setAOValue,
    sendAO,

    startAutoRead,
    stopAutoRead,

    resetDAQ,

    clearLogs,
  };
}