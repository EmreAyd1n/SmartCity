import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { uploadIssueImage, createIssue } from '../../services/issueService';

type RootTabParamList = {
  Home: undefined;
  Report: undefined;
  Map: undefined;
  Profile: undefined;
};

type NavigationProp = BottomTabNavigationProp<RootTabParamList, 'Report'>;

const CATEGORIES = [
  { id: 'ulasim', label: 'Ulaşım', icon: 'bus-outline' as const },
  { id: 'cevre', label: 'Çevre', icon: 'leaf-outline' as const },
  { id: 'altyapi', label: 'Altyapı', icon: 'construct-outline' as const },
  { id: 'park_bahce', label: 'Park/Bahçe', icon: 'flower-outline' as const },
  { id: 'aydinlatma', label: 'Aydınlatma', icon: 'bulb-outline' as const },
  { id: 'temizlik', label: 'Temizlik', icon: 'trash-outline' as const },
];

export default function ReportIssueScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationText, setLocationText] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // --- Image Picker ---
  const pickImageFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Fotoğraf çekmek için kamera iznine ihtiyacımız var.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Galeriye erişim iznine ihtiyacımız var.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const showImageOptions = () => {
    Alert.alert('Fotoğraf Ekle', 'Fotoğraf kaynağını seçin', [
      { text: 'Kamera', onPress: pickImageFromCamera },
      { text: 'Galeri', onPress: pickImageFromGallery },
      { text: 'İptal', style: 'cancel' },
    ]);
  };

  const removeImage = () => {
    setImageUri(null);
  };

  // --- Location ---
  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Konum için konum erişim izni gereklidir.');
        setLocationLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };
      setLocation(coords);

      // Reverse geocode to get human-readable address
      try {
        const [address] = await Location.reverseGeocodeAsync(coords);
        if (address) {
          const parts = [
            address.street,
            address.district,
            address.subregion,
            address.city,
          ].filter(Boolean);
          setLocationText(parts.join(', ') || `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`);
        } else {
          setLocationText(`${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`);
        }
      } catch {
        setLocationText(`${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`);
      }
    } catch (err) {
      Alert.alert('Hata', 'Konum alınamadı. Lütfen GPS\'inizin açık olduğundan emin olun.');
    } finally {
      setLocationLoading(false);
    }
  };

  // --- Submit ---
  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert('Uyarı', 'Lütfen bir başlık giriniz.');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('Uyarı', 'Lütfen bir kategori seçiniz.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Uyarı', 'Lütfen bir açıklama giriniz.');
      return;
    }

    setSubmitting(true);
    try {
      let uploadedImageUrl: string | undefined;

      // Upload image if selected
      if (imageUri) {
        uploadedImageUrl = await uploadIssueImage(imageUri);
      }

      // Create issue record
      await createIssue({
        title: title.trim(),
        description: description.trim(),
        category: selectedCategory,
        latitude: location?.latitude,
        longitude: location?.longitude,
        image_url: uploadedImageUrl,
      });

      Alert.alert(
        'Başarılı! ✅',
        'Sorun bildiriminiz başarıyla gönderildi. En kısa sürede incelenecektir.',
        [
          {
            text: 'Tamam',
            onPress: () => {
              // Reset form
              setTitle('');
              setDescription('');
              setSelectedCategory(null);
              setImageUri(null);
              setLocation(null);
              setLocationText(null);
              // Navigate to Home
              navigation.navigate('Home');
            },
          },
        ],
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.';
      Alert.alert('Hata', `Bildirim gönderilemedi: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View className="bg-blue-600 dark:bg-blue-800 pt-16 pb-6 px-4 rounded-b-3xl">
          <Text className="text-white text-2xl font-bold">Sorun Bildir</Text>
          <Text className="text-blue-100 dark:text-blue-200 text-sm mt-1">
            Şehrinizdeki sorunu bize bildirin, hemen ilgilenelim.
          </Text>
        </View>

        <View className="px-4 pt-6 pb-10">
          {/* Title Input */}
          <Text className="text-gray-800 dark:text-gray-100 font-semibold text-base mb-2">Başlık</Text>
          <TextInput
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-800 dark:text-gray-100 text-base mb-4"
            placeholder="Sorunun kısa başlığı"
            placeholderTextColor="#9ca3af"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />

          {/* Category Selection */}
          <Text className="text-gray-800 dark:text-gray-100 font-semibold text-base mb-2">Kategori</Text>
          <View className="flex-row flex-wrap mb-4">
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                className={`flex-row items-center px-3 py-2 rounded-full mr-2 mb-2 border ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 border-blue-600 dark:bg-blue-700 dark:border-blue-700'
                    : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                }`}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Ionicons
                  name={cat.icon}
                  size={16}
                  color={selectedCategory === cat.id ? '#ffffff' : '#9ca3af'}
                />
                <Text
                  className={`ml-1.5 text-sm font-medium ${
                    selectedCategory === cat.id ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Description Input */}
          <Text className="text-gray-800 dark:text-gray-100 font-semibold text-base mb-2">Açıklama</Text>
          <TextInput
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-800 dark:text-gray-100 text-base mb-4"
            placeholder="Sorunu detaylı olarak açıklayınız..."
            placeholderTextColor="#9ca3af"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={{ minHeight: 100 }}
          />

          {/* Photo Section */}
          <Text className="text-gray-800 dark:text-gray-100 font-semibold text-base mb-2">Fotoğraf</Text>
          {imageUri ? (
            <View className="mb-4">
              <View className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <Image
                  source={{ uri: imageUri }}
                  style={{ width: '100%', height: 200 }}
                  resizeMode="cover"
                />
              </View>
              <TouchableOpacity
                className="absolute top-2 right-2 bg-red-500 rounded-full p-1.5"
                onPress={removeImage}
              >
                <Ionicons name="close" size={18} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              className="bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl py-8 items-center justify-center mb-4"
              onPress={showImageOptions}
            >
              <Ionicons name="camera-outline" size={40} color="#9ca3af" />
              <Text className="text-gray-400 dark:text-gray-500 mt-2 text-sm">Fotoğraf Çek veya Galeriden Seç</Text>
            </TouchableOpacity>
          )}

          {/* Location Section */}
          <Text className="text-gray-800 dark:text-gray-100 font-semibold text-base mb-2">Konum</Text>
          {location ? (
            <View className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-4">
              <View className="flex-row items-center">
                <View className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-full">
                  <Ionicons name="location" size={20} color="#10b981" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-gray-800 dark:text-gray-100 font-medium text-sm" numberOfLines={2}>
                    {locationText}
                  </Text>
                  <Text className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">
                    {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setLocation(null);
                    setLocationText(null);
                  }}
                >
                  <Ionicons name="close-circle" size={22} color="#9ca3af" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-4 flex-row items-center justify-center"
              onPress={getCurrentLocation}
              disabled={locationLoading}
            >
              {locationLoading ? (
                <>
                  <ActivityIndicator size="small" color="#2563eb" />
                  <Text className="text-blue-600 dark:text-blue-400 font-medium ml-2">Konum alınıyor...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="navigate-outline" size={20} color="#2563eb" />
                  <Text className="text-blue-600 dark:text-blue-400 font-medium ml-2">Mevcut Konumumu Kullan</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            className={`rounded-xl py-4 items-center mt-2 ${
              submitting ? 'bg-blue-400 dark:bg-blue-500' : 'bg-blue-600 dark:bg-blue-700'
            }`}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white font-bold text-base ml-2">Gönderiliyor...</Text>
              </View>
            ) : (
              <View className="flex-row items-center">
                <Ionicons name="send" size={20} color="white" />
                <Text className="text-white font-bold text-base ml-2">Bildirimi Gönder</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
