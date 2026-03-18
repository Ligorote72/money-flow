import React from 'react';
import { supabase } from '../utils/supabaseClient';

const Login = () => {
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) console.error('Error login:', error.message);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--bg-color)',
      color: 'var(--text-color)',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div style={{
        background: 'var(--card-bg)',
        padding: '40px',
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        maxWidth: '400px',
        width: '100%',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>💰</div>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: '800', 
          marginBottom: '10px',
          background: 'linear-gradient(135deg, #007AFF, #00C6FF)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          MoneyFlow
        </h1>
        <p style={{ opacity: 0.7, marginBottom: '40px', lineHeight: '1.6' }}>
          Tus finanzas bajo control, sincronizadas en todos tus dispositivos.
        </p>

        <button 
          onClick={handleGoogleLogin}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            width: '100%',
            padding: '16px',
            borderRadius: '14px',
            border: 'none',
            background: '#ffffff',
            color: '#000000',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'transform 0.2s, background 0.2s',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#f0f0f0'}
          onMouseOut={(e) => e.currentTarget.style.background = '#ffffff'}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <img 
            src="https://www.google.com/favicon.ico" 
            alt="Google" 
            style={{ width: '20px', height: '20px' }} 
          />
          Continuar con Google
        </button>

        <p style={{ marginTop: '30px', fontSize: '13px', opacity: 0.5 }}>
          Seguro. Privado. Inteligente.
        </p>
      </div>
    </div>
  );
};

export default Login;
