import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const getRoleBadge = (role: 'citizen' | 'field_team' | 'admin') => {
  switch (role) {
    case 'admin':
      return {
        label: 'Yönetici',
        bg: 'bg-red-100',
        textCol: 'text-red-800',
        icon: 'shield-checkmark' as const,
        iconColor: '#dc2626',
      };
    case 'field_team':
      return {
        label: 'Saha Personeli',
        bg: 'bg-blue-100',
        textCol: 'text-blue-800',
        icon: 'construct' as const,
        iconColor: '#2563eb',
      };
    default:
      return {
        label: 'Vatandaş',
        bg: 'bg-emerald-100',
        textCol: 'text-emerald-800',
        icon: 'person' as const,
        iconColor: '#10b981',
      };
  }
};

export default function ProfileScreen() {
  const { user, role, signOut } = useAuth();
  const roleBadge = getRoleBadge(role);
  const userName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Kullanıcı';
  const userEmail = user?.email || '';

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 pt-16 pb-8 px-4 items-center rounded-b-3xl">
        <View className="bg-white/20 w-20 h-20 rounded-full items-center justify-center mb-3">
          <Ionicons name="person" size={40} color="white" />
        </View>
        <Text className="text-white text-xl font-bold">{userName}</Text>
        <Text className="text-blue-200 text-sm mt-1">{userEmail}</Text>

        {/* Role Badge */}
        <View className={`flex-row items-center mt-3 px-4 py-2 rounded-full ${roleBadge.bg}`}>
          <Ionicons name={roleBadge.icon} size={16} color={roleBadge.iconColor} />
          <Text className={`ml-2 font-semibold text-sm ${roleBadge.textCol}`}>
            {roleBadge.label}
          </Text>
        </View>
      </View>

      {/* Menu Items */}
      <View className="px-4 mt-6">
        <View className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
            <View className="bg-blue-100 p-2 rounded-full mr-3">
              <Ionicons name="document-text-outline" size={20} color="#3b82f6" />
            </View>
            <Text className="flex-1 text-gray-800 font-medium">Bildirimlerim</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
            <View className="bg-purple-100 p-2 rounded-full mr-3">
              <Ionicons name="settings-outline" size={20} color="#8b5cf6" />
            </View>
            <Text className="flex-1 text-gray-800 font-medium">Ayarlar</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4">
            <View className="bg-amber-100 p-2 rounded-full mr-3">
              <Ionicons name="help-circle-outline" size={20} color="#f59e0b" />
            </View>
            <Text className="flex-1 text-gray-800 font-medium">Yardım</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sign Out */}
      <View className="px-4 mt-6">
        <TouchableOpacity
          className="bg-red-500 py-4 rounded-2xl items-center flex-row justify-center"
          onPress={signOut}
        >
          <Ionicons name="log-out-outline" size={20} color="white" />
          <Text className="text-white font-bold ml-2">Çıkış Yap</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
