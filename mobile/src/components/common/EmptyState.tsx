import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title?: string;
  description?: string;
  buttonText?: string;
  onButtonPress?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'document-text-outline',
  title = 'Veri Bulunamadı',
  description = 'Henüz burada gösterilecek bir şey yok.',
  buttonText,
  onButtonPress,
}) => {
  return (
    <View className="flex-1 justify-center items-center py-12 px-6">
      <View className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/20 items-center justify-center mb-4">
        <Ionicons name={icon} size={40} color="#3b82f6" />
      </View>
      <Text className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 text-center">
        {title}
      </Text>
      <Text className="text-gray-500 dark:text-gray-400 text-center mb-6">
        {description}
      </Text>
      
      {buttonText && onButtonPress && (
        <TouchableOpacity
          className="bg-blue-600 px-6 py-3 rounded-xl flex-row items-center justify-center"
          onPress={onButtonPress}
          activeOpacity={0.8}
        >
          <Text className="text-white font-semibold text-base">{buttonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default EmptyState;
