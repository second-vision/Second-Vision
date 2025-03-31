import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({

  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    paddingVertical: 20,
    
    position: "absolute", // Faz o bottomNav ser fixado na parte inferior
    bottom: 0, // Fixando no fundo da tela
    left: 0, // Deixa alinhado à esquerda
    right: 0, // Deixa alinhado à direita
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    
 
  },
  navItem: {
    alignItems: "center",
    width: "33.3%",
 
  },

  navText: { fontSize: 12, color: "#333", marginTop: 5 },
});
