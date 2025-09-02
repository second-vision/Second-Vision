// src/shared/constants/modes.ts
export const MODES = [
  {
    id: 0,
    name: "Híbrido",
    description: "Esse modo detecta tanto objetos possivelmente perigosos como textos estáticos.",
  },
  {
    id: 1,
    name: "Texto",
    description: "Esse modo detecta apenas textos estáticos.",
  },
  {
    id: 2,
    name: "Objetos",
    description: "Esse modo detecta apenas objetos possivelmente perigosos.",
  },
];

export const HOSTSPOT_MODES = {
  RPi5: [
    {
      id: 0,
      name: "Offline",
      description: "Esse modo funciona sem conexão com a internet.",
    },
    {
      id: 1,
      name: "Online",
      description: "Esse modo apenas funciona com conexão à internet.",
    },
  ],
  default: [
    {
      id: 1,
      name: "Online",
      description: "Este dispositivo necessita de internet para funcionar. Clique para configurar.",
    },
  ],
};
