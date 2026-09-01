import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  NotificationLog,
  getStoredNotifications,
  markNotificationAsRead,
  clearNotifications,
} from '../../services/notificationService';
import { RootStackParamList } from '../../navigation/RootNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

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

export default function NotificationsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    const stored = await getStoredNotifications();
    setNotifications(stored);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadNotifications();
    }, [loadNotifications])
  );

  const handleNotificationPress = useCallback(
    async (item: NotificationLog) => {
      if (!item.isRead) {
        await markNotificationAsRead(item.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
        );
      }

      if (item.issueId) {
        navigation.navigate('IssueDetail', {
          issue: {
            id: item.issueId,
            title: item.title,
            status: 'pending',
            created_at: item.receivedAt,
          },
        });
      }
    },
    [navigation]
  );

  const handleClearAll = useCallback(() => {
    Alert.alert(
      'Bildirimleri Temizle',
      'Tüm bildirimleri silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Tümünü Temizle',
          style: 'destructive',
          onPress: async () => {
            await clearNotifications();
            setNotifications([]);
          },
        },
      ]
    );
  }, []);

  const renderNotificationItem = useCallback(
    ({ item }: { item: NotificationLog }) => (
      <TouchableOpacity
        className={`mx-4 mb-3 p-4 rounded-2xl shadow-sm flex-row items-start ${
          item.isRead ? 'bg-white' : 'bg-blue-50'
        }`}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        {/* Unread indicator */}
        <View className="w-4 pt-1 items-center mr-2">
          {!item.isRead ? (
            <View className="w-2.5 h-2.5 rounded-full bg-blue-600" />
          ) : (
            <View className="w-2.5 h-2.5" />
          )}
        </View>

        {/* Content */}
        <View className="flex-1">
          <Text
            className="text-base font-bold text-gray-900 mb-1"
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text className="text-gray-500 text-sm mb-2" numberOfLines={2}>
            {item.body}
          </Text>
          <Text className="text-gray-400 text-xs">
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
    ),
    [handleNotificationPress]
  );

  const renderEmptyState = useCallback(
    () => (
      <View className="flex-1 justify-center items-center pt-32 px-4">
        <Ionicons name="notifications-off-outline" size={64} color="#9ca3af" />
        <Text className="text-gray-500 text-lg font-semibold mt-4">
          Henüz bildirim yok
        </Text>
        <Text className="text-gray-400 text-sm mt-1 text-center">
          Yeni bildirimleriniz burada listelenecektir.
        </Text>
      </View>
    ),
    []
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="pt-14 flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 -ml-2 rounded-full"
        >
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800">Bildirimler</Text>
        {notifications.length > 0 ? (
          <TouchableOpacity
            onPress={handleClearAll}
            className="py-1 px-2 rounded-lg"
          >
            <Text className="text-red-500 text-sm font-medium">
              Tümünü Temizle
            </Text>
          </TouchableOpacity>
        ) : (
          <View className="w-20" />
        )}
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotificationItem}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
