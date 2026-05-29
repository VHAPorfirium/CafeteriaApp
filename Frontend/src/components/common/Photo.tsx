import type { CSSProperties, ReactNode } from 'react';

interface PhotoProps {
  tag?: string;
  tone?: 'wood' | 'light' | 'dark';
  src?: string | null;
  alt?: string;
  children?: ReactNode;
  style?: CSSProperties;
  radius?: number;
}

export function Photo({
  tag, tone = 'wood', src, alt = '', children, style, radius = 12,
}: PhotoProps) {
  const cls = tone === 'light' ? 'cg-photo cg-photo-light'
    : tone === 'dark' ? 'cg-photo cg-photo-dark'
    : 'cg-photo';

  return (
    <div className={cls} style={{ width: '100%', height: '100%', borderRadius: radius, ...style }}>
      {src ? (
        <img
          src={src}
          alt={alt}
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: radius, display: 'block' }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
      ) : null}
      {tag && !src && <span className="cg-photo-tag">{tag}</span>}
      {children}
    </div>
  );
}
