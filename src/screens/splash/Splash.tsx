import { useEffect, useState } from "react";
import { View } from "react-native";
import Video from "react-native-video";
import { useRouter } from "expo-router";

import { styles } from "./styles";

export const Splash = () => {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
      router.replace("/control-bluetooth-stack");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View accessible={false} style={styles.container}>
      <Video
        source={require("../../shared/assets/images/splash.mp4")}
        style={styles.video}
        resizeMode="cover"
        onEnd={() => setIsLoaded(true)}
        muted={false}
        repeat={false}
        accessible={false}
      />
    </View>
  );
};
