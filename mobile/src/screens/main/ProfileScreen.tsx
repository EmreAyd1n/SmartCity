import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const { signOut } = useAuth();

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-gray-800 mb-6">Profil</Text>
      <TouchableOpacity 
        className="bg-red-500 py-3 px-8 rounded-full"
        onPress={signOut}
      >
        <Text className="text-white font-bold">Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
}
