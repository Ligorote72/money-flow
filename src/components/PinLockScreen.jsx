import React, { useState, useEffect } from 'react';
import { verifyPin, clearLocalPin } from '../utils/crypto';
import { LogOut, Delete } from 'lucide-react';

export default function PinLockScreen({ onUnlock, onLogout }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (pin.length === 4) {
      handleVerify(pin);
    }
  }, [pin]);

  const handleVerify = async (currentPin) => {
    const storedHash = localStorage.getItem('moneyflow_pin_hash');
    const isValid = await verifyPin(currentPin, storedHash);
    
    if (isValid) {
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => {
        setPin('');
        setError(false);
      }, 500); // 500ms shake and wait
    }
  };

  const handleNumberClick = (num) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError(false);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const handleForgotPin = () => {
    if(window.confirm('¿Olvidaste tu PIN? Si cierras sesión, se borrará el PIN actual, pero tendrás que volver a iniciar sesión con Google.')) {
      clearLocalPin();
      onLogout(); // Llamamos la función de cierre de sesión desde App.jsx
    }
  };

  // Botones del teclado: 1-9, luego vacío, 0, retroceso
  const keys = [
    1, 2, 3,
    4, 5, 6,
    7, 8, 9,
    null, 0, 'delete'
  ];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 animate-in fade-in duration-300">
      <div className="flex flex-col items-center w-full max-w-md px-6">
        
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">💰</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">MoneyFlow</h1>
          <p className="text-gray-500 dark:text-gray-400">Ingresa tu PIN para acceder</p>
        </div>

        {/* PIN Indicators */}
        <div className={`flex gap-4 mb-12 ${error ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map((index) => (
            <div 
              key={index}
              className={`w-4 h-4 rounded-full transition-all duration-200 ${
                pin.length > index 
                  ? 'bg-blue-600 dark:bg-blue-500 scale-110' 
                  : 'bg-gray-300 dark:bg-gray-700'
              } ${error ? 'bg-red-500 dark:bg-red-500' : ''}`}
            />
          ))}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-6 mb-12 w-full max-w-[280px]">
          {keys.map((key, index) => {
            if (key === null) return <div key={index} />;
            
            if (key === 'delete') {
              return (
                <button
                  key={index}
                  onClick={handleDelete}
                  className="flex items-center justify-center h-16 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors active:scale-95"
                >
                  <Delete size={28} />
                </button>
              );
            }

            return (
              <button
                key={index}
                onClick={() => handleNumberClick(key)}
                className="flex items-center justify-center h-16 rounded-full text-3xl font-medium text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors active:scale-95 bg-white dark:bg-gray-800/50 shadow-sm border border-gray-100 dark:border-gray-800"
              >
                {key}
              </button>
            );
          })}
        </div>

        {/* Footer actions */}
        <button 
          onClick={handleForgotPin}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <LogOut size={16} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}
