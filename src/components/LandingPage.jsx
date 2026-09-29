import React, { useState } from 'react';
import { 
  Download, 
  Smartphone, 
  Sparkles, 
  ShieldCheck, 
  Share2, 
  TrendingUp, 
  CheckCircle2, 
  ExternalLink, 
  Zap, 
  Layers, 
  Lock, 
  Coffee, 
  ArrowRight, 
  X,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

const LandingPage = ({ onInstallClick, installPromptReady, onSkip }) => {
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [activeTab, setActiveTab] = useState('android');
  const [downloadStep, setDownloadStep] = useState('ready'); // ready, downloading, completed

  const handleDownloadAPK = () => {
    setDownloadStep('downloading');
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}

    // Simulated download / redirect to GitHub APK release
    setTimeout(() => {
      setDownloadStep('completed');
      // Create a direct anchor to the latest release or artifact on GitHub
      const link = document.createElement('a');
      link.href = 'https://github.com/Ligorote72/money-flow/actions';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      // If user also wants PWA install prompt
      if (installPromptReady) {
        onInstallClick();
      }
    }, 1500);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#090d16',
      color: '#f0f6fc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Dynamic Background Glows */}
      <div style={{
        position: 'fixed',
        top: '-10%',
        left: '20%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(196, 251, 109, 0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      <div style={{
        position: 'fixed',
        bottom: '10%',
        right: '5%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(52, 199, 89, 0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* --- TOP NAVBAR --- */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        background: 'rgba(9, 13, 22, 0.8)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #c4fb6d 0%, #34c759 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            boxShadow: '0 0 20px rgba(196, 251, 109, 0.4)'
          }}>
            💸
          </div>
          <div>
            <span style={{ fontSize: '1.15rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#fff' }}>
              Money<span style={{ color: '#c4fb6d' }}>Flow</span>
            </span>
            <span style={{
              marginLeft: '8px',
              fontSize: '0.65rem',
              fontWeight: '700',
              padding: '2px 8px',
              borderRadius: '20px',
              background: 'rgba(196, 251, 109, 0.15)',
              color: '#c4fb6d',
              border: '1px solid rgba(196, 251, 109, 0.3)'
            }}>
              v2.5 APK
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onSkip}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '8px 14px',
              color: '#f0f6fc',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Abrir Web App
          </button>
          <button
            onClick={() => setShowDownloadModal(true)}
            style={{
              background: 'linear-gradient(135deg, #c4fb6d 0%, #34c759 100%)',
              border: 'none',
              borderRadius: '12px',
              padding: '8px 16px',
              color: '#000',
              fontSize: '0.85rem',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(196, 251, 109, 0.3)'
            }}
          >
            <Download size={15} />
            Descargar
          </button>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '50px 20px 40px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(196, 251, 109, 0.08)',
          border: '1px solid rgba(196, 251, 109, 0.25)',
          padding: '6px 16px',
          borderRadius: '30px',
          marginBottom: '24px',
          fontSize: '0.82rem',
          color: '#c4fb6d',
          fontWeight: '600'
        }}>
          <Sparkles size={14} />
          Especializado en Colombia • Nequi, Bancolombia & Fincas Cafeteras
        </div>

        {/* Main Title */}
        <h1 style={{
          fontSize: 'clamp(2.3rem, 6vw, 3.8rem)',
          fontWeight: '900',
          lineHeight: '1.1',
          letterSpacing: '-0.03em',
          maxWidth: '850px',
          margin: '0 auto 20px',
          background: 'linear-gradient(180deg, #ffffff 30%, #a1a1aa 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          El control definitivo de tu dinero, finanzas y cosecha en una sola App.
        </h1>

        <p style={{
          fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
          color: '#8b949e',
          maxWidth: '680px',
          margin: '0 auto 36px',
          lineHeight: '1.6'
        }}>
          Lleva tus cuentas personales, detecta transferencias automáticas y liquida la recolección de café por arrobas con recibos directos a WhatsApp. 100% privado y con respaldo en la nube.
        </p>

        {/* Hero CTA Buttons */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '16px',
          marginBottom: '48px'
        }}>
          <button
            onClick={() => setShowDownloadModal(true)}
            style={{
              background: 'linear-gradient(135deg, #c4fb6d 0%, #34c759 100%)',
              border: 'none',
              borderRadius: '16px',
              padding: '16px 28px',
              color: '#090d16',
              fontSize: '1.05rem',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(196, 251, 109, 0.35)',
              transition: 'transform 0.2s'
            }}
          >
            <Download size={20} />
            Descargar APK para Android
            <span style={{ fontSize: '0.75rem', background: 'rgba(0,0,0,0.15)', padding: '2px 8px', borderRadius: '10px' }}>v2.5</span>
          </button>

          <button
            onClick={onSkip}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              padding: '16px 24px',
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <Smartphone size={18} />
            Usar Web App en Navegador
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Trust Badges */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
          color: '#8b949e',
          fontSize: '0.82rem',
          marginBottom: '50px'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} color="#34c759" /> Cero Anuncios
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} color="#34c759" /> Funciona Offline & Nube
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} color="#34c759" /> Cifrado y PIN Local
          </span>
        </div>

        {/* Hero Image Showcase */}
        <div style={{
          position: 'relative',
          maxWidth: '900px',
          margin: '0 auto',
          borderRadius: '28px',
          padding: '8px',
          background: 'linear-gradient(180deg, rgba(196, 251, 109, 0.3) 0%, rgba(255,255,255,0.02) 100%)',
          boxShadow: '0 25px 80px rgba(0,0,0,0.8), 0 0 40px rgba(196, 251, 109, 0.15)'
        }}>
          <img 
            src="/hero-preview.jpg" 
            alt="MoneyFlow Dashboard Preview" 
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: '22px',
              display: 'block'
            }}
          />
        </div>
      </section>

      {/* --- BENTO GRID: CARACTERÍSTICAS TIER 1 --- */}
      <section style={{
        maxWidth: '1200px',
        margin: '60px auto 80px',
        padding: '0 20px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ fontSize: '0.8rem', color: '#c4fb6d', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Arsenal de Funcionalidades
          </span>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: '800', marginTop: '8px' }}>
            Hecho para el ritmo real de tu día a día
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {/* Card 1: Finca Cafetera */}
          <div style={{
            background: 'linear-gradient(180deg, rgba(22, 27, 34, 0.8) 0%, rgba(13, 17, 23, 0.95) 100%)',
            border: '1px solid rgba(196, 251, 109, 0.2)',
            borderRadius: '24px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(196, 251, 109, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '16px' }}>
                ☕
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '10px' }}>Módulo Finca Cafetera & AgroTech</h3>
              <p style={{ color: '#8b949e', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Controla pesajes en arrobas (<span style={{ color: '#c4fb6d', fontWeight: '700' }}>@</span>), calcula el jornal o precio por arroba de cada cogedor y ten en tiempo real la inversión total de tu cosecha.
              </p>
            </div>
            <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem', color: '#34c759', fontWeight: '600' }}>
              ✓ Tarifa por Pepeo y Arrobeo automatizada
            </div>
          </div>

          {/* Card 2: Recibo Digital WhatsApp */}
          <div style={{
            background: 'linear-gradient(180deg, rgba(22, 27, 34, 0.8) 0%, rgba(13, 17, 23, 0.95) 100%)',
            border: '1px solid rgba(52, 199, 89, 0.2)',
            borderRadius: '24px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(52, 199, 89, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '16px' }}>
                🧾
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '10px' }}>Comprobantes Directos a WhatsApp</h3>
              <p style={{ color: '#8b949e', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Al liquidar un pago o jornal, MoneyFlow genera un recibo digital con código único y botón 1-click para compartirlo por WhatsApp con formato profesional y transparente.
              </p>
            </div>
            <div style={{ marginTop: '20px', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
              <img src="/receipt-preview.jpg" alt="Recibo WhatsApp" style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
            </div>
          </div>

          {/* Card 3: Auto-detección Nequi & Bancos */}
          <div style={{
            background: 'linear-gradient(180deg, rgba(22, 27, 34, 0.8) 0%, rgba(13, 17, 23, 0.95) 100%)',
            border: '1px solid rgba(255, 149, 0, 0.2)',
            borderRadius: '24px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255, 149, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '16px' }}>
                🔔
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '10px' }}>Detección de Notificaciones</h3>
              <p style={{ color: '#8b949e', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Compatible con la lectura de notificaciones push de Nequi, Bancolombia y Daviplata. Cada transferencia se registra en silencio sin que tengas que abrir la app a escribir.
              </p>
            </div>
            <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(255,149,0,0.05)', borderRadius: '14px', border: '1px solid rgba(255,149,0,0.15)', fontSize: '0.8rem', color: '#ff9500', fontWeight: '600' }}>
              ⚡ Cero fricción: transfiere y queda anotado
            </div>
          </div>

          {/* Card 4: Bóveda de Seguridad & Biometría */}
          <div style={{
            background: 'linear-gradient(180deg, rgba(22, 27, 34, 0.8) 0%, rgba(13, 17, 23, 0.95) 100%)',
            border: '1px solid rgba(175, 82, 222, 0.2)',
            borderRadius: '24px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(175, 82, 222, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '16px' }}>
                🔒
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '10px' }}>Seguridad Biométrica & PIN</h3>
              <p style={{ color: '#8b949e', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Bloquea el acceso a tus finanzas con PIN de 4 dígitos o tu huella digital/Face ID local. Tus números son solo tuyos.
              </p>
            </div>
            <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(175,82,222,0.05)', borderRadius: '14px', border: '1px solid rgba(175,82,222,0.15)', fontSize: '0.8rem', color: '#af52de', fontWeight: '600' }}>
              🛡️ Cifrado seguro local y RLS en Supabase
            </div>
          </div>
        </div>
      </section>

      {/* --- GUÍA DE INSTALACIÓN Y DESCARGA (ESTILO SNAPTUBE) --- */}
      <section style={{
        maxWidth: '900px',
        margin: '0 auto 80px',
        padding: '0 20px',
        textAlign: 'center'
      }}>
        <div style={{
          background: 'linear-gradient(180deg, #131822 0%, #090d16 100%)',
          borderRadius: '28px',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '40px 24px'
        }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '12px' }}>
            ¿Cómo instalar MoneyFlow en tu teléfono?
          </h2>
          <p style={{ color: '#8b949e', fontSize: '0.95rem', marginBottom: '28px' }}>
            Disponible como aplicación APK nativa de Android o como PWA instantánea sin ocupar almacenamiento.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', textAlign: 'left', marginBottom: '32px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '1.2rem', color: '#c4fb6d', fontWeight: '800', marginBottom: '8px' }}>Paso 1</div>
              <p style={{ fontSize: '0.9rem', color: '#f0f6fc', fontWeight: '700' }}>Descarga el archivo APK</p>
              <p style={{ fontSize: '0.8rem', color: '#8b949e', marginTop: '4px' }}>Toca el botón de descarga para bajar la versión v2.5 optimizada para Android.</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '1.2rem', color: '#c4fb6d', fontWeight: '800', marginBottom: '8px' }}>Paso 2</div>
              <p style={{ fontSize: '0.9rem', color: '#f0f6fc', fontWeight: '700' }}>Permite la instalación</p>
              <p style={{ fontSize: '0.8rem', color: '#8b949e', marginTop: '4px' }}>Si Android te pide confirmación, selecciona "Permitir instalar aplicaciones de esta fuente".</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '1.2rem', color: '#c4fb6d', fontWeight: '800', marginBottom: '8px' }}>Paso 3</div>
              <p style={{ fontSize: '0.9rem', color: '#f0f6fc', fontWeight: '700' }}>Abre y sincroniza</p>
              <p style={{ fontSize: '0.8rem', color: '#8b949e', marginTop: '4px' }}>Inicia sesión con tu cuenta de Supabase y todos tus datos se sincronizarán al segundo.</p>
            </div>
          </div>

          <button
            onClick={() => setShowDownloadModal(true)}
            style={{
              background: 'linear-gradient(135deg, #c4fb6d 0%, #34c759 100%)',
              border: 'none',
              borderRadius: '16px',
              padding: '16px 36px',
              color: '#000',
              fontSize: '1.1rem',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 8px 30px rgba(196, 251, 109, 0.3)'
            }}
          >
            <Download size={20} />
            Obtener MoneyFlow APK Ahora
          </button>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '30px 20px',
        textAlign: 'center',
        color: '#8b949e',
        fontSize: '0.85rem'
      }}>
        <p>MoneyFlow v2.5 • FinTech & AgroTech Soluciones</p>
        <p style={{ marginTop: '6px', fontSize: '0.75rem', opacity: 0.7 }}>Desarrollado con React 19, Vite 8, Supabase & Capacitor</p>
      </footer>

      {/* --- MODAL DE DESCARGA INTERACTIVO (SNAPTUBE STYLE) --- */}
      {showDownloadModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '440px',
            background: 'linear-gradient(180deg, #161b22 0%, #0d1117 100%)',
            borderRadius: '24px',
            border: '1px solid rgba(196, 251, 109, 0.25)',
            padding: '24px',
            position: 'relative',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
          }}>
            <button
              onClick={() => setShowDownloadModal(false)}
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
                color: '#8b949e',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(196,251,109,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '1.8rem', border: '1px solid rgba(196,251,109,0.3)' }}>
                📥
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Descargar MoneyFlow</h3>
              <p style={{ color: '#8b949e', fontSize: '0.85rem', marginTop: '4px' }}>
                Selecciona cómo prefieres tenerla en tu dispositivo
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {/* Opción 1: APK Directo */}
              <div 
                onClick={handleDownloadAPK}
                style={{
                  padding: '16px',
                  background: 'rgba(196,251,109,0.06)',
                  border: '1px solid rgba(196,251,109,0.3)',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #c4fb6d, #34c759)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
                  <Download size={22} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontWeight: '700', fontSize: '0.95rem', color: '#fff' }}>Archivo APK Android</p>
                    <span style={{ fontSize: '0.7rem', color: '#c4fb6d', fontWeight: '700' }}>~4.8 MB</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#8b949e', marginTop: '2px' }}>Instalación directa para celulares Android con GitHub Actions</p>
                </div>
              </div>

              {/* Opción 2: PWA Instantánea */}
              <div 
                onClick={() => {
                  setShowDownloadModal(false);
                  if (installPromptReady) {
                    onInstallClick();
                  } else {
                    onSkip();
                  }
                }}
                style={{
                  padding: '16px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px'
                }}
              >
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <Zap size={22} color="#c4fb6d" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontWeight: '700', fontSize: '0.95rem', color: '#fff' }}>App Web Instantánea (PWA)</p>
                    <span style={{ fontSize: '0.7rem', color: '#34c759', fontWeight: '700' }}>0 MB</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#8b949e', marginTop: '2px' }}>Instalar al instante en Android o iPhone sin descargar archivos</p>
                </div>
              </div>
            </div>

            {downloadStep === 'downloading' && (
              <div style={{ textAlign: 'center', padding: '10px 0', color: '#c4fb6d', fontSize: '0.85rem', fontWeight: '600' }}>
                ⏳ Preparando enlace de descarga y compilación...
              </div>
            )}

            {downloadStep === 'completed' && (
              <div style={{ textAlign: 'center', padding: '10px 0', color: '#34c759', fontSize: '0.85rem', fontWeight: '700' }}>
                🎉 ¡Redirigiendo a las descargas de GitHub / Instalador!
              </div>
            )}

            <button
              onClick={() => {
                setShowDownloadModal(false);
                onSkip();
              }}
              style={{
                width: '100%',
                padding: '14px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '14px',
                color: '#8b949e',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              Continuar al Navegador sin descargar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
