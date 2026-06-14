'use client';

import { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function InteractiveBackground() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth out the movement
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-bg-primary">
      {/* Main cursor glow */}
      <motion.div
        className="absolute h-[600px] w-[600px] rounded-full bg-brand-500/20 blur-[100px]"
        style={{
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      />
      {/* Subtle secondary glow */}
      <motion.div
        className="absolute h-[800px] w-[800px] rounded-full bg-blue-500/10 blur-[120px]"
        style={{
          x: springX,
          y: springY,
          translateX: '-30%',
          translateY: '-70%',
        }}
      />
    </div>
  );
}
