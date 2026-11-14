import React from 'react';
import mark from '../../brand/mark.json';
import wordmark from '../../brand/wordmark.json';

interface LogicLabMarkProps {
  className?: string;
  size?: number;
  color?: string;
  variant?: 'display' | 'small' | 'reverse';
}

export function LogicLabMark({ className = '', size = 24, color = 'currentColor', variant }: LogicLabMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={mark.viewBox}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d={mark[variant || (size <= 20 ? 'small' : 'display')]} fill={color} />
    </svg>
  );
}

export function LogicLabWordmark({ className = '' }: { className?: string }) {
  return (
    <svg width={wordmark.width} height={wordmark.height} viewBox={wordmark.viewBox} className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <path d={wordmark.path} fill="currentColor" />
    </svg>
  );
}
