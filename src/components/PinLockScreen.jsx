import React, { useState, useEffect } from 'react';
import { verifyPin, clearLocalPin } from '../utils/crypto';
import { LogOut, Delete } from 'lucide-react';

export default function PinLockScreen({ onUnlock, onLogout }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (pin.length === 4) {
      handleVerify(pin);
    }
  }, [pin]);

  const handleVerify = async (currentPin) => {
    const storedHash = localStorage.getItem('moneyflow_pin_hash');
    const isValid = await verifyPin(currentPin, storedHash);
    
    if (isValid) {
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => {
        setPin('');
        setError(false);
      }, 500); // 500ms shake and wait
    }
  };

  const handleNumberClick = (num) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError(false);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const handleForgotPin = () => {
    if(window.confirm('¿Olvidaste tu PIN? Si cierras sesión, se borrará el PIN actual, pero tendrás que volver a iniciar sesión con Google.')) {
      clearLocalPin();
      onLogout(); // Llamamos la función de cierre de sesión desde App.jsx
    }
  };

  // Botones del teclado: 1-9, luego vacío, 0, retroceso
  const keys = [
    1, 2, 3,
    4, 5, 6,
    7, 8, 9,
    null, 0, 'delete'
  ];

  return (
    <div className={`animate-fade ${error ? 'animate-shake' : ''}`} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'var(--bg-color)', zIndex: 100,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', maxWidth: '300px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '64px', height: '64px', backgroundColor: 'rgba(52, 199, 89, 0.15)',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: '28px'
          }}>
            🔐
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', marginBottom: '8px' }}>MoneyFlow</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Ingresa tu PIN</p>
        </div>

        {/* PIN Indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '50px' }}>
          {[0, 1, 2, 3].map((index) => (
            <div 
              key={index}
              style={{
                width: '14px', height: '14px', borderRadius: '50%',
                backgroundColor: error ? 'var(--expense)' : (pin.length > index ? 'var(--primary)' : 'rgba(255,255,255,0.15)'),
                transition: 'all 0.2s ease',
                transform: pin.length > index ? 'scale(1.2)' : 'scale(1)'
              }}
            />
          ))}
        </div>

        {/* Keypad */}
        <div style={{ 
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px 20px', 
          width: '100%', maxWidth: '280px', margin: '0 auto' 
        }}>
          {keys.map((key, index) => {
            if (key === null) return <div key={index} />;
            
            if (key === 'delete') {
              return (
                <button
                  key={index}
                  onClick={handleDelete}
                  style={{
                    backgroundColor: 'transparent', border: 'none', color: 'var(--text-dim)',
                    height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', borderRadius: '50%', fontSize: '1.2rem',
                    transition: 'background 0.2s'
                  }}
                  onPointerDown={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                  onPointerUp={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onPointerCancel={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Delete size={28} />
                </button>
              );
            }

            return (
              <button
                key={index}
                onClick={() => handleNumberClick(key)}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.03)',
                  color: 'white', height: '65px', borderRadius: '50%', fontSize: '1.7rem', fontWeight: '400',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'background 0.1s', userSelect: 'none'
                }}
                onPointerDown={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
                onPointerUp={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'}
                onPointerCancel={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'}
              >
                {key}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer actions */}
      <button 
        onClick={handleForgotPin}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'auto',
          backgroundColor: 'transparent', border: 'none', color: 'var(--text-dim)',
          padding: '16px', fontSize: '0.85rem', cursor: 'pointer'
        }}
      >
        <LogOut size={16} />
        <span>Cerrar Sesión</span>
      </button>
    </div>
  );
}
