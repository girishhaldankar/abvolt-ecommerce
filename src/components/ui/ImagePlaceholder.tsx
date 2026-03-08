import { Image as ImageIcon } from "lucide-react";

interface ImagePlaceholderProps {
  height?: string;
  className?: string; // optional extra classes
}

export default function ImagePlaceholder({
  height = "h-[260px]",
  className = "",
}: ImagePlaceholderProps) {
  return (
    <div
      className={`w-full ${height} rounded-xl bg-[#111827] flex items-center justify-center ${className}`}
    >
      <ImageIcon className="w-14 h-14 text-white opacity-30" />
    </div>
  );
}
