import { ActivityIndicator, Text, View, SafeAreaView, Modal } from "react-native";
import { styles } from "./styles";

interface LoadingProps {
  LoadingVisible: boolean;
}


export const Loading: React.FC<LoadingProps> = ({

  LoadingVisible,
}) => {
  return (
    <SafeAreaView>
          <View style={styles.container}>
    <Modal visible={LoadingVisible} animationType="slide" transparent>
    <View style={styles.loadingOverlay}>
      
        <ActivityIndicator size="large" color="#ffffffff" />
        <Text style={styles.loadingText}>Conectando...</Text>
      
    </View>
    </Modal>
    </View>
    </SafeAreaView>
  );
};
