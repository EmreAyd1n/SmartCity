// @ts-expect-error NativeWind global css import
import './global.css';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View className="flex-1 bg-white items-center justify-center">
      <Text className="text-xl font-bold text-blue-500">SmartCity App is ready!</Text>
      <StatusBar style="auto" />
    </View>
  );
}
