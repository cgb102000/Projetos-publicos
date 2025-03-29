import React, { useEffect } from 'react';

export function Alert({ message, type = 'info', onClose, autoClose = true, duration = 5000 }) {
  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose, duration]);

  const getAlertStyles = () => {
    const baseStyles = "fixed z-50 p-4 rounded-lg shadow-lg flex items-center justify-between transition-all duration-300";
    const positionStyles = "top-24 left-1/2 transform -translate-x-1/2";
    const responsiveStyles = "w-11/12 sm:w-96";

    switch (type) {
      case 'success':
        return `${baseStyles} ${positionStyles} ${responsiveStyles} bg-green-600 text-white`;
      case 'error':
        return `${baseStyles} ${positionStyles} ${responsiveStyles} bg-red-600 text-white`;
      case 'warning':
        return `${baseStyles} ${positionStyles} ${responsiveStyles} bg-yellow-500 text-white`;
      default:
        return `${baseStyles} ${positionStyles} ${responsiveStyles} bg-primary text-white`;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div 
      className={getAlertStyles()}
      role="alert"
      style={{ maxWidth: '90vw' }}
    >
      <div className="flex items-center">
        {getIcon()}
        <span className="text-sm sm:text-base">{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 hover:opacity-75 transition-opacity"
          aria-label="Fechar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
