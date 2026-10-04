# MoneyFlow 💸⚡
### Gestor Financiero Inteligente con IA, Modo Negocio & Soporte Multiplataforma

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Capacitor](https://img.shields.io/badge/Capacitor-8.5-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)](https://capacitorjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![PWA](https://img.shields.io/badge/PWA-Offline%20Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

**MoneyFlow** es una plataforma moderna de gestión financiera personal y comercial diseñada para ofrecer control total sobre tus ingresos, gastos, traspasos entre cuentas y rentabilidad de negocios, con una experiencia de usuario rápida, visual y con asistencia por voz e Inteligencia Artificial.

---

## ✨ Características Principales

### 🎙️ 1. Registro Rápido por Voz con IA (AI Voice Quick-Log)
- **Lenguaje Natural:** Habla o escribe como si le contaras a un amigo:
  - *"Le transferí a Carlos 200.000 y él me pasó en efectivo."*
  - *"Pagué 15.000 de almuerzo en efectivo."*
  - *"Me consignaron 1.5 millones de sueldo al banco."*
- **Detección Automática:**
  - Extrae montos (pesos, miles, millones, "lucas").
  - Identifica traspasos cruzados (debitando de banco y acreditando en efectivo para mantener saldos reales sin falsear pérdidas).
  - Asigna categorías automáticas (Alimentación, Transporte, Servicios, Ocio).
  - Relleno asistido y confirmación en 1 toque.

### 💼 2. Módulo Dual: Personal + Modo Negocio / Finca
- **Finanzas Personales:**
  - Múltiples cuentas: Efectivo (💵), Bancos personalizados (🏛️) y Ahorros (🐷).
  - Control de deudas y préstamos (*Debts Tab*) con abonos parciales y seguimiento de saldos pendientes.
  - Alcancías y cochinitos de ahorro con metas porcentuales.
  - Gestión de gastos fijos y suscripciones recurrentes con recordatorio de días restantes.
- **Modo Negocio:**
  - Dashboard empresarial dedicado (`BusinessDashboard`) protegido por compuerta de seguridad (`BusinessGate`).
  - Registro de ventas comerciales, control de inventario, báscula/pesaje y liquidación de jornales o nómina.

### 🔒 3. Seguridad de Nivel Bancario
- **Pantalla de Bloqueo PIN:** Cifrado local que protege tus datos si prestas el teléfono.
- **Biometría:** Soporte de huella dactilar y FaceID mediante WebAuthn.
- **Supabase Cloud + RLS:** Cada usuario tiene aislamiento total de datos a nivel de fila (`Row Level Security`), impidiendo fugas de información.

### ⚡ 4. Rendimiento & Arquitectura Offline
- **PWA (Progressive Web App):** Instalable en Android, iOS y Escritorio. Funciona con o sin conexión a internet mediante Service Workers.
- **Code-Splitting Inteligente:** Módulos pesados cargados bajo demanda (`React.lazy` + `Suspense`) para una velocidad de apertura ultrarrápida (<1.5s).
- **Compilación Android Nativa:** Configurado con Capacitor 8 listo para generar el APK nativo.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Frontend** | React 19, Vite 8, Lucide Icons, Canvas Confetti |
| **Estilos** | CSS Variables + Glassmorphism Dark Mode (Neon Accent `#c4fb6d`) |
| **Backend & Base de Datos** | Supabase (PostgreSQL + Auth + Realtime + RLS) |
| **Mobile & PWA** | Capacitor 8 (Android SDK), Vite Plugin PWA (Workbox) |
| **IA & NLP** | Parser de Lenguaje Natural Financiero + Web Speech API |

---

## 🚀 Instalación y Despliegue Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/Ligorote72/money-flow.git
cd money-flow
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env` en la raíz basado en `.env.example`:
```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### 4. Configurar la base de datos (Supabase)
Ejecuta el script SQL incluido en tu consola de Supabase:
- Archivo: `supabase_auth_schema.sql` (crea tablas con RLS y claves foráneas).

### 5. Iniciar en modo desarrollo
```bash
npm run dev
```

### 6. Compilar para producción
```bash
npm run build
```

---

## 📱 Compilación para Android (APK Nativo)

```bash
# 1. Compilar la aplicación web
npm run build

# 2. Sincronizar activos con Capacitor
npx cap sync android

# 3. Abrir en Android Studio
npx cap open android
```

---

## 📄 Licencia
Este proyecto es privado / de uso personal y comercial. Desarrollado con los más altos estándares de ingeniería de software.
