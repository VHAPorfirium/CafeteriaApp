import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
  info: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, info: null };

  static getDerivedStateFromError(error: Error): State {
    return { error, info: null };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
    this.setState({ error, info });
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#FAF6F1', padding: 32, fontFamily: 'DM Sans, system-ui, sans-serif',
      }}>
        <div style={{
          maxWidth: 720, background: '#fff', border: '1px solid #E8DFD3', borderRadius: 16,
          padding: 32, boxShadow: '0 6px 18px rgba(111,78,55,.08)',
        }}>
          <h1 style={{ color: '#B5462E', marginTop: 0, fontFamily: 'Fraunces, serif', fontSize: 28 }}>
            Erro de renderização
          </h1>
          <p style={{ color: '#5B4838', marginTop: 8 }}>
            Cole esse texto no chat para eu corrigir:
          </p>
          <pre style={{
            background: '#F4ECE0', padding: 16, borderRadius: 8, overflow: 'auto',
            fontSize: 13, marginTop: 12, color: '#2B1D14', whiteSpace: 'pre-wrap',
          }}>
            <strong>{this.state.error.name}: {this.state.error.message}</strong>
            {'\n\n'}
            {this.state.error.stack}
            {this.state.info ? '\n\nComponent stack:' + this.state.info.componentStack : ''}
          </pre>
          <button
            type="button"
            onClick={() => location.reload()}
            style={{
              marginTop: 16, padding: '10px 18px', background: '#6F4E37', color: '#FFF8EE',
              border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600,
            }}
          >Recarregar</button>
        </div>
      </div>
    );
  }
}
