'use client';

import { motion } from 'framer-motion';

const WaveAnimation = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 opacity-30">
        {[1, 2, 3].map((index) => (
          <motion.div
            key={index}
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, transparent 0%, rgba(209, 196, 233, 0.${index + 2}) 100%)`,
            }}
            animate={{
              y: [0, -20, 0],
            }}
            transition={{
              duration: 5 + index,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.5,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default WaveAnimation;
