import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function OfflineBanner() {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  if (isConnected !== false) return null;

  return (
    <View style={{ paddingTop: insets.top }} className="bg-red-500 w-full z-50">
      <View className="py-2 flex-row justify-center items-center">
        <Ionicons name="cloud-offline" size={16} color="white" />
        <Text className="text-white ml-2 text-sm font-semibold">
          Çevrimdýþý Mod - Ýnternet Baðlantýsý Yok
        </Text>
      </View>
    </View>
  );
}
