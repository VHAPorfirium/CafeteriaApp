interface LoaderProps {
  label?: string;
}

export function Loader({ label = 'Carregando...' }: LoaderProps) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 48, gap: 12, color: 'var(--c-muted)',
    }}>
      <div className="cg-skel" style={{ width: 48, height: 48, borderRadius: '50%' }} />
      <span style={{ fontSize: 14 }}>{label}</span>
    </div>
  );
}
