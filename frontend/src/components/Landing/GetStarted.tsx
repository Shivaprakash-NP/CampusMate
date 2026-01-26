"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { LampContainer } from "../ui/lamp";
import { Button } from "../ui/button";

export default function GetStarted() {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [80, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.96, 1]);

  return (
    <section ref={ref}>
      <LampContainer>
        {/* Heading */}
        <motion.h1
          style={{ y, opacity, scale }}
          className="
            bg-gradient-to-br from-slate-300 to-slate-500
            py-4 bg-clip-text
            text-center text-4xl md:text-7xl
            font-medium tracking-tight
            text-transparent
          "
        >
          Create your own
          <br />
          Study Space
        </motion.h1>

        {/* Button INSIDE lamp */}
        <motion.div
          className="mt-10"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <Button
            variant="outline"
            className="
              px-6 py-6
              rounded-full
              text-sm font-medium
              border-cyan-400/40
              text-[color:#b1bece]
              bg-transparent
              hover:bg-transparent
              hover:text-cyan-200
              focus-visible:ring-cyan-400/40
            "
          >
            Get Started
          </Button>
        </motion.div>
      </LampContainer>
    </section>
  );
}
