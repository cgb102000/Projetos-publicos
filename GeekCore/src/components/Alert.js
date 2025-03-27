import { useEffect, useState } from 'react';

export function Alert({ message, type = 'success', duration = 3000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`
      fixed top-4 right-4 p-4 rounded-lg shadow-lg
      transform transition-all duration-300 ease-in-out
      ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}
      text-white font-medium flex items-center gap-2 z-50
    `}>
      <span>{message}</span>
      <button 
        onClick={() => {
          setIsVisible(false);
          onClose?.();
        }}
        className="ml-2 hover:opacity-75"
      >
        ✕
      </button>
    </div>
  );
}
