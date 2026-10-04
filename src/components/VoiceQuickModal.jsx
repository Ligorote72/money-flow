import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, X, ArrowRight, Check, AlertCircle, ArrowLeftRight, ArrowDownLeft, ArrowUpRight, Wallet, Landmark, Split, Zap } from 'lucide-react';
import { parseFinancialVoiceCommand } from '../utils/aiVoiceParser.js';
import { formatCurrency } from '../utils/helpers';

export default function VoiceQuickModal({ 
  isOpen, 
  onClose, 
  onApplyTransaction, 
  onDirectSave, 
  autoStart = false, 
  accountBalances = null, 
  banks = [] 
}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedResult, setParsedResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('cash'); // 'cash' | 'bank' | 'split'
  const [splitCash, setSplitCash] = useState(0);
  const [splitBank, setSplitBank] = useState(0);
  const [isSavingDirect, setIsSavingDirect] = useState(false);
  const recognitionRef = useRef(null);

  const cashBalance = accountBalances ? (accountBalances.cash || 0) : 0;
  const bankBalance = accountBalances ? (accountBalances.bank || 0) : 0;

  // Sincronizar el resultado cuando se analiza el comando
  const updateParsed = (rawText) => {
    if (!rawText || !rawText.trim()) {
      setParsedResult(null);
      return;
    }
    const res = parseFinancialVoiceCommand(rawText, { accountBalances });
    setParsedResult(res);

    if (res && res.amount > 0) {
      if (res.isSplit) {
        setSelectedMethod('split');
        setSplitCash(res.splitCash || Math.round(res.amount / 2));
        setSplitBank(res.splitBank || (res.amount - Math.round(res.amount / 2)));
      } else {
        setSelectedMethod(res.accountId || 'cash');
        const defaultCashPart = cashBalance > 0 ? Math.min(cashBalance, Math.round(res.amount / 2)) : 0;
        setSplitCash(defaultCashPart);
        setSplitBank(res.amount - defaultCashPart);
      }
    }
  };

  // Inicializar SpeechRecognition
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
        updateParsed(currentText);
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
  }, [accountBalances]);

  // Auto-inicio de escucha si autoStart es true
  useEffect(() => {
    if (isOpen && autoStart && recognitionRef.current && !isListening) {
      const timer = setTimeout(() => {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.log('Voice autoStart deferred to user click:', e);
        }
      }, 350);
      return () => clearTimeout(timer);
    } else if (!isOpen && isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  }, [isOpen, autoStart]);

  const handleTextChange = (e) => {
    const val = e.target.value;
    setTranscript(val);
    updateParsed(val);
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

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    if (!parsedResult) return;

    if (method === 'split') {
      const initCash = cashBalance > 0 ? Math.min(cashBalance, Math.round(parsedResult.amount / 2)) : Math.round(parsedResult.amount / 2);
      const initBank = parsedResult.amount - initCash;
      setSplitCash(initCash);
      setSplitBank(initBank);
      setParsedResult(prev => ({
        ...prev,
        isSplit: true,
        splitCash: initCash,
        splitBank: initBank
      }));
    } else {
      setParsedResult(prev => ({
        ...prev,
        isSplit: false,
        accountId: method
      }));
    }
  };

  const handleCashSplitChange = (val) => {
    const num = Math.max(0, parseInt(val.replace(/\D/g, '') || '0', 10));
    if (!parsedResult) return;
    const finalCash = Math.min(num, parsedResult.amount);
    const finalBank = parsedResult.amount - finalCash;
    setSplitCash(finalCash);
    setSplitBank(finalBank);
    setParsedResult(prev => ({
      ...prev,
      isSplit: true,
      splitCash: finalCash,
      splitBank: finalBank
    }));
  };

  const handleBankSplitChange = (val) => {
    const num = Math.max(0, parseInt(val.replace(/\D/g, '') || '0', 10));
    if (!parsedResult) return;
    const finalBank = Math.min(num, parsedResult.amount);
    const finalCash = parsedResult.amount - finalBank;
    setSplitBank(finalBank);
    setSplitCash(finalCash);
    setParsedResult(prev => ({
      ...prev,
      isSplit: true,
      splitCash: finalCash,
      splitBank: finalBank
    }));
  };

  const getPayload = () => {
    if (!parsedResult) return null;
    if (selectedMethod === 'split') {
      return {
        ...parsedResult,
        isSplit: true,
        splitCash,
        splitBank
      };
    }
    return {
      ...parsedResult,
      isSplit: false,
      accountId: selectedMethod
    };
  };

  const handleDirectSave = async () => {
    const payload = getPayload();
    if (!payload) return;
    setIsSavingDirect(true);
    try {
      if (onDirectSave) {
        await onDirectSave(payload);
      } else if (onApplyTransaction) {
        onApplyTransaction(payload);
      }
      onClose();
    } catch (e) {
      console.error('Error in onDirectSave:', e);
      setErrorMsg('No se pudo guardar el movimiento directamente.');
    } finally {
      setIsSavingDirect(false);
    }
  };

  const handleApplyToForm = () => {
    const payload = getPayload();
    if (!payload) return;
    onApplyTransaction(payload);
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
      backgroundColor: 'rgba(0, 0, 0, 0.78)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div style={{
        background: 'linear-gradient(155deg, rgba(20, 26, 40, 0.98), rgba(10, 14, 24, 0.99))',
        border: '1px solid rgba(196, 251, 109, 0.3)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 35px rgba(196, 251, 109, 0.12)',
        borderRadius: '26px',
        width: '100%',
        maxWidth: '480px',
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: '24px',
        color: '#fff',
        position: 'relative',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {/* Encabezado */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            background: 'rgba(196, 251, 109, 0.15)',
            color: '#c4fb6d',
            padding: '10px',
            borderRadius: '14px',
            display: 'flex'
          }}>
            <Sparkles size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              Asistente de Voz & IA
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
              Dicta tu movimiento de forma natural
            </p>
          </div>
        </div>

        {/* Barra de Saldos en Tiempo Real */}
        {accountBalances && (
          <div style={{
            display: 'flex',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '8px 12px',
            marginBottom: '16px',
            fontSize: '0.78rem'
          }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1rem' }}>💵</span>
              <div>
                <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Efectivo</div>
                <div style={{ fontWeight: 700, color: cashBalance > 0 ? '#34c759' : '#f87171' }}>
                  {formatCurrency(cashBalance)}
                </div>
              </div>
            </div>
            <div style={{ width: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1rem' }}>🏛️</span>
              <div>
                <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Banco / Cuentas</div>
                <div style={{ fontWeight: 700, color: bankBalance > 0 ? '#60a5fa' : '#f87171' }}>
                  {formatCurrency(bankBalance)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botón Micrófono Animado */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '14px 0 18px 0' }}>
          <button
            onClick={toggleListening}
            style={{
              width: '78px',
              height: '78px',
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
                ? '0 0 30px rgba(255, 59, 48, 0.6)' 
                : '0 0 30px rgba(196, 251, 109, 0.45)',
              transition: 'all 0.25s ease',
              transform: isListening ? 'scale(1.08)' : 'scale(1)'
            }}
          >
            {isListening ? <Mic size={34} strokeWidth={2.5} /> : <Mic size={34} strokeWidth={2.2} />}
          </button>
          <span style={{ fontSize: '0.85rem', color: isListening ? '#ff6b60' : '#c4fb6d', marginTop: '10px', fontWeight: 600 }}>
            {isListening ? 'Escuchando... Di tu movimiento' : 'Toca para hablar'}
          </span>
        </div>

        {/* Input de Texto / Frase */}
        <div style={{ marginBottom: '14px' }}>
          <textarea
            value={transcript}
            onChange={handleTextChange}
            placeholder='Ej: "Gasté 500 mil en pagar el computador" o "200 mil, mitad efectivo mitad banco"'
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

        {/* Chips de Sugerencia Rápida */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
          {[
            'Gasté 500 mil en el computador',
            'Pagué 100k, mitad efectivo mitad banco',
            'Transferí 200k a Juan y me dio efectivo'
          ].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTranscript(chip);
                updateParsed(chip);
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

        {/* Error */}
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

        {/* Tarjeta del Movimiento Detectado */}
        {parsedResult && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '18px',
            padding: '16px',
            marginBottom: '18px'
          }}>
            {/* Header del Movimiento */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '8px',
                  background: parsedResult.type === 'transfer' ? 'rgba(0, 122, 255, 0.2)' : parsedResult.type === 'income' ? 'rgba(52, 199, 89, 0.2)' : 'rgba(255, 59, 48, 0.2)',
                  color: parsedResult.type === 'transfer' ? '#60a5fa' : parsedResult.type === 'income' ? '#4ade80' : '#f87171'
                }}>
                  {parsedResult.type === 'transfer' ? 'Traspaso' : parsedResult.type === 'income' ? 'Ingreso' : 'Gasto'}
                </span>
                <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                  {parsedResult.description}
                </span>
              </div>
              <span style={{ 
                fontSize: '1.2rem', 
                fontWeight: 800, 
                color: parsedResult.type === 'income' ? '#4ade80' : parsedResult.type === 'transfer' ? '#60a5fa' : '#fff' 
              }}>
                {parsedResult.type === 'income' ? `+ ${formatCurrency(parsedResult.amount)}` : formatCurrency(parsedResult.amount)}
              </span>
            </div>

            {/* Aviso Inteligente si no había saldo en efectivo o hubo sugerencia */}
            {parsedResult.smartNotice && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: parsedResult.type === 'income' ? 'rgba(52, 199, 89, 0.15)' : 'rgba(196, 251, 109, 0.1)',
                border: `1px solid ${parsedResult.type === 'income' ? 'rgba(52, 199, 89, 0.35)' : 'rgba(196, 251, 109, 0.25)'}`,
                borderRadius: '12px',
                padding: '8px 12px',
                marginBottom: '12px',
                fontSize: '0.78rem',
                color: parsedResult.type === 'income' ? '#86efac' : '#c4fb6d'
              }}>
                <Zap size={14} style={{ flexShrink: 0 }} />
                <span>{parsedResult.smartNotice}</span>
              </div>
            )}

            {/* Selector de Cuenta / Método (Solo si es Gasto o Ingreso) */}
            {parsedResult.type !== 'transfer' && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '8px', fontWeight: 600 }}>
                  {parsedResult.type === 'income' ? '¿A qué cuenta ingresó el dinero?' : '¿De dónde salió el dinero?'}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  {/* Botón Efectivo */}
                  <button
                    onClick={() => handleMethodSelect('cash')}
                    style={{
                      background: selectedMethod === 'cash' ? 'rgba(52, 199, 89, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${selectedMethod === 'cash' ? '#34c759' : 'rgba(255, 255, 255, 0.1)'}`,
                      borderRadius: '12px',
                      padding: '10px 6px',
                      color: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700 }}>
                      <Wallet size={14} color="#34c759" /> Efectivo
                    </div>
                    <span style={{ 
                      fontSize: '0.68rem', 
                      color: parsedResult.type === 'income' 
                        ? '#86efac' 
                        : (cashBalance >= parsedResult.amount ? '#86efac' : '#f87171') 
                    }}>
                      {parsedResult.type === 'income'
                        ? (selectedMethod === 'cash' ? '✓ Recibir aquí' : (cashBalance < 0 ? `$${(cashBalance / 1000).toFixed(0)}k` : `$${(cashBalance / 1000).toFixed(0)}k`))
                        : (cashBalance >= parsedResult.amount ? '✓ Disponible' : `$${(cashBalance / 1000).toFixed(0)}k`)}
                    </span>
                  </button>

                  {/* Botón Banco */}
                  <button
                    onClick={() => handleMethodSelect('bank')}
                    style={{
                      background: selectedMethod === 'bank' ? 'rgba(0, 122, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${selectedMethod === 'bank' ? '#007aff' : 'rgba(255, 255, 255, 0.1)'}`,
                      borderRadius: '12px',
                      padding: '10px 6px',
                      color: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700 }}>
                      <Landmark size={14} color="#60a5fa" /> Banco
                    </div>
                    <span style={{ 
                      fontSize: '0.68rem', 
                      color: parsedResult.type === 'income' 
                        ? '#93c5fd' 
                        : (bankBalance >= parsedResult.amount ? '#93c5fd' : '#f87171') 
                    }}>
                      {parsedResult.type === 'income'
                        ? (selectedMethod === 'bank' ? '✓ Recibir aquí' : `$${(bankBalance / 1000).toFixed(0)}k`)
                        : (bankBalance >= parsedResult.amount ? '✓ Disponible' : `$${(bankBalance / 1000).toFixed(0)}k`)}
                    </span>
                  </button>

                  {/* Botón Dividir (Ambas) */}
                  <button
                    onClick={() => handleMethodSelect('split')}
                    style={{
                      background: selectedMethod === 'split' ? 'rgba(196, 251, 109, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${selectedMethod === 'split' ? '#c4fb6d' : 'rgba(255, 255, 255, 0.1)'}`,
                      borderRadius: '12px',
                      padding: '10px 6px',
                      color: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700 }}>
                      <Split size={14} color="#c4fb6d" /> Ambas
                    </div>
                    <span style={{ fontSize: '0.68rem', color: '#c4fb6d' }}>
                      {parsedResult.type === 'income' ? 'Dividir ingreso' : 'Dividir pago'}
                    </span>
                  </button>
                </div>

                {/* Sub-formulario de División de Pago o Ingreso */}
                {selectedMethod === 'split' && (
                  <div style={{
                    marginTop: '12px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid rgba(196, 251, 109, 0.2)',
                    borderRadius: '14px',
                    padding: '12px'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: '#c4fb6d', marginBottom: '8px', fontWeight: 600 }}>
                      {parsedResult.type === 'income' ? '✂️ Especifica cuánto ingresó en cada una:' : '✂️ Especifica cuánto pagaste en cada una:'}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                      <div>
                        <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                          💵 En Efectivo
                        </label>
                        <input
                          type="text"
                          value={splitCash.toLocaleString('es-CO')}
                          onChange={(e) => handleCashSplitChange(e.target.value)}
                          style={{
                            width: '100%',
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '10px',
                            padding: '8px 10px',
                            color: '#fff',
                            fontSize: '0.85rem',
                            fontWeight: 700
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                          🏛️ En Banco / Cuenta
                        </label>
                        <input
                          type="text"
                          value={splitBank.toLocaleString('es-CO')}
                          onChange={(e) => handleBankSplitChange(e.target.value)}
                          style={{
                            width: '100%',
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '10px',
                            padding: '8px 10px',
                            color: '#fff',
                            fontSize: '0.85rem',
                            fontWeight: 700
                          }}
                        />
                      </div>
                    </div>

                    {/* Atajos de división */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => {
                          const half = Math.round(parsedResult.amount / 2);
                          setSplitCash(half);
                          setSplitBank(parsedResult.amount - half);
                          setParsedResult(prev => ({ ...prev, isSplit: true, splitCash: half, splitBank: parsedResult.amount - half }));
                        }}
                        style={{
                          fontSize: '0.7rem',
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#cbd5e1',
                          padding: '4px 8px',
                          cursor: 'pointer'
                        }}
                      >
                        50% / 50%
                      </button>
                      {cashBalance > 0 && cashBalance < parsedResult.amount && (
                        <button
                          onClick={() => {
                            setSplitCash(cashBalance);
                            setSplitBank(parsedResult.amount - cashBalance);
                            setParsedResult(prev => ({ ...prev, isSplit: true, splitCash: cashBalance, splitBank: parsedResult.amount - cashBalance }));
                          }}
                          style={{
                            fontSize: '0.7rem',
                            background: 'rgba(52, 199, 89, 0.15)',
                            border: '1px solid rgba(52, 199, 89, 0.3)',
                            borderRadius: '8px',
                            color: '#86efac',
                            padding: '4px 8px',
                            cursor: 'pointer'
                          }}
                        >
                          Todo mi efectivo ({formatCurrency(cashBalance)}) + Resto banco
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Botones de Acción */}
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
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>

          {/* Botón Aplicar en Formulario */}
          <button
            onClick={handleApplyToForm}
            disabled={!parsedResult}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.12)',
              color: parsedResult ? '#fff' : '#64748b',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: parsedResult ? 'pointer' : 'not-allowed'
            }}
          >
            Formulario
          </button>

          {/* Botón Guardar Directo */}
          <button
            onClick={handleDirectSave}
            disabled={!parsedResult || isSavingDirect}
            style={{
              flex: 2,
              padding: '12px',
              borderRadius: '14px',
              background: parsedResult ? 'linear-gradient(135deg, #c4fb6d, #8ef040)' : 'rgba(255, 255, 255, 0.1)',
              color: parsedResult ? '#090c15' : '#64748b',
              border: 'none',
              fontWeight: 700,
              cursor: (parsedResult && !isSavingDirect) ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: parsedResult ? '0 4px 15px rgba(196, 251, 109, 0.35)' : 'none'
            }}
          >
            <Check size={18} strokeWidth={2.5} />
            {isSavingDirect 
              ? 'Guardando...' 
              : parsedResult?.type === 'income' 
                ? 'Confirmar Ingreso' 
                : parsedResult?.type === 'transfer' 
                  ? 'Confirmar Traspaso' 
                  : 'Confirmar Gasto'}
          </button>
        </div>
      </div>
    </div>
  );
}
