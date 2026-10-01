import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturó un error:', error, errorInfo);
  }

  handleReset = () => {
    localStorage.removeItem('moneyflow_pin_hash');
    localStorage.removeItem('moneyflow_credential_id');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#06090f',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 59, 48, 0.15)',
            color: '#ff3b30',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            marginBottom: '20px'
          }}>
            ⚠️
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '8px' }}>
            Hubo un problema al cargar la pantalla
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem', maxWidth: '340px', marginBottom: '24px', lineHeight: '1.4' }}>
            {this.state.error?.message || 'Ocurrió un error inesperado al renderizar la aplicación.'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '280px' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: 'var(--primary, #34c759)',
                color: '#000',
                border: 'none',
                padding: '14px',
                borderRadius: '14px',
                fontWeight: '700',
                fontSize: '0.95rem',
                cursor: 'pointer'
              }}
            >
              🔄 Recargar aplicación
            </button>
            <button
              onClick={this.handleReset}
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '14px',
                borderRadius: '14px',
                fontWeight: '600',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              Restablecer PIN y recargar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
