import React, { useState, useEffect } from 'react';

const BusinessGate = ({ onAccessGranted }) => {
  const [pin, setPin] = useState('');
  const [storedPin, setStoredPin] = useState(null);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupStep, setSetupStep] = useState(1); // 1: Enter new, 2: Confirm new
  const [tempPin, setTempPin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const savedPin = localStorage.getItem('money-flow-business-pin');
    if (savedPin) {
      setStoredPin(savedPin);
    } else {
      setIsSettingUp(true);
    }
  }, []);

  const handleKeyPress = (num) => {
    if (error) setError('');
    if (pin.length < 4) {
      setPin(prev => prev + num);
      if (pin.length + 1 === 4) {
        setTimeout(() => processPin(pin + num), 100);
      }
    }
  };

  const processPin = (enteredPin) => {
    if (isSettingUp) {
      if (setupStep === 1) {
        setTempPin(enteredPin);
        setPin('');
        setSetupStep(2);
      } else {
        if (enteredPin === tempPin) {
          localStorage.setItem('money-flow-business-pin', enteredPin);
          setStoredPin(enteredPin);
          setIsSettingUp(false);
          onAccessGranted();
        } else {
          setError('Los PIN no coinciden. Intenta de nuevo.');
          setPin('');
          setTempPin('');
          setSetupStep(1);
        }
      }
    } else {
      if (enteredPin === storedPin) {
        onAccessGranted();
      } else {
        setError('PIN incorrecto');
        setPin('');
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    if (error) setError('');
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--surface-color)', padding: '30px 20px', borderRadius: '24px', margin: '20px' }}>
      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💼</div>
      
      <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '8px', textAlign: 'center' }}>
        {isSettingUp 
          ? (setupStep === 1 ? 'Crea tu PIN de Negocios' : 'Confirma tu PIN')
          : 'Acceso a Mi Negocio'}
      </h2>
      
      <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '24px', textAlign: 'center' }}>
        {isSettingUp 
          ? 'Este PIN protegerá la privacidad de tus finanzas empresariales.' 
          : 'Ingresa tu PIN para acceder al área de negocios.'}
      </p>

      {/* PIN Dots */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{
            width: '20px', height: '20px', borderRadius: '50%',
            background: i < pin.length ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
            transition: 'background 0.2s'
          }} />
        ))}
      </div>

      {error && (
        <p className="animate-shake" style={{ color: 'var(--expense)', fontSize: '0.9rem', marginBottom: '16px', fontWeight: '600' }}>
          {error}
        </p>
      )}

      {/* Numeric Keypad */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', maxWidth: '300px', width: '100%' }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button key={num} onClick={() => handleKeyPress(num.toString())}
            style={{ padding: '20px', fontSize: '1.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', color: 'white', fontWeight: '600', cursor: 'pointer' }}>
            {num}
          </button>
        ))}
        <div />
        <button onClick={() => handleKeyPress('0')}
          style={{ padding: '20px', fontSize: '1.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', color: 'white', fontWeight: '600', cursor: 'pointer' }}>
          0
        </button>
        <button onClick={handleDelete}
          style={{ padding: '20px', fontSize: '1.2rem', background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
          ⌫
        </button>
      </div>

      {/* Reset PIN option if not setting up */}
      {!isSettingUp && (
        <button 
          onClick={() => {
            if(window.confirm('¿Olvidaste tu PIN? Si lo restableces, perderás acceso a los datos actuales de los negocios por seguridad (debes borrarlos o tener backup). Por ahora, esta acción solo reinicia el PIN.')) {
              localStorage.removeItem('money-flow-business-pin');
              setIsSettingUp(true);
              setSetupStep(1);
              setPin('');
              setError('');
            }
          }}
          style={{ marginTop: '24px', background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '0.8rem', textDecoration: 'underline', cursor: 'pointer' }}
        >
          Olvidé mi PIN
        </button>
      )}
    </div>
  );
};

export default BusinessGate;
