import { useEffect, useState } from "react";
import { View } from "react-native";
import Video from "react-native-video";
import { useNavigation } from "@react-navigation/native";

import { NavigationProp } from "@/app/types/types";
import { styles } from "./styles";

export const Splash = () => {
  const navigation = useNavigation<NavigationProp>();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
      navigation.replace("ControlBluetoothStack");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Video
        source={require("../../shared/assets/images/splash.mp4")}
        style={styles.video}
        resizeMode="cover"
        onEnd={() => setIsLoaded(true)}
        muted={false}
        repeat={false}
      />
    </View>
  );
};
