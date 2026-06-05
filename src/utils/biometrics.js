// src/utils/biometrics.js

function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToBuffer(base64) {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes;
}

export function isBiometricsSupported() {
  return window.PublicKeyCredential !== undefined;
}

export function hasLocalBiometrics() {
  return localStorage.getItem('moneyflow_credential_id') !== null;
}

export function clearLocalBiometrics() {
  localStorage.removeItem('moneyflow_credential_id');
}

export async function registerBiometrics() {
  if (!isBiometricsSupported()) throw new Error('Biometrics no soportado');

  const challenge = new Uint8Array(32);
  const userId = new Uint8Array(16);
  crypto.getRandomValues(challenge);
  crypto.getRandomValues(userId);

  try {
    const cred = await navigator.credentials.create({
      publicKey: {
        challenge: challenge,
        rp: { name: "MoneyFlow App" },
        user: {
          id: userId,
          name: "usuario@moneyflow",
          displayName: "Usuario de MoneyFlow"
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 }, // ES256
          { type: "public-key", alg: -257 } // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform", // FaceID/TouchID/Windows Hello
          userVerification: "required"
        },
        timeout: 60000,
        attestation: "none"
      }
    });

    if (cred) {
      localStorage.setItem('moneyflow_credential_id', bufferToBase64(cred.rawId));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error registrando huella:', error);
    return false;
  }
}

export async function verifyBiometrics() {
  const credIdBase64 = localStorage.getItem('moneyflow_credential_id');
  if (!credIdBase64) return false;

  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);

  try {
    const cred = await navigator.credentials.get({
      publicKey: {
        challenge: challenge,
        allowCredentials: [{
          id: base64ToBuffer(credIdBase64),
          type: "public-key",
        }],
        userVerification: "required"
      }
    });
    return !!cred;
  } catch (error) {
    console.error('Error verificando huella:', error);
    return false;
  }
}
