import React from 'react';

/**
 * StitchDivider — the brand's signature element.
 * A hand-drawn "running stitch" thread line with a needle,
 * used between sections in place of generic dividers.
 */
const StitchDivider = ({ className = '', animate = true, color = '#D8A7B1' }) => (
  <div className={`w-full flex justify-center ${className}`} aria-hidden="true">
    <svg
      width="160"
      height="28"
      viewBox="0 0 160 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 14 Q 12 2, 22 14 T 42 14 T 62 14 T 82 14 T 102 14 T 122 14 T 142 14 T 158 14"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="8 6"
        className={animate ? 'animate-[stitchDraw_1.6s_ease_forwards]' : ''}
        style={animate ? { strokeDasharray: 300, strokeDashoffset: 300 } : {}}
      />
      <circle cx="14" cy="14" r="2.5" fill={color} />
      <circle cx="146" cy="14" r="2.5" fill={color} />
    </svg>
  </div>
);

export default StitchDivider;
