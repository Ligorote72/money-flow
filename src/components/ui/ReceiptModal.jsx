import React from 'react';
import { formatCurrency } from '../../utils/helpers';
import { Share2, CheckCircle2, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ReceiptModal({ receipt, onClose }) {
  if (!receipt) return null;

  const {
    workerName = 'Recolector',
    businessName = 'Finca Cafetera',
    activity = 'Recolección de Café',
    quantity = 0,
    unit = receipt.unitLabel || '@',
    rate = 0,
    total = 0,
    date = new Date().toLocaleString('es-CO'),
    notes = ''
  } = receipt;

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleShareWhatsApp = () => {
    triggerConfetti();
    const text = 
`☕ *COMPROBANTE DE PAGO Y RECOLECCIÓN*
━━━━━━━━━━━━━━━━━━━━
📍 *Lugar:* ${businessName}
🗓️ *Fecha:* ${date}
👷 *Trabajador:* ${workerName}
🛠️ *Labor:* ${activity}
━━━━━━━━━━━━━━━━━━━━
⚖️ *Cantidad:* ${quantity} ${unit}
💵 *Tarifa:* ${formatCurrency(rate)} / ${unit}
💰 *TOTAL LIQUIDADO:* ${formatCurrency(total)}
━━━━━━━━━━━━━━━━━━━━
✅ *Estado:* Pagado y Registrado en MoneyFlow
${notes ? `📝 *Nota:* ${notes}\n` : ''}¡Gracias por su excelente trabajo! 🌿`;

    const encoded = encodeURIComponent(text);
    const url = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div 
      className="animate-fade"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 3000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div 
        className="card"
        style={{
          width: '100%',
          maxWidth: '400px',
          background: 'linear-gradient(180deg, #161a22 0%, #0d1117 100%)',
          borderRadius: '24px',
          border: '1px solid rgba(196, 251, 109, 0.25)',
          padding: '24px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 25px rgba(196, 251, 109, 0.1)',
          position: 'relative'
        }}
      >
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255,255,255,0.06)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-dim)',
            cursor: 'pointer'
          }}
        >
          <X size={16} />
        </button>

        {/* Encabezado del recibo */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '54px', height: '54px',
            borderRadius: '50%',
            background: 'rgba(var(--primary-rgb), 0.15)',
            border: '1px solid var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px',
            fontSize: '1.6rem'
          }}>
            ☕
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'white', marginBottom: '4px' }}>
            Comprobante de Pesada
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600' }}>
            {businessName}
          </p>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
            {date}
          </p>
        </div>

        {/* Detalles del ticket */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '16px',
          padding: '16px',
          border: '1px dashed rgba(255,255,255,0.12)',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Recolector / Operario:</span>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'white' }}>{workerName}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Labor realizada:</span>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'white' }}>{activity}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Pesada / Cantidad:</span>
            <span style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--primary)' }}>
              {quantity} {unit}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Tarifa acordada:</span>
            <span style={{ fontSize: '0.85rem', color: 'white' }}>{formatCurrency(rate)} / {unit}</span>
          </div>

          <div style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)'
          }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'white' }}>Total a Pagar:</span>
            <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#c4fb6d' }}>
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        {/* Botones de acción */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={handleShareWhatsApp}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              padding: '14px',
              borderRadius: '16px',
              background: '#25D366',
              color: '#000',
              fontWeight: '700',
              fontSize: '0.95rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(37, 211, 102, 0.25)',
              transition: 'transform 0.2s'
            }}
          >
            <Share2 size={18} />
            Compartir por WhatsApp
          </button>
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '14px',
              background: 'transparent',
              color: 'var(--text-dim)',
              fontSize: '0.85rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
