import React from 'react';

/**
 * ShineBorder inspirado en Magic UI.
 * Añade un marco con halo luminoso rotativo alrededor de tarjetas premium.
 */
export default function ShineBorder({ 
  children, 
  borderRadius = 28, 
  borderWidth = 1.5, 
  duration = 8, 
  color = ['#c4fb6d', '#007AFF', '#c4fb6d'], 
  className = '',
  style = {}
}) {
  const gradientColors = Array.isArray(color) ? color.join(', ') : color;

  return (
    <div
      className={`shine-border-container ${className}`}
      style={{
        position: 'relative',
        borderRadius: `${borderRadius}px`,
        padding: `${borderWidth}px`,
        overflow: 'hidden',
        background: 'transparent',
        ...style
      }}
    >
      <div
        className="shine-border-glow"
        style={{
          position: 'absolute',
          inset: '-150%',
          background: `conic-gradient(from 0deg, transparent 0 340deg, ${gradientColors} 360deg)`,
          animation: `shine-rotate ${duration}s linear infinite`,
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'relative',
          borderRadius: `${borderRadius - borderWidth}px`,
          background: 'var(--surface-color)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          height: '100%',
          width: '100%',
          zIndex: 1
        }}
      >
        {children}
      </div>
    </div>
  );
}
