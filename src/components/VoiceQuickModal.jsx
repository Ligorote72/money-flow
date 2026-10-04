import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, X, ArrowRight, Check, AlertCircle, ArrowLeftRight, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { parseFinancialVoiceCommand } from '../utils/aiVoiceParser.js';
import { formatCurrency } from '../utils/helpers';

export default function VoiceQuickModal({ isOpen, onClose, onApplyTransaction }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedResult, setParsedResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const recognitionRef = useRef(null);

  // Initialize SpeechRecognition if available
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'es-CO'; // Español Colombia / Latino

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMsg('');
      };

      recognition.onresult = (event) => {
        let currentText = '';
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);
        const parsed = parseFinancialVoiceCommand(currentText);
        setParsedResult(parsed);
      };

      recognition.onerror = (event) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMsg('Permiso de micrófono denegado. Puedes escribir la frase abajo.');
        } else if (event.error !== 'no-speech') {
          setErrorMsg('No se detectó audio claro. Intenta de nuevo o escribe.');
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Update parsed result when user types manually
  const handleTextChange = (e) => {
    const val = e.target.value;
    setTranscript(val);
    const parsed = parseFinancialVoiceCommand(val);
    setParsedResult(parsed);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setErrorMsg('Reconocimiento de voz no soportado en este navegador. Escribe tu frase.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setErrorMsg('');
      setTranscript('');
      setParsedResult(null);
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Error starting recognition:', err);
      }
    }
  };

  const handleConfirm = () => {
    if (!parsedResult) return;
    onApplyTransaction(parsedResult);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div style={{
        background: 'linear-gradient(145deg, rgba(18, 24, 38, 0.95), rgba(12, 16, 26, 0.98))',
        border: '1px solid rgba(196, 251, 109, 0.25)',
        boxShadow: '0 20px 45px rgba(0, 0, 0, 0.6), 0 0 30px rgba(196, 251, 109, 0.1)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '460px',
        padding: '24px',
        color: '#fff',
        position: 'relative',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{
            background: 'rgba(196, 251, 109, 0.15)',
            color: '#c4fb6d',
            padding: '8px',
            borderRadius: '12px',
            display: 'flex'
          }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', margin: 0 }}>
              Registro Rápido con IA
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
              Habla o escribe como si le hablaras a un amigo
            </p>
          </div>
        </div>

        {/* Mic Visualizer Button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '24px 0' }}>
          <button
            onClick={toggleListening}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: isListening 
                ? 'linear-gradient(135deg, #ff3b30, #ff6b60)' 
                : 'linear-gradient(135deg, #c4fb6d, #8ef040)',
              color: isListening ? '#fff' : '#090c15',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isListening 
                ? '0 0 25px rgba(255, 59, 48, 0.5)' 
                : '0 0 25px rgba(196, 251, 109, 0.4)',
              transition: 'all 0.25s ease',
              transform: isListening ? 'scale(1.08)' : 'scale(1)'
            }}
          >
            {isListening ? <Mic size={34} strokeWidth={2.5} /> : <Mic size={34} strokeWidth={2.2} />}
          </button>
          <span style={{ fontSize: '0.85rem', color: isListening ? '#ff6b60' : '#c4fb6d', marginTop: '12px', fontWeight: 500 }}>
            {isListening ? 'Escuchando... Di tu movimiento' : 'Toca el micrófono para hablar'}
          </span>
        </div>

        {/* Text Input & Transcription */}
        <div style={{ marginBottom: '16px' }}>
          <textarea
            value={transcript}
            onChange={handleTextChange}
            placeholder='Ej: "Le transferí a Carlos 200.000 y me los dio en efectivo" o "Almuerzo 15 mil en efectivo"'
            rows={2}
            style={{
              width: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '14px',
              padding: '12px 14px',
              color: '#fff',
              fontSize: '0.9rem',
              resize: 'none',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Quick Suggestion Chips */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '18px' }}>
          {[
            'Transferí 200k a Juan y me dio efectivo',
            'Almuerzo 18 mil en efectivo',
            'Pasé 50 mil de la cuenta a efectivo'
          ].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTranscript(chip);
                setParsedResult(parseFinancialVoiceCommand(chip));
              }}
              style={{
                fontSize: '0.72rem',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
                padding: '4px 10px',
                borderRadius: '20px',
                cursor: 'pointer'
              }}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Error message */}
        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#f87171',
            fontSize: '0.8rem',
            marginBottom: '12px'
          }}>
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Detected Result Card */}
        {parsedResult && (
          <div style={{
            background: parsedResult.type === 'transfer' 
              ? 'rgba(0, 122, 255, 0.12)' 
              : parsedResult.type === 'income' 
                ? 'rgba(52, 199, 89, 0.12)' 
                : 'rgba(255, 59, 48, 0.12)',
            border: `1px solid ${parsedResult.type === 'transfer' ? '#007aff' : parsedResult.type === 'income' ? '#34c759' : '#ff3b30'}`,
            borderRadius: '16px',
            padding: '14px',
            marginBottom: '18px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                fontWeight: 700,
                color: parsedResult.type === 'transfer' ? '#60a5fa' : parsedResult.type === 'income' ? '#4ade80' : '#f87171'
              }}>
                {parsedResult.type === 'transfer' ? 'Traspaso entre Cuentas' : parsedResult.type === 'income' ? 'Ingreso' : 'Gasto'}
              </span>
              <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
                {formatCurrency(parsedResult.amount)}
              </span>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
              {parsedResult.type === 'transfer' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{parsedResult.accountId === 'bank' ? '🏛️ Banco' : '💵 Efectivo'}</span>
                  <ArrowRight size={14} color="#60a5fa" />
                  <span>{parsedResult.toAccountId === 'cash' ? '💵 Efectivo' : '🏛️ Banco'}</span>
                </div>
              ) : (
                <div>Cuenta: {parsedResult.accountId === 'cash' ? '💵 Efectivo' : '🏛️ Banco'}</div>
              )}
            </div>

            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '6px' }}>
              {parsedResult.description}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#94a3b8',
              border: 'none',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!parsedResult}
            style={{
              flex: 2,
              padding: '12px',
              borderRadius: '14px',
              background: parsedResult ? 'linear-gradient(135deg, #c4fb6d, #8ef040)' : 'rgba(255, 255, 255, 0.1)',
              color: parsedResult ? '#090c15' : '#64748b',
              border: 'none',
              fontWeight: 700,
              cursor: parsedResult ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: parsedResult ? '0 4px 15px rgba(196, 251, 109, 0.3)' : 'none'
            }}
          >
            <Check size={18} strokeWidth={2.5} />
            Aplicar al Formulario
          </button>
        </div>
      </div>
    </div>
  );
}
