"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { LampContainer } from "../ui/lamp";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

export default function GetStarted() {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    // "start 90%" ensures animation starts slightly before it hits bottom of screen
    offset: ["start 90%", "center center"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [80, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.96, 1]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.2, 1]);

  return (
    // FIXED: Added 'min-h-[50vh]' or 'min-h-screen' to ensure the ref has height 
    // and 'relative' to contain the LampContainer properly.
    <section ref={ref} className="relative w-full min-h-[60vh] flex flex-col items-center justify-center">
      <LampContainer>
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

        <motion.div
          className="mt-10"
          style={{ y, opacity, scale }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <Link to="/login">
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
          </Link>
        </motion.div>
      </LampContainer>
    </section>
  );
}