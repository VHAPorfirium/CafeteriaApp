import { Icon } from './Icon';

interface StarsProps {
  value?: number;
  size?: number;
  gap?: number;
}

export function Stars({ value = 4.5, size = 14, gap = 2 }: StarsProps) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <span style={{ display: 'inline-flex', gap }}>
      {[0, 1, 2, 3, 4].map((i) => {
        const filled = i < full || (i === full && half);
        return (
          <Icon
            key={i}
            name={filled ? 'star-fill' : 'star'}
            size={size}
            color={filled ? 'var(--c-accent)' : 'var(--c-border-strong)'}
          />
        );
      })}
    </span>
  );
}
