import React, { createContext, useContext, useState } from 'react';
import { Alert } from '../components/Alert';

const AlertContext = createContext({});

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);

  const showAlert = (message, type = 'info') => {
    const id = Math.random().toString(36);
    setAlerts(prev => [...prev, { id, message, type }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeAlert(id);
    }, 5000);
  };

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <div className="fixed z-50 top-24 left-0 right-0 flex flex-col items-center space-y-2">
        {alerts.map(alert => (
          <Alert
            key={alert.id}
            message={alert.message}
            type={alert.type}
            onClose={() => removeAlert(alert.id)}
          />
        ))}
      </div>
    </AlertContext.Provider>
  );
}

export const useAlert = () => useContext(AlertContext);
