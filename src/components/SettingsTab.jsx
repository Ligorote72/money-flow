import React, { useState } from 'react';
import { useSettings, THEMES } from '../context/SettingsContext';

const SettingsTab = () => {
  const { username, setUsername, darkMode, setDarkMode, themeId, setThemeId } = useSettings();
  const [nameInput, setNameInput] = useState(username);

  const handleSaveName = () => setUsername(nameInput.trim());

  return (
    <div className="card animate-fade" style={{ marginTop: '0' }}>
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
    </div>
  );
};

export default SettingsTab;
