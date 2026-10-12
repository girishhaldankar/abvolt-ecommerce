
import { motion } from "framer-motion";
import {
  Blocks,
  Cpu,
  Code2,
  Zap,
  Lightbulb,
  Palette,
  Volume2,
  Gamepad2,
  Settings2,
  GitBranch,
} from "lucide-react";

import GlowBackground from "./ui/GlowBackground";
import GlassButton from "./GlassButton";

export default function QubiSection() {
  const features = [
    {
      icon: Blocks,
      title: "Block Coding",
      description: "Build programs visually and learn coding step by step.",
      color: "text-cyan-500",
    },
    {
      icon: Code2,
      title: "Real Code",
      description: "Turn visual blocks into Arduino-ready code.",
      color: "text-blue-500",
    },
    {
      icon: Cpu,
      title: "ESP32",
      description: "Connect your ideas to real electronics and hardware.",
      color: "text-purple-500",
    },
    {
      icon: Zap,
      title: "Build & Create",
      description: "Turn your ideas into working projects.",
      color: "text-cyan-500",
    },
  ];

  const toolbox = [
    {
      icon: Lightbulb,
      label: "Display",
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
    },
    {
      icon: Palette,
      label: "RGB",
      color: "text-pink-500",
      bg: "bg-pink-500/10",
    },
    {
      icon: Volume2,
      label: "Sound",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      icon: Gamepad2,
      label: "Buttons",
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      icon: Settings2,
      label: "Pins",
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      icon: GitBranch,
      label: "Control",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
  ];

  return (
    <motion.section
      className="relative rounded-2xl overflow-hidden mb-16 app-section"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{ duration: 0.8 }}
    >
      {/* Background Glow */}
      <GlowBackground className="opacity-70" />

      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            top-16
            right-16
            w-12
            h-12
            rounded-xl
            border
            border-cyan-400/30
            rotate-12
          "
        />

        <motion.div
          animate={{
            x: [0, 20, 0],
            y: [0, -15, 0],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            bottom-20
            left-16
            w-20
            h-20
            rounded-full
            border
            border-purple-400/20
          "
        />

        <div
          className="
            absolute
            -top-32
            -right-32
            w-72
            h-72
            rounded-full
            border
            border-blue-400/10
          "
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-500 font-medium mb-3">
            Introducing
          </p>

          <h2 className="section-title text-4xl md:text-5xl font-semibold">
            QUBI
          </h2>

          <p className="mt-4 text-xl md:text-2xl font-medium">
            Where Ideas Become Real.
          </p>

          <p className="mt-4 text-sm md:text-base max-w-2xl mx-auto leading-relaxed opacity-75">
            An interactive platform for learning coding, electronics and
            robotics through hands-on experimentation and real-world projects.
          </p>

          <div className="mt-6 mx-auto h-[2px] w-24 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full" />
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* =========================================================
              LEFT — MINI QUBI STUDIO
          ========================================================= */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div
              className="
                relative
                rounded-2xl
                overflow-hidden
                border
                border-white/10
                bg-black/[0.03]
                dark:bg-white/[0.03]
                shadow-xl
              "
            >

              {/* ================= TOP BAR ================= */}
              <div
                className="
                  flex
                  items-center
                  justify-between
                  px-4
                  md:px-5
                  py-3
                  border-b
                  border-white/10
                  bg-white/[0.02]
                "
              >
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-400/70" />
                    <div className="w-2 h-2 rounded-full bg-yellow-400/70" />
                    <div className="w-2 h-2 rounded-full bg-green-400/70" />
                  </div>

                  <div className="ml-2 w-px h-4 bg-white/10" />

                  <div className="flex items-center gap-2 ml-1">
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />

                    <span className="text-[10px] md:text-xs font-medium tracking-wide">
                      QUBI STUDIO
                    </span>
                  </div>
                </div>

                <span className="text-[9px] md:text-[10px] uppercase tracking-widest opacity-40">
                  Create
                </span>
              </div>

              {/* ================= EDITOR ================= */}
              <div className="flex min-h-[390px]">

                {/* ================= TOOLBOX ================= */}
                <div
                  className="
                    w-[92px]
                    sm:w-[105px]
                    md:w-[115px]
                    shrink-0
                    border-r
                    border-white/10
                    bg-black/[0.025]
                    dark:bg-white/[0.025]
                    p-2
                    md:p-3
                  "
                >
                  <div className="mb-3 px-1">
                    <p className="text-[8px] md:text-[9px] uppercase tracking-widest opacity-40">
                      Toolbox
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    {toolbox.map((item, index) => {
                      const Icon = item.icon;

                      return (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: false }}
                          transition={{
                            duration: 0.4,
                            delay: index * 0.06,
                          }}
                          className={`
                            flex
                            items-center
                            gap-1.5
                            md:gap-2
                            rounded-md
                            px-1.5
                            md:px-2
                            py-2
                            ${item.bg}
                            border
                            border-transparent
                            hover:border-white/10
                            transition
                          `}
                        >
                          <Icon
                            className={`w-3 h-3 md:w-3.5 md:h-3.5 shrink-0 ${item.color}`}
                          />

                          <span className="text-[8px] md:text-[9px] font-medium opacity-70 truncate">
                            {item.label}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5">
                    <div className="px-2 py-1 text-[8px] opacity-30">
                      Logic
                    </div>
                    <div className="px-2 py-1 text-[8px] opacity-30">
                      Math
                    </div>
                    <div className="px-2 py-1 text-[8px] opacity-30">
                      Variables
                    </div>
                  </div>
                </div>

                {/* ================= BLOCK WORKSPACE ================= */}
                <div className="flex-1 min-w-0 p-3 md:p-5 overflow-hidden">

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[8px] md:text-[9px] uppercase tracking-widest opacity-35">
                      Workspace
                    </span>

                    <span className="text-[8px] opacity-30">
                      Blocks
                    </span>
                  </div>

                  {/* Block Stack */}
                  <div className="relative">

                    {/* BLOCK 1 */}
                    <motion.div
                      animate={{
                        x: [0, 3, 0],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="
                        relative
                        w-[155px]
                        sm:w-[175px]
                        md:w-[195px]
                        rounded-lg
                        overflow-hidden
                        bg-blue-500/[0.12]
                        border
                        border-blue-400/25
                        shadow-sm
                      "
                    >
                      <div className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-sm bg-blue-400" />

                          <span className="text-[9px] md:text-[10px] font-medium">
                            when program starts
                          </span>
                        </div>
                      </div>
                    </motion.div>

                    {/* CONNECTOR */}
                    <div className="ml-[24px] w-px h-4 bg-gradient-to-b from-blue-400/50 to-pink-400/50" />

                    {/* BLOCK 2 */}
                    <motion.div
                      animate={{
                        x: [0, 4, 0],
                      }}
                      transition={{
                        duration: 4.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="
                        ml-5
                        w-[170px]
                        sm:w-[190px]
                        md:w-[210px]
                        rounded-lg
                        bg-pink-500/[0.12]
                        border
                        border-pink-400/25
                        shadow-sm
                      "
                    >
                      <div className="px-3 py-2.5">

                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-sm bg-pink-400" />

                          <span className="text-[9px] md:text-[10px] font-medium">
                            set RGB color
                          </span>
                        </div>

                        <div className="flex gap-1.5">
                          <div className="px-2 py-1 rounded bg-red-500/15 border border-red-400/20">
                            <span className="text-[8px] opacity-70">
                              R 255
                            </span>
                          </div>

                          <div className="px-2 py-1 rounded bg-green-500/15 border border-green-400/20">
                            <span className="text-[8px] opacity-70">
                              G 0
                            </span>
                          </div>

                          <div className="px-2 py-1 rounded bg-blue-500/15 border border-blue-400/20">
                            <span className="text-[8px] opacity-70">
                              B 0
                            </span>
                          </div>
                        </div>

                      </div>
                    </motion.div>

                    {/* CONNECTOR */}
                    <div className="ml-[44px] w-px h-4 bg-gradient-to-b from-pink-400/50 to-purple-400/50" />

                    {/* BLOCK 3 */}
                    <motion.div
                      animate={{
                        x: [0, 3, 0],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="
                        ml-10
                        w-[145px]
                        sm:w-[165px]
                        md:w-[180px]
                        rounded-lg
                        bg-purple-500/[0.12]
                        border
                        border-purple-400/25
                        shadow-sm
                      "
                    >
                      <div className="px-3 py-2.5">

                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-sm bg-purple-400" />

                          <span className="text-[9px] md:text-[10px] font-medium">
                            wait
                          </span>

                          <div className="ml-auto px-2 py-1 rounded bg-white/5">
                            <span className="text-[8px]">
                              1 sec
                            </span>
                          </div>
                        </div>

                      </div>
                    </motion.div>

                  </div>

                  {/* ================= CODE PREVIEW ================= */}
                  <div className="mt-6">

                    <div className="flex items-center gap-2 mb-2">
                      <Code2 className="w-3 h-3 text-cyan-500" />

                      <span className="text-[8px] md:text-[9px] uppercase tracking-widest opacity-40">
                        Arduino Code
                      </span>
                    </div>

                    <div
                      className="
                        rounded-lg
                        border
                        border-white/10
                        bg-black/10
                        dark:bg-black/30
                        p-3
                        font-mono
                        text-[8px]
                        md:text-[9px]
                        leading-relaxed
                        overflow-hidden
                      "
                    >
                      <div className="opacity-30">
                        // Generated by QUBI
                      </div>

                      <div>
                        <span className="text-cyan-500">
                          setRGB
                        </span>
                        <span className="opacity-60">
                          (255, 0, 0);
                        </span>
                      </div>

                      <div>
                        <span className="text-cyan-500">
                          delay
                        </span>
                        <span className="opacity-60">
                          (1000);
                        </span>
                      </div>
                    </div>

                  </div>

                </div>
              </div>

              {/* ================= BOTTOM FLOW ================= */}
              <div
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  md:gap-3
                  px-4
                  py-3
                  border-t
                  border-white/10
                  text-[8px]
                  md:text-[9px]
                  uppercase
                  tracking-widest
                "
              >
                <span className="text-cyan-500 font-medium">
                  Blocks
                </span>

                <span className="opacity-25">→</span>

                <span className="opacity-60">
                  Code
                </span>

                <span className="opacity-25">→</span>

                <span className="text-purple-500 font-medium">
                  ESP32
                </span>
              </div>

            </div>

            {/* Glow */}
            <div
              className="
                absolute
                -inset-1
                rounded-2xl
                bg-gradient-to-r
                from-cyan-500/20
                via-blue-500/20
                to-purple-500/20
                blur-xl
                -z-10
              "
            />
          </motion.div>

          {/* =========================================================
              RIGHT — TEXT
          ========================================================= */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="space-y-7"
          >

            <div>
              <p className="text-xs uppercase tracking-widest opacity-50 mb-2">
                Learn • Build • Create
              </p>

              <h3 className="text-2xl md:text-3xl font-semibold">
                From Blocks to Hardware
              </h3>

              <div className="mt-3 h-[2px] w-14 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" />
            </div>

            <p className="leading-relaxed text-sm md:text-base max-w-xl opacity-80">
              QUBI makes technology easier to understand by connecting
              visual programming with real electronics. Students can create
              programs, experiment in a simulator and turn their ideas into
              real hardware projects.
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {features.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.08,
                    }}
                    className="flex gap-3"
                  >
                    <div className="shrink-0">
                      <Icon className={`w-5 h-5 mt-1 ${feature.color}`} />
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold">
                        {feature.title}
                      </h4>

                      <p className="text-xs leading-relaxed opacity-60 mt-1">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* CTA */}
            <div className="pt-2">
              <a
                href="https://qubi.abvoltindia.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex"
              >
                <GlassButton>
                  Explore QUBI →
                </GlassButton>
              </a>
            </div>

          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
