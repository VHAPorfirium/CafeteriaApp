import type { CSSProperties, ReactNode } from 'react';

export type IconName =
  | 'search' | 'heart' | 'heart-fill' | 'cart' | 'plus' | 'minus'
  | 'star' | 'star-fill' | 'user' | 'menu' | 'close'
  | 'chevR' | 'chevL' | 'chevD' | 'chevU'
  | 'bell' | 'home' | 'box' | 'grid' | 'chart' | 'users' | 'tag' | 'receipt'
  | 'pin' | 'clock' | 'settings' | 'logout' | 'edit' | 'trash' | 'filter'
  | 'upload' | 'check' | 'eye' | 'coffee' | 'leaf' | 'sparkle' | 'drag'
  | 'sort' | 'pkg' | 'card' | 'pix' | 'refresh' | 'fire' | 'location'
  | 'phone' | 'mail';

const paths: Record<IconName, ReactNode> = {
  search: (<><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>),
  heart: <path d="M12 21s-7-4.5-9.5-9A5 5 0 0 1 12 6.5 5 5 0 0 1 21.5 12C19 16.5 12 21 12 21Z"/>,
  'heart-fill': <path d="M12 21s-7-4.5-9.5-9A5 5 0 0 1 12 6.5 5 5 0 0 1 21.5 12C19 16.5 12 21 12 21Z" fill="currentColor"/>,
  cart: (<><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M3 4h2l2.5 12h12L22 8H6"/></>),
  plus: <path d="M12 5v14M5 12h14"/>,
  minus: <path d="M5 12h14"/>,
  star: <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>,
  'star-fill': <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" fill="currentColor"/>,
  user: (<><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></>),
  menu: <path d="M4 6h16M4 12h16M4 18h16"/>,
  close: <path d="m6 6 12 12M18 6 6 18"/>,
  chevR: <path d="m9 6 6 6-6 6"/>,
  chevL: <path d="m15 6-6 6 6 6"/>,
  chevD: <path d="m6 9 6 6 6-6"/>,
  chevU: <path d="m6 15 6-6 6 6"/>,
  bell: (<><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 7H4c0-1 2-2 2-7Z"/><path d="M10 19a2 2 0 0 0 4 0"/></>),
  home: (<><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/></>),
  box: (<><path d="M3 7 12 3l9 4-9 4-9-4Z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/></>),
  grid: (<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>),
  chart: (<><path d="M3 21h18"/><path d="M6 17v-5M11 17V8M16 17v-3M20 17v-9"/></>),
  users: (<><circle cx="9" cy="9" r="3.5"/><path d="M2.5 20c.8-3.5 3.5-5 6.5-5s5.7 1.5 6.5 5"/><path d="M17 11a3 3 0 1 0 0-6"/><path d="M21.5 19c-.4-2-1.7-3.5-4-4"/></>),
  tag: (<><path d="M3 12V4h8l10 10-8 8Z"/><circle cx="8" cy="9" r="1.5"/></>),
  receipt: (<><path d="M5 3h14v18l-3-2-3 2-2-2-3 2-3-2Z"/><path d="M9 8h6M9 12h6M9 16h4"/></>),
  pin: (<><path d="M12 22s-7-7-7-12a7 7 0 1 1 14 0c0 5-7 12-7 12Z"/><circle cx="12" cy="10" r="2.5"/></>),
  clock: (<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>),
  settings: (<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></>),
  logout: (<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/></>),
  edit: (<><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4Z"/></>),
  trash: (<><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6 18 21H6L5 6"/></>),
  filter: <path d="M3 5h18l-7 9v6l-4-2v-4Z"/>,
  upload: (<><path d="M12 4v12"/><path d="m7 9 5-5 5 5"/><path d="M5 20h14"/></>),
  check: <path d="m5 12 5 5 9-11"/>,
  eye: (<><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>),
  coffee: (<><path d="M4 8h14v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5Z"/><path d="M18 10h2a2 2 0 0 1 0 4h-2"/><path d="M8 2c0 1.5-1 2-1 3.5S8 7 8 8M12 2c0 1.5-1 2-1 3.5s1 1.5 1 2.5"/></>),
  leaf: (<><path d="M5 19c0-8 6-14 16-14 0 10-6 16-16 16Z"/><path d="M5 19 15 9"/></>),
  sparkle: (<><path d="M12 3v6M12 15v6M3 12h6M15 12h6"/><path d="m6 6 3.5 3.5M14.5 14.5 18 18M6 18l3.5-3.5M14.5 9.5 18 6"/></>),
  drag: (<><circle cx="9" cy="6" r="1.2"/><circle cx="15" cy="6" r="1.2"/><circle cx="9" cy="12" r="1.2"/><circle cx="15" cy="12" r="1.2"/><circle cx="9" cy="18" r="1.2"/><circle cx="15" cy="18" r="1.2"/></>),
  sort: (<><path d="M7 4v16M7 4 4 7M7 4l3 3"/><path d="M17 20V4M17 20l-3-3M17 20l3-3"/></>),
  pkg: (<><path d="M3 7v10l9 4 9-4V7l-9-4Z"/><path d="m3 7 9 4 9-4M12 11v10"/></>),
  card: (<><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h3"/></>),
  pix: (<><path d="m12 3 9 9-9 9-9-9Z"/><circle cx="12" cy="12" r="2"/></>),
  refresh: (<><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/></>),
  fire: <path d="M12 2s4 4 4 8a4 4 0 0 1-8 0c0-2 1-3 1-3s-2 2-2 5a6 6 0 0 0 12 0c0-6-7-10-7-10Z"/>,
  location: (<><circle cx="12" cy="10" r="3"/><path d="M12 22s-8-7-8-12a8 8 0 1 1 16 0c0 5-8 12-8 12Z"/></>),
  phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1A19.5 19.5 0 0 1 5 12.7 19.8 19.8 0 0 1 1.9 4.1 2 2 0 0 1 3.9 2H7a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6.3 6.3l1.3-1.3a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6A2 2 0 0 1 22 16.9Z"/>,
  mail: (<><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 7 9-7"/></>),
};

interface IconProps {
  name: IconName;
  size?: number;
  stroke?: number;
  color?: string;
  style?: CSSProperties;
}

export function Icon({ name, size = 18, stroke = 1.7, color, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      style={{ width: size, height: size, display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      fill="none"
      stroke={color || 'currentColor'}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || null}
    </svg>
  );
}
