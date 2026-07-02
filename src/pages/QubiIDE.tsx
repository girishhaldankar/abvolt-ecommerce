export default function QubiIDE() {
  return (
    <div className="w-full h-screen">
      <iframe
        src="/qubi/index.html"
        className="w-full h-full border-0"
        title="QUBI IDE"
      />
    </div>
  );
}