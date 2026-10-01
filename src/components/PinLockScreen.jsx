import React, { useState, useEffect } from 'react';
import { verifyPin, clearLocalPin } from '../utils/crypto';
import { isBiometricsSupported, hasLocalBiometrics, verifyBiometrics, clearLocalBiometrics } from '../utils/biometrics';
import { LogOut, Delete, Fingerprint, AlertCircle } from 'lucide-react';

export default function PinLockScreen({ onUnlock, onLogout }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [isVerifyingBio, setIsVerifyingBio] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (pin.length === 4) {
      handleVerify(pin);
    }
  }, [pin]);

  useEffect(() => {
    // Intento de desbloqueo biométrico automático solo si el entorno lo permite
    if (hasLocalBiometrics()) {
      verifyBiometrics().then(success => {
        if (success) {
          onUnlock();
        }
      }).catch(err => {
        console.warn('Biometría en carga inicial requiere gesto del usuario:', err);
      });
    }
  }, []);

  const handleBiometrics = async () => {
    if (isVerifyingBio) return;
    setIsVerifyingBio(true);
    setStatusMsg('Verificando huella...');
    try {
      const success = await verifyBiometrics();
      if (success) {
        setStatusMsg('¡Desbloqueado!');
        onUnlock();
      } else {
        setStatusMsg('Huella no reconocida en este dispositivo. Ingresa tu PIN de 4 dígitos.');
        setError(true);
        setTimeout(() => setError(false), 600);
      }
    } catch (err) {
      console.error(err);
      setStatusMsg('La huella no está disponible aquí. Ingresa tu PIN.');
      setError(true);
      setTimeout(() => setError(false), 600);
    } finally {
      setIsVerifyingBio(false);
    }
  };

  const handleVerify = async (currentPin) => {
    const storedHash = localStorage.getItem('moneyflow_pin_hash');
    const isValid = await verifyPin(currentPin, storedHash);
    
    if (isValid) {
      onUnlock();
    } else {
      setStatusMsg('PIN incorrecto. Intenta de nuevo.');
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

  const handleConfirmReset = () => {
    clearLocalPin();
    clearLocalBiometrics();
    setShowLogoutModal(false);
    onLogout();
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
          <p style={{ 
            color: error ? 'var(--expense)' : (statusMsg ? 'var(--primary)' : 'var(--text-dim)'), 
            fontSize: '0.88rem', minHeight: '1.3rem', transition: 'color 0.2s', padding: '0 10px'
          }}>
            {statusMsg || 'Ingresa tu PIN'}
          </p>
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
                  cursor: 'pointer', transition: 'background 0.1s', userSelect: 'none',
                  touchAction: 'manipulation'
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
      <div style={{ display: 'flex', gap: '32px', marginTop: 'auto', padding: '16px' }}>
        {hasLocalBiometrics() && (
          <button 
            onClick={handleBiometrics}
            disabled={isVerifyingBio}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
              backgroundColor: 'transparent', border: 'none', 
              color: isVerifyingBio ? 'var(--text-dim)' : 'var(--primary)',
              cursor: isVerifyingBio ? 'wait' : 'pointer', 
              opacity: isVerifyingBio ? 0.6 : 0.9,
              transition: 'opacity 0.2s', touchAction: 'manipulation'
            }}
          >
            <Fingerprint size={32} />
            <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>
              {isVerifyingBio ? 'Leyendo...' : 'Huella'}
            </span>
          </button>
        )}

        <button 
          onClick={() => setShowLogoutModal(true)}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
            backgroundColor: 'transparent', border: 'none', color: 'var(--text-dim)',
            cursor: 'pointer', touchAction: 'manipulation'
          }}
        >
          <LogOut size={28} />
          <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>Olvidé mi PIN</span>
        </button>
      </div>

      {/* Modal para restablecer PIN o cerrar sesión en móvil */}
      {showLogoutModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px', zIndex: 300
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px', padding: '24px', maxWidth: '340px', width: '100%',
            textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
          }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              backgroundColor: 'rgba(255, 69, 58, 0.15)', color: 'var(--expense)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <AlertCircle size={32} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px', color: 'white' }}>
              ¿Problemas para entrar?
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '24px', lineHeight: '1.4' }}>
              Si no recuerdas tu PIN o el sensor de huella no responde, puedes cerrar sesión para eliminar el bloqueo local y volver a entrar con tu cuenta de Google.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={handleConfirmReset}
                style={{
                  backgroundColor: 'var(--expense)', color: 'white', border: 'none',
                  padding: '14px', borderRadius: '14px', fontWeight: '600', fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Cerrar Sesión y Restablecer
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.08)', color: 'white', border: 'none',
                  padding: '14px', borderRadius: '14px', fontWeight: '500', fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
