import type { CSSProperties } from 'react';

interface BeanProps {
  size?: number;
  color?: string;
  style?: CSSProperties;
}

export function Bean({ size = 24, color = 'var(--c-secondary)', style }: BeanProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={style} aria-hidden="true">
      <ellipse cx="16" cy="16" rx="9" ry="13" fill={color} transform="rotate(-25 16 16)" />
      <path d="M11 6 C 13 12, 13 20, 21 26" stroke="rgba(255,255,255,.35)" strokeWidth="1.5" fill="none" transform="rotate(-25 16 16)" />
    </svg>
  );
}
