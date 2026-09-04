import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import { profileService } from '../../services/profileService';

const getRoleBadge = (role: 'citizen' | 'field_team' | 'admin') => {
  switch (role) {
    case 'admin':
      return {
        label: 'Yönetici',
        bg: 'bg-red-100 dark:bg-red-900/30',
        textCol: 'text-red-800 dark:text-red-300',
        icon: 'shield-checkmark' as const,
        iconColor: '#ef4444',
      };
    case 'field_team':
      return {
        label: 'Saha Personeli',
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        textCol: 'text-blue-800 dark:text-blue-300',
        icon: 'construct' as const,
        iconColor: '#3b82f6',
      };
    default:
      return {
        label: 'Vatandaş',
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        textCol: 'text-emerald-800 dark:text-emerald-300',
        icon: 'person' as const,
        iconColor: '#10b981',
      };
  }
};

export default function ProfileScreen() {
  const { user, profile, role, signOut, refreshProfile } = useAuth();
  const { themeMode, setThemeMode } = useTheme();
  const roleBadge = getRoleBadge(role);
  
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const userName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Kullanıcı';
  const userEmail = user?.email || '';
  const displayName = profile?.first_name || profile?.last_name ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : userName;

  const handlePickAvatar = async () => {
    if (!user) return;
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUploadingAvatar(true);
        const imageUri = result.assets[0].uri;
        
        const avatarUrl = await profileService.uploadAvatarImage(imageUri, user.id);
        await profileService.updateUserProfile(user.id, { avatar_url: avatarUrl });
        await refreshProfile();
        Alert.alert('Başarılı', 'Profil fotoğrafınız güncellendi.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Hata', 'Profil fotoğrafı güncellenirken bir sorun oluştu.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await profileService.updateUserProfile(user.id, {
        first_name: firstName,
        last_name: lastName,
        phone: phone,
      });
      await refreshProfile();
      setIsEditing(false);
      Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi.');
    } catch (error) {
      console.error(error);
      Alert.alert('Hata', 'Profil güncellenirken bir sorun oluştu.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="bg-blue-600 dark:bg-blue-800 pt-16 pb-8 px-4 items-center rounded-b-3xl">
        <TouchableOpacity 
          className="bg-white/20 w-24 h-24 rounded-full items-center justify-center mb-3 relative overflow-hidden"
          onPress={handlePickAvatar}
          disabled={uploadingAvatar}
        >
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} className="w-full h-full rounded-full" />
          ) : (
            <Ionicons name="person" size={50} color="white" />
          )}
          <View className="absolute bottom-0 w-full bg-black/40 items-center py-1">
            <Text className="text-white text-[10px]">Değiştir</Text>
          </View>
          {uploadingAvatar && (
            <View className="absolute inset-0 bg-black/50 items-center justify-center">
              <ActivityIndicator color="white" />
            </View>
          )}
        </TouchableOpacity>
        
        <Text className="text-white text-xl font-bold">{displayName}</Text>
        <Text className="text-blue-200 text-sm mt-1">{userEmail}</Text>

        <View className={`flex-row items-center mt-3 px-4 py-2 rounded-full ${roleBadge.bg}`}>
          <Ionicons name={roleBadge.icon} size={16} color={roleBadge.iconColor} />
          <Text className={`ml-2 font-semibold text-sm ${roleBadge.textCol}`}>
            {roleBadge.label}
          </Text>
        </View>
      </View>

      <View className="px-4 mt-6">
        <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden p-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-800 dark:text-gray-100">Kişisel Bilgiler</Text>
            <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
              <Text className="text-blue-600 dark:text-blue-400 font-medium">{isEditing ? 'İptal' : 'Düzenle'}</Text>
            </TouchableOpacity>
          </View>
          
          <View className="space-y-4">
            <View>
              <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">Ad</Text>
              {isEditing ? (
                <TextInput
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-100"
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Adınız"
                  placeholderTextColor="#9ca3af"
                />
              ) : (
                <Text className="text-gray-800 dark:text-gray-200">{profile?.first_name || '-'}</Text>
              )}
            </View>
            
            <View>
              <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">Soyad</Text>
              {isEditing ? (
                <TextInput
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-100"
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Soyadınız"
                  placeholderTextColor="#9ca3af"
                />
              ) : (
                <Text className="text-gray-800 dark:text-gray-200">{profile?.last_name || '-'}</Text>
              )}
            </View>
            
            <View>
              <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">Telefon</Text>
              {isEditing ? (
                <TextInput
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-100"
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="05XX XXX XX XX"
                  keyboardType="phone-pad"
                  placeholderTextColor="#9ca3af"
                />
              ) : (
                <Text className="text-gray-800 dark:text-gray-200">{profile?.phone || '-'}</Text>
              )}
            </View>
          </View>

          {isEditing && (
            <TouchableOpacity 
              className="bg-blue-600 py-3 rounded-xl mt-6 items-center flex-row justify-center"
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={20} color="white" />
                  <Text className="text-white font-bold ml-2">Kaydet</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View className="px-4 mt-6">
        <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden p-4">
          <Text className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Uygulama Teması</Text>
          <View className="flex-row justify-between space-x-2">
            <TouchableOpacity 
              className={`flex-1 items-center p-3 rounded-xl border ${themeMode === 'system' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-200 dark:border-gray-700'}`}
              onPress={() => setThemeMode('system')}
            >
              <Ionicons name="phone-portrait-outline" size={24} color={themeMode === 'system' ? '#3b82f6' : '#9ca3af'} />
              <Text className={`mt-2 text-sm font-medium ${themeMode === 'system' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>Sistem</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className={`flex-1 items-center p-3 rounded-xl border ${themeMode === 'light' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-200 dark:border-gray-700'}`}
              onPress={() => setThemeMode('light')}
            >
              <Ionicons name="sunny-outline" size={24} color={themeMode === 'light' ? '#3b82f6' : '#9ca3af'} />
              <Text className={`mt-2 text-sm font-medium ${themeMode === 'light' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>Açık</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className={`flex-1 items-center p-3 rounded-xl border ${themeMode === 'dark' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-200 dark:border-gray-700'}`}
              onPress={() => setThemeMode('dark')}
            >
              <Ionicons name="moon-outline" size={24} color={themeMode === 'dark' ? '#3b82f6' : '#9ca3af'} />
              <Text className={`mt-2 text-sm font-medium ${themeMode === 'dark' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>Karanlık</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View className="px-4 mt-6">
        <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100 dark:border-gray-700">
            <View className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full mr-3">
              <Ionicons name="document-text-outline" size={20} color="#3b82f6" />
            </View>
            <Text className="flex-1 text-gray-800 dark:text-gray-200 font-medium">Bildirimlerim</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100 dark:border-gray-700">
            <View className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full mr-3">
              <Ionicons name="settings-outline" size={20} color="#8b5cf6" />
            </View>
            <Text className="flex-1 text-gray-800 dark:text-gray-200 font-medium">Ayarlar</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center p-4">
            <View className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-full mr-3">
              <Ionicons name="help-circle-outline" size={20} color="#f59e0b" />
            </View>
            <Text className="flex-1 text-gray-800 dark:text-gray-200 font-medium">Yardım</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-4 mt-6 mb-8">
        <TouchableOpacity
          className="bg-red-500 dark:bg-red-600 py-4 rounded-2xl items-center flex-row justify-center"
          onPress={signOut}
        >
          <Ionicons name="log-out-outline" size={20} color="white" />
          <Text className="text-white font-bold ml-2">Çıkış Yap</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
