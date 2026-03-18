import React from 'react';

const AlertBanner = ({ alerts, onDismiss }) => {
  if (!alerts || alerts.length === 0) return null;

  const colorMap = {
    danger:  { bg: 'rgba(255,59,48,0.12)', border: 'rgba(255,59,48,0.3)', icon: '🚨', text: '#FF453A' },
    warning: { bg: 'rgba(255,159,10,0.12)', border: 'rgba(255,159,10,0.3)', icon: '⚠️', text: '#FF9F0A' },
    success: { bg: 'rgba(52,199,89,0.12)', border: 'rgba(52,199,89,0.3)', icon: '🎉', text: '#34C759' },
    info:    { bg: 'rgba(10,132,255,0.12)', border: 'rgba(10,132,255,0.3)', icon: '💡', text: '#0A84FF' },
  };

  return (
    <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '4px' }}>
      {alerts.map((alert, i) => {
        const style = colorMap[alert.type] || colorMap.info;
        return (
          <div
            key={i}
            className="animate-fade"
            style={{
              background: style.bg,
              border: `1px solid ${style.border}`,
              borderRadius: '16px',
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', flex: 1 }}>
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{style.icon}</span>
              <div>
                <p style={{ fontWeight: '700', color: style.text, fontSize: '0.85rem', marginBottom: '2px' }}>
                  {alert.title}
                </p>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.78rem', lineHeight: 1.4 }}>
                  {alert.message}
                </p>
              </div>
            </div>
            <button
              onClick={() => onDismiss(i)}
              style={{
                background: 'none', border: 'none', color: 'var(--text-dim)',
                cursor: 'pointer', fontSize: '1rem', padding: '0', flexShrink: 0, lineHeight: 1
              }}
            >×</button>
          </div>
        );
      })}
    </div>
  );
};

export default AlertBanner;
