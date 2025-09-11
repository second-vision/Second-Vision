import { ScrollView, View, Pressable, Linking } from "react-native";
import { styles } from "./styles";
import { useSpeech, useTermsManager } from "@/src/shared/hooks";
import { useEffect } from "react";
import { useSettings } from "@/src/shared/context";
import { AppText } from "@/src/shared/components";
import { FontSizes } from "@/src/shared/constants/fontSizes";

export const TermsOfUse = () => {
  const { rejectTerms, acceptTerms } = useTermsManager();
  const { speakEnabled } = useSettings();
  const { speak } = useSpeech(0);

  useEffect(() => {
    if (speakEnabled) {
      speak("Aceite os termos de uso para continuar.", 0);
    }
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppText
        baseSize={FontSizes.Large}
        style={styles.title}
        accessibilityRole="header"
      >
        Termos e Condições Gerais de Uso do Aplicativo de Auxílio para
        Deficientes Visuais.
      </AppText>

      <AppText
        baseSize={FontSizes.Normal}
        style={styles.sectionTitle}
        accessibilityRole="header"
      >
        1. Do Objeto
      </AppText>
      <AppText
        baseSize={FontSizes.Small}
        style={styles.sectionText}
        accessibilityRole="text"
      >
        O aplicativo de auxílio para deficientes visuais, desenvolvido para
        funcionar em conjunto com o dispositivo Raspberry Pi 5 ou Raspberry Pi
        0, visa detectar objetos potencialmente perigosos e textos estáticos,
        convertendo essas informações em áudio. O serviço é destinado a melhorar
        a segurança e a autonomia dos usuários deficientes visuais.
      </AppText>

      <AppText
        baseSize={FontSizes.Normal}
        style={styles.sectionTitle}
        accessibilityRole="header"
      >
        2. Da Aceitação
      </AppText>
      <AppText
        baseSize={FontSizes.Small}
        style={styles.sectionText}
        accessibilityRole="text"
      >
        Ao utilizar o aplicativo, o usuário concorda integralmente com os termos
        aqui descritos. Se não concordar com qualquer disposição, não deve
        utilizar o serviço.
      </AppText>

      <AppText
        baseSize={FontSizes.Normal}
        style={styles.sectionTitle}
        accessibilityRole="header"
      >
        3. Do Acesso dos Usuários
      </AppText>
      <AppText
        baseSize={FontSizes.Small}
        style={styles.sectionText}
        accessibilityRole="text"
      >
        O acesso ao serviço é disponibilizado 24 horas por dia, 7 dias por
        semana, podendo ser temporariamente interrompido para manutenção ou
        atualizações.
      </AppText>

      <AppText
        baseSize={FontSizes.Normal}
        style={styles.sectionTitle}
        accessibilityRole="header"
      >
        4. Dos Serviços
      </AppText>
      <AppText
        baseSize={FontSizes.Small}
        style={styles.sectionText}
        accessibilityRole="text"
      >
        O aplicativo detecta objetos potencialmente perigosos definidos pelos
        desenvolvedores e avisa o usuário sobre a baixa bateria do dispositivo.
        O usuário deve estar ciente de que, em situações de emergência, a
        responsabilidade pela segurança continua a ser sua.
      </AppText>

      <AppText
        baseSize={FontSizes.Normal}
        style={styles.sectionTitle}
        accessibilityRole="header"
      >
        5. Das Responsabilidades
      </AppText>
      <AppText
        baseSize={FontSizes.Small}
        style={styles.sectionText}
        accessibilityRole="text"
      >
        É de responsabilidade do usuário:
      </AppText>
      <AppText
        baseSize={FontSizes.Small}
        style={styles.sectionText}
        accessibilityRole="text"
      >
        a) Utilizar o aplicativo de forma consciente e atenta;
      </AppText>
      <AppText
        baseSize={FontSizes.Small}
        style={styles.sectionText}
        accessibilityRole="text"
      >
        b) Manter o dispositivo carregado e em funcionamento adequado;
      </AppText>
      <AppText
        baseSize={FontSizes.Small}
        style={styles.sectionText}
        accessibilityRole="text"
      >
        c) Seguir as orientações de segurança fornecidas pelo aplicativo.
      </AppText>
      <AppText
        baseSize={FontSizes.Small}
        style={styles.sectionText}
        accessibilityRole="text"
      >
        A plataforma não se responsabiliza por qualquer dano resultante do uso
        inadequado do aplicativo ou de falhas no dispositivo.
      </AppText>

      <AppText
        baseSize={FontSizes.Normal}
        style={styles.sectionTitle}
        accessibilityRole="header"
      >
        6. Dos Direitos Autorais
      </AppText>
      <AppText
        baseSize={FontSizes.Small}
        style={styles.sectionText}
        accessibilityRole="text"
      >
        O aplicativo e seu conteúdo são protegidos por direitos autorais. O
        usuário possui uma licença limitada e intransferível para uso do
        aplicativo.
      </AppText>

      <AppText
        baseSize={FontSizes.Normal}
        style={styles.sectionTitle}
        accessibilityRole="header"
      >
        7. Das Alterações
      </AppText>
      <AppText
        baseSize={FontSizes.Small}
        style={styles.sectionText}
        accessibilityRole="text"
      >
        Estes termos podem ser alterados a qualquer momento. As alterações serão
        comunicadas aos usuários através do próprio aplicativo.
      </AppText>

      <AppText
        baseSize={FontSizes.Normal}
        style={styles.sectionTitle}
        accessibilityRole="header"
      >
        8. Da Política de Privacidade
      </AppText>
      <AppText
        baseSize={FontSizes.Small}
        style={styles.sectionText}
        accessibilityRole="text"
      >
        Os usuários devem também consentir com a Política de Privacidade do
        aplicativo, que detalha a coleta e uso de dados pessoais.
      </AppText>

      <AppText
        baseSize={FontSizes.Normal}
        style={styles.sectionTitle}
        accessibilityRole="header"
      >
        9. Do Foro
      </AppText>
      <AppText
        baseSize={FontSizes.Small}
        style={styles.sectionText}
        accessibilityRole="text"
      >
        Para a solução de controvérsias, será aplicado integralmente o Direito
        brasileiro, sendo competente o foro da comarca onde se encontra a sede
        do desenvolvedor do aplicativo.
      </AppText>
      <AppText
        baseSize={FontSizes.Small}
        style={styles.sectionText}
        accessibilityRole="text"
      >
        Para mais informações sobre nossas políticas de privacidade e termos de
        uso, visite o site oficial:{" "}
      </AppText>
      <Pressable
        onPress={() =>
          Linking.openURL("https://sites.google.com/view/secondvision/home")
        }
        accessibilityRole="link"
        accessibilityLabel="Abrir site oficial Second Vision"
        accessibilityHint="Abre no navegador o site com políticas de privacidade e termos de uso"
      >
        <AppText
          baseSize={FontSizes.Small}
          style={[
            styles.sectionText,
            { color: "blue", textDecorationLine: "underline" },
          ]}
        >
          https://sites.google.com/view/secondvision/home
        </AppText>
      </Pressable>

      <View style={styles.arrayButton}>
        <Pressable
          onPress={rejectTerms}
          style={styles.ButtonReject}
          accessibilityLabel="Recusar Termos"
          accessibilityHint="Toque para recusar os termos e sair do aplicativo."
          accessibilityRole="button"
        >
          <AppText baseSize={FontSizes.Normal} style={styles.ButtonText}>
            Recusar Termos
          </AppText>
        </Pressable>

        <Pressable
          onPress={acceptTerms}
          style={styles.Button}
          accessibilityLabel="Aceitar Termos"
          accessibilityHint="Toque para aceitar os termos e usar o aplicativo."
          accessibilityRole="button"
        >
          <AppText baseSize={FontSizes.Normal} style={styles.ButtonText}>
            Aceitar Termos
          </AppText>
        </Pressable>
      </View>
    </ScrollView>
  );
};
