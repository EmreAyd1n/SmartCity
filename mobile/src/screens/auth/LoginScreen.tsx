import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, loading } = useAuth();
  const [localLoading, setLocalLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen e-posta ve şifrenizi girin.');
      return;
    }

    setLocalLoading(true);
    const { error } = await signIn(email, password);
    setLocalLoading(false);

    if (error) {
      Alert.alert('Giriş Başarısız', error.message);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white justify-center px-8"
    >
      <View className="mb-10">
        <Text className="text-4xl font-bold text-blue-600 mb-2">Hoş Geldiniz</Text>
        <Text className="text-gray-500 text-lg">SmartCity'ye giriş yapın</Text>
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

      <View className="mb-8">
        <Text className="text-gray-700 font-medium mb-2">Şifre</Text>
        <TextInput
          className="bg-gray-100 p-4 rounded-xl text-gray-800"
          placeholder="Şifreniz"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading || localLoading}
        className={`p-4 rounded-xl items-center ${loading || localLoading ? 'bg-blue-400' : 'bg-blue-600'}`}
      >
        {loading || localLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-bold text-lg">Giriş Yap</Text>
        )}
      </TouchableOpacity>

      <View className="flex-row justify-center mt-6">
        <Text className="text-gray-600">Hesabınız yok mu? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text className="text-blue-600 font-bold">Kayıt Ol</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
