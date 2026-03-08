import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef, useLayoutEffect, useState } from "react";
import DroneSVG from "../assets/heroScroll.svg?react";

export function HeroSectionScroll() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [offsetRange, setOffsetRange] = useState([0, 1]);

  // Calculate scroll start/end
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const scrollTop = window.scrollY || window.pageYOffset;

    const start = rect.top + scrollTop;
    const end = start + window.innerHeight * 2.5; // more scroll for cinematic feel

    setOffsetRange([start, end]);
  }, []);

  const { scrollY } = useScroll();

  // Scroll progress 0 → 1 mapped to offset range
  const scrollProgress = useTransform(scrollY, offsetRange, [0, 1]);

  // Phase 1 & 5: fan rotation
  const clampedRotate = useTransform(
    scrollProgress,
    [0, 0.25, 0.85, 1],
    ["360deg", "0deg", "0deg", "360deg"]
  );

  // Phase 2 → 4: lift → float → settle
  const clampedOffset = useTransform(
    scrollProgress,
    [0, 0.3, 0.55, 0.7, 0.85, 1],
    ["0px", "0px", "-40px", "-40px", "0px", "0px"]
  );

  // Smooth motion
  const smoothOffset = useSpring(clampedOffset, { stiffness: 120, damping: 20 });
  const smoothRotate = useSpring(clampedRotate, { stiffness: 120, damping: 20 });

  return (
    <section ref={ref} className="min-h-[450vh] bg-black ">
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-visible">
        {/* 90% scale, no clipping */}
        <div className="my-drone">
        <motion.div
          style={{
            scale: 0.9, // 90% size
            ["--fan-rotate" as any]: smoothRotate,
            ["--fan-offset" as any]: smoothOffset,
          }}
        >
          <DroneSVG width={420} />
        </motion.div>
        </div>
      </div>
    </section>
  );
}
