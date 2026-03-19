import React from 'react';

const LandingPage = ({ onInstallClick, installPromptReady, onSkip }) => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px 20px',
      background: 'radial-gradient(circle at top right, rgba(196, 251, 109, 0.15), transparent 60%), radial-gradient(circle at bottom left, rgba(196, 251, 109, 0.05), transparent 40%), var(--bg-color)',
      color: 'white',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Elements */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '150px',
        height: '150px',
        background: 'var(--primary)',
        filter: 'blur(100px)',
        opacity: 0.3,
        borderRadius: '50%'
      }} />

      <div className="animate-fade" style={{ zIndex: 1, maxWidth: '400px', width: '100%' }}>
        {/* Logo / Icon Area */}
        <div style={{
          width: '80px',
          height: '80px',
          background: 'rgba(196, 251, 109, 0.1)',
          border: '1px solid rgba(196, 251, 109, 0.3)',
          borderRadius: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
          margin: '0 auto 24px',
          boxShadow: '0 8px 32px rgba(196, 251, 109, 0.2)'
        }}>
          💸
        </div>

        <h1 style={{
          fontSize: '2.4rem',
          fontWeight: '800',
          marginBottom: '16px',
          background: 'linear-gradient(135deg, #fff 0%, #a1a1a6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: '1.1'
        }}>
          Toma el control de tu 
          <span style={{ color: 'var(--primary)', WebkitTextFillColor: 'initial', display: 'block', marginTop: '4px' }}>Dinero</span>
        </h1>
        
        <p style={{
          fontSize: '1.05rem',
          color: 'var(--text-dim)',
          marginBottom: '40px',
          lineHeight: '1.5',
          opacity: 0.9
        }}>
          MoneyFlow es la herramienta definitiva para registrar ingresos, controlar gastos y alcanzar tus metas financieras.
        </p>

        {/* Features Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px', textAlign: 'left' }}>
          {[
            { icon: '📝', title: 'Registra Fácilmente', desc: 'Anota tus ingresos y gastos en segundos.' },
            { icon: '📊', title: 'Analiza tu Progreso', desc: 'Visualiza a dónde va tu dinero con gráficas.' },
            { icon: '🎯', title: 'Alcanza tus Metas', desc: 'Ahorra con propósito y sin estrés.' }
          ].map((feat, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <div style={{ fontSize: '1.8rem', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '14px' }}>
                {feat.icon}
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'white' }}>{feat.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '2px' }}>{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button
            onClick={onInstallClick}
            disabled={!installPromptReady && !/iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent)}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '18px',
              fontSize: '1.1rem',
              boxShadow: '0 8px 24px rgba(196, 251, 109, 0.3)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px',
              opacity: (!installPromptReady && !/iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent)) ? 0.7 : 1
            }}
          >
            <span>📱</span> 
            {(!installPromptReady && !/iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent)) ? 'Instalación no disponible' : 'Descargar App'}
          </button>
          
          <button
            onClick={onSkip}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-dim)',
              fontSize: '0.9rem',
              padding: '10px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Continuar en el navegador
          </button>
        </div>

        {/* iOS Install Instruction Helper (Visible only on Apple devices potentially) */}
        {/iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent) && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '20px', opacity: 0.8 }}>
            En iOS, pulsa "Compartir" y luego "Agregar a inicio" para instalar.
          </p>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
