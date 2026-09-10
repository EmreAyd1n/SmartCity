import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotificationLog } from '../services/notificationService';

const formatDate = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
};

interface NotificationItemProps {
  item: NotificationLog;
  onPress: (item: NotificationLog) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ item, onPress }) => {
  return (
    <TouchableOpacity
      className={`mb-3 p-4 rounded-2xl shadow-sm flex-row items-start ${
        item.isRead ? 'bg-white dark:bg-gray-800' : 'bg-blue-50 dark:bg-blue-900/30'
      }`}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      {/* Unread indicator */}
      <View className="w-4 pt-1 items-center mr-2">
        {!item.isRead ? (
          <View className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-500" />
        ) : (
          <View className="w-2.5 h-2.5" />
        )}
      </View>

      {/* Content */}
      <View className="flex-1">
        <Text
          className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1"
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-sm mb-2" numberOfLines={2}>
          {item.body}
        </Text>
        <Text className="text-gray-400 dark:text-gray-500 text-xs">
          {formatDate(item.receivedAt)}
        </Text>
      </View>

      {/* Chevron for items with issueId */}
      {item.issueId && (
        <View className="justify-center ml-2 pt-1">
          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default React.memo(NotificationItem);
