// src/utils/crypto.js

// Usa Web Crypto API para hashear el PIN (soporte offline)
export async function hashPin(pin) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Verifica si un PIN coincide con un hash guardado
export async function verifyPin(inputPin, storedHash) {
  if (!storedHash) return false;
  const inputHash = await hashPin(inputPin);
  return inputHash === storedHash;
}

// Guarda el PIN en localStorage
export async function savePinLocally(pin) {
  const hash = await hashPin(pin);
  localStorage.setItem('moneyflow_pin_hash', hash);
}

// Revisa si hay un PIN configurado
export function hasLocalPin() {
  return localStorage.getItem('moneyflow_pin_hash') !== null;
}

// Borra el PIN (ej: al cerrar sesión)
export function clearLocalPin() {
  localStorage.removeItem('moneyflow_pin_hash');
}
