import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

interface StatProps {
  end: number;
  label: string;
  suffix?: string;
  duration?: number;
}

const AnimatedCounter: React.FC<StatProps> = ({
  end,
  label,
  suffix = "",
  duration = 2,
}) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    const controls = animate(count, end, {
      duration,
      ease: "easeOut",
    });

    return controls.stop;
  }, [count, end, duration]);

  useEffect(() => {
    const unsubscribe = rounded.on("change", (latest) => {
      setDisplayValue(latest.toString());
    });

    return () => unsubscribe();
  }, [rounded]);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex items-baseline">
        <motion.span
          className="text-5xl font-medium text-gray-900 md:text-6xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {displayValue}
        </motion.span>
        <motion.span
          className="text-5xl font-bold text-[#2DB8D1] md:text-6xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {suffix}
        </motion.span>
      </div>
      <motion.p
        className="mt-3 text-xl text-gray-500"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {label}
      </motion.p>
    </div>
  );
};

export default function StatsComponent() {
  const stats = [
    { end: 98, label: "Satisfaction rate", suffix: "%" },
    { end: 200, label: "Properties sold", suffix: "+" },
    { end: 500, label: "Project done", suffix: "+" },
    { end: 90, label: "Happy Clients", suffix: "%" },
  ];

  return (
    <div className="mt-[50px] flex items-center justify-center bg-white">
      <motion.div
        className="w-full max-w-7xl rounded-3xl bg-[#EDF3FF] p-8 md:p-16"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid grid-cols-2 gap-12 md:gap-8 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="relative">
              <AnimatedCounter
                end={stat.end}
                label={stat.label}
                suffix={stat.suffix}
                duration={4.5}
              />
              {index < stats.length - 1 && (
                <div className="absolute right-0 top-1/2 hidden h-2 w-2 -translate-y-1/2 transform rounded-full bg-cyan-400 lg:block" />
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
