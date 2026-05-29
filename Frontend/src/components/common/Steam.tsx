import type { CSSProperties } from 'react';

interface SteamProps {
  width?: number;
  height?: number;
  style?: CSSProperties;
}

export function Steam({ width = 60, height = 40, style }: SteamProps) {
  return (
    <svg className="cg-steam" viewBox="0 0 60 40" width={width} height={height} style={style}>
      <path d="M15 36 C 12 28, 22 24, 18 16 S 24 6, 22 2"/>
      <path d="M30 36 C 28 28, 36 24, 32 16 S 38 6, 36 2"/>
      <path d="M45 36 C 42 28, 50 24, 46 16 S 52 6, 50 2"/>
    </svg>
  );
}
