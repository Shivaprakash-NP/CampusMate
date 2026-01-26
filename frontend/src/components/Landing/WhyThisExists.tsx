import { motion } from "framer-motion";

const WhyThisExists = () => {
  return (
    <motion.section
      className="
        relative min-h-screen px-6
        flex items-center justify-center
        text-[rgb(var(--foreground))]
      "
    >
      <motion.div 
      initial={{ opacity: 0}}
      whileInView={{ opacity: 1}}
      transition={{ duration: 2, ease: "easeOut" }}
      viewport={{ once: true }}
      className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Why Campus Mate exists
        </h2>

        <p className="mt-6 text-base md:text-lg text-[rgb(var(--foreground)/0.75)] leading-relaxed">
          Studying isn’t just about being productive.
          <br />
          It’s about having a space where planning, focus, and progress
          come together — without pressure or guilt.
        </p>
      </motion.div>
    </motion.section>
  );
};

export default WhyThisExists;
