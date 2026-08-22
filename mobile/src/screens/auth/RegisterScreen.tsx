import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen({ navigation }: any) {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signUp, loading } = useAuth();
  const [localLoading, setLocalLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !displayName) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor.');
      return;
    }

    setLocalLoading(true);
    const { error } = await signUp(email, password, displayName);
    setLocalLoading(false);

    if (error) {
      Alert.alert('Kayıt Başarısız', error.message);
    } else {
      Alert.alert('Başarılı', 'Kayıt işleminiz başarıyla tamamlandı. Lütfen giriş yapın.', [
        { text: 'Tamam', onPress: () => navigation.navigate('Login') }
      ]);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32 }}>
        <View className="mb-10">
          <Text className="text-4xl font-bold text-blue-600 mb-2">Kayıt Ol</Text>
          <Text className="text-gray-500 text-lg">SmartCity'ye katılın</Text>
        </View>

        <View className="mb-6">
          <Text className="text-gray-700 font-medium mb-2">Ad Soyad</Text>
          <TextInput
            className="bg-gray-100 p-4 rounded-xl text-gray-800"
            placeholder="Adınız ve Soyadınız"
            value={displayName}
            onChangeText={setDisplayName}
          />
        </View>

        <View className="mb-6">
          <Text className="text-gray-700 font-medium mb-2">E-posta</Text>
          <TextInput
            className="bg-gray-100 p-4 rounded-xl text-gray-800"
            placeholder="E-posta adresiniz"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View className="mb-6">
          <Text className="text-gray-700 font-medium mb-2">Şifre</Text>
          <TextInput
            className="bg-gray-100 p-4 rounded-xl text-gray-800"
            placeholder="Şifreniz"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View className="mb-8">
          <Text className="text-gray-700 font-medium mb-2">Şifre Tekrarı</Text>
          <TextInput
            className="bg-gray-100 p-4 rounded-xl text-gray-800"
            placeholder="Şifrenizi tekrar girin"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          onPress={handleRegister}
          disabled={loading || localLoading}
          className={`p-4 rounded-xl items-center ${loading || localLoading ? 'bg-blue-400' : 'bg-blue-600'}`}
        >
          {loading || localLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Hesap Oluştur</Text>
          )}
        </TouchableOpacity>

        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-600">Zaten hesabınız var mı? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text className="text-blue-600 font-bold">Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
