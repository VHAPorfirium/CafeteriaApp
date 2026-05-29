interface LogoProps {
  dark?: boolean;
  size?: number;
}

export function Logo({ dark, size = 1 }: LogoProps) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 * size }}>
      <div style={{
        width: 40 * size, height: 40 * size, borderRadius: '50%',
        background: dark ? 'var(--c-accent)' : 'var(--c-primary)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: dark ? 'var(--c-dark)' : 'var(--c-bg)',
        fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 20 * size, lineHeight: 1,
      }}>C</div>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{
          fontFamily: 'var(--f-display)', fontWeight: 700,
          fontSize: 22 * size, color: dark ? 'var(--c-dark-ink)' : 'var(--c-ink)',
          letterSpacing: '-0.02em',
        }}>Café & Grão</span>
        <span className="hand" style={{
          fontSize: 14 * size, color: dark ? 'var(--c-accent)' : 'var(--c-secondary)',
          marginTop: 2 * size,
        }}>desde 2018</span>
      </div>
    </div>
  );
}
