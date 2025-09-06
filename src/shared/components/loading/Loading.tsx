import {
  ActivityIndicator,
  Text,
  View,
  SafeAreaView,
  Modal,
} from "react-native";
import { styles } from "./styles";

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
            <ActivityIndicator size="large" color="#ffffffff" />
            <Text style={styles.loadingText} accessible={true} >Conectando...</Text>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};
