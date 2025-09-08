import {
  ActivityIndicator,
  View,
  SafeAreaView,
  Modal,
} from "react-native";
import { styles } from "./styles";
import { AppText } from "../appText/AppText";
import { FontSizes } from "@/src/shared/constants/fontSizes";
import { theme } from "../../styles";
interface LoadingProps {
  LoadingVisible: boolean;
  accessibilityLabel: string;
  accessibilityRole: "progressbar";
}

export const Loading: React.FC<LoadingProps> = ({ LoadingVisible }) => {
  return (
    <SafeAreaView>
      <View style={styles.container}>
        <Modal
          accessibilityViewIsModal={true}
          visible={LoadingVisible}
          animationType="slide"
          transparent
        >
          <View style={styles.loadingOverlay} accessible={true} accessibilityLabel="Carregando, por favor aguarde">
            <ActivityIndicator size="large" color={theme.colors.background} />
            <AppText baseSize={FontSizes.Large} style={styles.loadingText} accessible={true} >Conectando...</AppText>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};
