import { Icon } from './Icon';

interface QtyProps {
  value?: number;
  onMinus?: () => void;
  onPlus?: () => void;
  sm?: boolean;
}

export function Qty({ value = 1, onMinus, onPlus, sm }: QtyProps) {
  const h = sm ? 32 : 40;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 0,
      height: h, border: '1.5px solid var(--c-border)',
      borderRadius: 'var(--r-md)', overflow: 'hidden', background: 'var(--c-card)',
    }}>
      <button
        type="button"
        onClick={onMinus}
        style={{
          width: h, height: h, background: 'transparent', border: 'none', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-ink)',
        }}
      ><Icon name="minus" size={sm ? 14 : 16}/></button>
      <span style={{ minWidth: h, textAlign: 'center', fontWeight: 600, fontSize: sm ? 14 : 15 }}>{value}</span>
      <button
        type="button"
        onClick={onPlus}
        style={{
          width: h, height: h, background: 'transparent', border: 'none', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-ink)',
        }}
      ><Icon name="plus" size={sm ? 14 : 16}/></button>
    </div>
  );
}
