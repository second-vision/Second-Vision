import React, { createContext, useContext, useState } from "react";

interface DeviceInfo {
  model: string;
  version_code: number;
  features: string[];
}

interface IHomePropsContextType {
  interval: number;
  mode: number;
  hostspot: number;
  setIntervalValue: (value: number) => void;
  setModeValue: (value: number) => void;
  setHotspotValue: (value: number) => void;
  deviceInfo: DeviceInfo | null; // <-- MUDANÇA: Agora pode ser o objeto ou null
  setDeviceInfo: (value: DeviceInfo | null) => void; // <-- MUDANÇA: Aceita o objeto ou null
}

const HomePropsContext = createContext<IHomePropsContextType | undefined>(undefined);

export const ModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [interval, setIntervalValue] = useState<number>(0);
  const [mode, setModeValue] = useState<number>(0);
  const [hostspot, setHotspotValue] = useState<number>(0);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);


  return (
    <HomePropsContext.Provider value={{ interval, mode, setIntervalValue, setModeValue, hostspot, setHotspotValue, deviceInfo, setDeviceInfo}}>
      {children}
    </HomePropsContext.Provider>
  );
};

export const useHomePropsContext = (): IHomePropsContextType => {
  const context = useContext(HomePropsContext);
  if (!context) {
    throw new Error("useHomePropsContext deve ser usado dentro de um ModeProvider");
  }
  return context;
};
