import React, { useState, useEffect } from 'react';
import { useSettings, THEMES } from '../context/SettingsContext';
import { hasLocalPin, savePinLocally, clearLocalPin, verifyPin } from '../utils/crypto';

const SettingsTab = () => {
  const { username, setUsername, darkMode, setDarkMode, themeId, setThemeId } = useSettings();
  const [nameInput, setNameInput] = useState(username);
  
  // PIN Estado
  const [isPinEnabled, setIsPinEnabled] = useState(hasLocalPin());
  const [showPinModal, setShowPinModal] = useState(false);
  const [modalMode, setModalMode] = useState(''); // 'setup', 'confirm', 'disable'
  const [pinInput, setPinInput] = useState('');
  const [tempPin, setTempPin] = useState('');
  const [errorInput, setErrorInput] = useState('');

  const handleSaveName = () => setUsername(nameInput.trim());

  // Manejo de Configuración del PIN
  const handleTogglePin = () => {
    if (isPinEnabled) {
      setModalMode('disable');
    } else {
      setModalMode('setup');
    }
    setPinInput('');
    setTempPin('');
    setErrorInput('');
    setShowPinModal(true);
  };

  const handlePinSubmit = async () => {
    if (pinInput.length !== 4) {
      setErrorInput('El PIN debe tener 4 dígitos');
      return;
    }

    if (modalMode === 'setup') {
      setTempPin(pinInput);
      setPinInput('');
      setModalMode('confirm');
    } else if (modalMode === 'confirm') {
      if (pinInput === tempPin) {
        await savePinLocally(pinInput);
        setIsPinEnabled(true);
        setShowPinModal(false);
      } else {
        setErrorInput('Los PINs no coinciden');
        setPinInput('');
      }
    } else if (modalMode === 'disable') {
      const storedHash = localStorage.getItem('moneyflow_pin_hash');
      const isValid = await verifyPin(pinInput, storedHash);
      if (isValid) {
        clearLocalPin();
        setIsPinEnabled(false);
        setShowPinModal(false);
      } else {
        setErrorInput('PIN incorrecto');
        setPinInput('');
      }
    }
  };

  return (
    <div className="card animate-fade" style={{ marginTop: '0', position: 'relative' }}>
      <h3 style={{ fontSize: '1rem', marginBottom: '20px' }}>⚙️ Configuración</h3>

      {/* Nombre */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>
          Tu nombre
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="Ej: Carlos"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            style={{ flex: 1 }}
          />
          <button
            onClick={handleSaveName}
            className="btn-primary"
            style={{ padding: '12px 18px', fontSize: '0.85rem' }}
          >Guardar</button>
        </div>
      </div>

      {/* Seguridad: PIN */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 0', borderTop: '1px solid rgba(255,255,255,0.07)', marginBottom: '4px'
      }}>
        <div>
          <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>Bloqueo con PIN</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            {isPinEnabled ? '🔐 PIN activado' : '🔓 PIN desactivado'}
          </p>
        </div>
        <button
          onClick={handleTogglePin}
          style={{
            width: '52px', height: '30px', borderRadius: '15px', border: 'none',
            background: isPinEnabled ? 'var(--income)' : 'rgba(120,120,128,0.32)',
            cursor: 'pointer', position: 'relative', transition: 'background 0.3s ease',
            flexShrink: 0,
          }}
        >
          <div style={{
            position: 'absolute', top: '3px',
            left: isPinEnabled ? '25px' : '3px',
            width: '24px', height: '24px', borderRadius: '50%',
            background: 'white', transition: 'left 0.3s ease',
            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
          }} />
        </button>
      </div>

      {/* Modo oscuro/claro */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 0', borderTop: '1px solid rgba(255,255,255,0.07)', marginBottom: '4px'
      }}>
        <div>
          <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>Modo {darkMode ? 'Oscuro' : 'Claro'}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            {darkMode ? '🌙 Tema oscuro activo' : '☀️ Tema claro activo'}
          </p>
        </div>
        <button
          onClick={() => setDarkMode(d => !d)}
          style={{
            width: '52px', height: '30px', borderRadius: '15px', border: 'none',
            background: darkMode ? 'var(--primary)' : 'rgba(120,120,128,0.32)',
            cursor: 'pointer', position: 'relative', transition: 'background 0.3s ease',
            flexShrink: 0,
          }}
        >
          <div style={{
            position: 'absolute', top: '3px',
            left: darkMode ? '25px' : '3px',
            width: '24px', height: '24px', borderRadius: '50%',
            background: 'white', transition: 'left 0.3s ease',
            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
          }} />
        </button>
      </div>

      {/* Temas Premium */}
      <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <p style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '4px' }}>Temas Premium</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '16px' }}>
          Personaliza la estética de tu flujo financiero
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => setThemeId(t.id)}
              style={{
                padding: '12px', borderRadius: '16px', border: '1px solid',
                display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer',
                transition: 'all 0.2s', position: 'relative',
                borderColor: themeId === t.id ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                background: themeId === t.id ? 'rgba(var(--primary-rgb), 0.1)' : 'rgba(255,255,255,0.03)',
              }}
            >
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: t.primary, border: '1px solid rgba(255,255,255,0.1)' }} />
                <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: t.bg, border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <span style={{ fontSize: '0.8rem', color: themeId === t.id ? 'var(--primary)' : 'var(--text-main)', fontWeight: '600' }}>
                {t.label}
              </span>
              {themeId === t.id && (
                <div style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '0.7rem' }}>✨</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Modal del PIN */}
      {showPinModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card animate-fade" style={{ width: '90%', maxWidth: '320px', margin: 0 }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '8px', textAlign: 'center' }}>
              {modalMode === 'setup' && 'Crea un PIN (4 dígitos)'}
              {modalMode === 'confirm' && 'Confirma tu PIN'}
              {modalMode === 'disable' && 'Ingresa tu PIN actual'}
            </h4>
            
            <input 
              type="password" 
              inputMode="numeric"
              maxLength={4}
              value={pinInput}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setPinInput(val);
                setErrorInput('');
              }}
              autoFocus
              style={{
                fontSize: '2rem', textAlign: 'center', letterSpacing: '14px', padding: '16px',
                background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.2)'
              }}
            />
            
            {errorInput && <p style={{ color: 'var(--expense)', fontSize: '0.8rem', textAlign: 'center', marginTop: '8px' }}>{errorInput}</p>}
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button 
                onClick={() => setShowPinModal(false)}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-main)' }}
              >Cancelar</button>
              <button 
                onClick={handlePinSubmit}
                className="btn-primary"
                style={{ flex: 1, padding: '12px', borderRadius: '12px' }}
              >Confirmar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SettingsTab;

