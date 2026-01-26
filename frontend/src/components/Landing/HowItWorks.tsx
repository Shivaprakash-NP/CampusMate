import { motion } from "framer-motion";

const steps = [
  {
    title: "Upload your syllabus",
    description: "Start by adding what you need to study. No formatting stress.",
  },
  {
    title: "Create a study plan",
    description: "Break topics into a structure that makes sense to you.",
  },
  {
    title: "Study in one space",
    description: "Return to the same place every day to stay focused.",
  },
  {
    title: "Track your progress",
    description: "See how far you’ve come, without pressure or guilt.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-32 px-6 text-[rgb(var(--foreground))] flex items-center justify-center">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-semibold text-center mb-20">
          How Campus Mate works
        </h2>

        <div className="relative">
          {/* vertical line */}
          <div className="absolute left-4 top-0 h-full w-px bg-white/10" />

          <div className="space-y-16">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                viewport={{ once: true, amount: 0.3 }}
                className="relative pl-16"
              >
                {/* dot */}
                <div className="absolute left-2 top-1 h-3 w-3 rounded-full bg-[rgb(var(--primary))]" />

                <h3 className="text-lg font-medium">
                  {step.title}
                </h3>
                <p className="mt-2 text-white/70 max-w-md">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <div
  className="
    pointer-events-none
    absolute bottom-0 left-0 w-full h-24
    bg-gradient-to-t from-[rgb(var(--background))] to-transparent
  "
/>

    </section>
  );
};

export default HowItWorks;
