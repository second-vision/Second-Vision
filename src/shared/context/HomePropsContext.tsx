import React, { createContext, useContext, useState } from "react";

interface IHomePropsContextType {
  interval: number;
  mode: number;
  hostspot: number;
  setIntervalValue: (value: number) => void;
  setModeValue: (value: number) => void;
  setHotspotValue: (value: number) => void;
  deviceInfo: string;
}

const HomePropsContext = createContext<IHomePropsContextType | undefined>(undefined);

export const ModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [interval, setIntervalValue] = useState<number>(0);
  const [mode, setModeValue] = useState<number>(0);
  const [hostspot, setHotspotValue] = useState<number>(0);
  const [deviceInfo, setDeviceInfo] = useState<string>('');

  return (
    <HomePropsContext.Provider value={{ interval, mode, setIntervalValue, setModeValue, hostspot, setHotspotValue, deviceInfo}}>
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
