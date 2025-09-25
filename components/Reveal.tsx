import React, { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

interface RevealProps {
  children: React.ReactNode;
  delay?: number; // Optional delay for animation
}

export const Reveal: React.FC<RevealProps> = ({ children, delay = 0 }) => {
  const { ref, inView } = useInView({
    triggerOnce: true, // Only trigger the animation once
    threshold: 0.1,    // Trigger when 10% of the component is visible
  });

  const revealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inView && revealRef.current) {
      revealRef.current.style.transitionDelay = `${delay}ms`;
      revealRef.current.classList.add('animate-reveal');
    }
  }, [inView, delay]);

  return (
    <div ref={ref}> {/* Outer div for intersection observer */}
      <div
        ref={revealRef}
        className="relative opacity-0 transform translate-y-10 transition-all duration-700 ease-out" // Moved classes here
        style={{ transitionProperty: 'opacity, transform' }}
      >
        {children}
      </div>
    </div>
  );
};