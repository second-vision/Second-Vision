import React, { createContext, useState, ReactNode, useContext } from "react";
import { Device } from "react-native-ble-plx";

interface DeviceContextType {
  deviceConnection: Device | null;
  setDeviceConnection: (device: Device | null) => void;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

interface DeviceProviderProps {
  children: ReactNode;
}

export const DeviceProvider: React.FC<DeviceProviderProps> = ({ children }) => {
  const [deviceConnection, setDeviceConnection] = useState<Device | null>(null);

  return (
    <DeviceContext.Provider value={{ deviceConnection, setDeviceConnection }}>
      {children}
    </DeviceContext.Provider>
  );
};

export const useDeviceContext = () => {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error("useDeviceContext must be used within a DeviceProvider");
  }
  return context;
};
