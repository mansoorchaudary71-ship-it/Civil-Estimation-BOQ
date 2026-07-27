import React, { useRef } from 'react';
import CountUp from 'react-countup';
import { useInView } from 'framer-motion';

interface AnimatedCounterProps {
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  decimals?: number;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  end,
  suffix = '',
  prefix = '',
  duration = 2.5,
  decimals = 0,
  className = '',
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div ref={ref} className={className}>
      {isInView ? (
        <CountUp
          start={0}
          end={end}
          duration={duration}
          separator=","
          decimals={decimals}
          prefix={prefix}
          suffix={suffix}
          useEasing={true}
        />
      ) : (
        <span>{prefix}0{suffix}</span>
      )}
    </div>
  );
};
