export default function DAQHeader({
  daq,
}: any) {
  return (
    <div className="border-b border-white/10 p-6 flex items-center gap-4">
      <div
  className={`w-3 h-3 rounded-full ${
    daq.connected
      ? "bg-green-500 animate-pulse"
      : "bg-gray-500"
  }`}
/>

      <div>
        <h1 className="font-bold">
          ABVOLT DAQ
        </h1>

        <p className="text-sm text-white/50">
          Data Acquisition Platform
        </p>
      </div>

      <div className="ml-auto">
       <button
  onClick={
    daq.connected
      ? daq.disconnect
      : daq.connect
  }
  className={`px-4 py-2 rounded-lg border ${
    daq.connected
      ? "border-red-500 text-red-400"
      : "border-green-500 text-green-400"
  }`}
>
  {daq.connected ? "Disconnect" : "Connect"}
</button>
      </div>
    </div>
  );
}