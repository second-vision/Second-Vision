import React, { createContext, useState, ReactNode, useContext } from 'react';
import { Device } from 'react-native-ble-plx';

interface DeviceContextType {
  deviceConnection: Device | null;
  setDeviceConnection: (device: Device | null) => void;
}

// Criação do contexto com valor padrão
const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

interface DeviceProviderProps {
  children: ReactNode;
}

// Provedor para envolver sua árvore de componentes
export const DeviceProvider: React.FC<DeviceProviderProps> = ({ children }) => {
  const [deviceConnection, setDeviceConnection] = useState<Device | null>(null);

  return (
    <DeviceContext.Provider value={{ deviceConnection, setDeviceConnection }}>
      {children}
    </DeviceContext.Provider>
  );
};

// Hook para acessar o contexto em qualquer lugar do app
export const useDeviceContext = () => {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDeviceContext must be used within a DeviceProvider');
  }
  return context;
};
