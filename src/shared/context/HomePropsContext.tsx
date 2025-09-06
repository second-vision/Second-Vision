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
  hostspotUI: number;
  setIntervalValue: (value: number) => void;
  setModeValue: (value: number) => void;
  setHotspotValue: (value: number) => void;
  setHotspotValueUI: (value: number) => void;
  deviceInfo: DeviceInfo | null;
  setDeviceInfo: (value: DeviceInfo | null) => void;
}

const HomePropsContext = createContext<IHomePropsContextType | undefined>(undefined);

export const ModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [interval, setIntervalValue] = useState<number>(0);
  const [mode, setModeValue] = useState<number>(0);
  const [hostspot, setHotspotValue] = useState<number>(2);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [hostspotUI, setHotspotValueUI] = useState<number>(0);

  return (
    <HomePropsContext.Provider value={{ interval, mode, setIntervalValue, setModeValue, hostspot, setHotspotValue, deviceInfo, setDeviceInfo, hostspotUI, setHotspotValueUI}}>
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
