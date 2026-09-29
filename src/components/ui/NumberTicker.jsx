import React, { useEffect, useState } from 'react';
import { formatCurrency } from '../../utils/helpers';

/**
 * Componente NumberTicker inspirado en Magic UI.
 * Anima suavemente la transición de valores monetarios con interpolación ease-out.
 */
export default function NumberTicker({ value = 0, duration = 800, className = '', isCurrency = true, hide = false }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (hide) return;
    const startVal = displayValue;
    const endVal = Number(value) || 0;
    if (startVal === endVal) return;

    let startTime = null;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Función de aceleración/desaceleración suave (easeOutCubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (endVal - startVal) * easeOut;
      
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(endVal);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration, hide]);

  if (hide) {
    return <span className={className}>••••••</span>;
  }

  return (
    <span className={className} style={{ fontVariantNumeric: 'tabular-nums', transition: 'color 0.2s' }}>
      {isCurrency ? formatCurrency(Math.round(displayValue)) : Math.round(displayValue).toLocaleString('es-CO')}
    </span>
  );
}
