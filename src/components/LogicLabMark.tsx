import React from 'react';

interface LogicLabMarkProps {
  className?: string;
  size?: number;
}

export function LogicLabMark({ className = '', size = 24 }: LogicLabMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M 5 19 H 12 V 12 H 19 V 5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-violet-400"
      />
      <circle cx="5" cy="19" r="3.5" fill="currentColor" className="text-violet-500" />
      <circle cx="12" cy="12" r="3.5" fill="currentColor" className="text-violet-500" />
      <circle cx="19" cy="5" r="3.5" fill="currentColor" className="text-amber-500" />
    </svg>
  );
}
