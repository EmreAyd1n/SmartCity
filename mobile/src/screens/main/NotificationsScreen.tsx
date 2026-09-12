import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
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
import NotificationItem from '../../components/NotificationItem';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonNotificationList } from '../../components/common/SkeletonLoaders';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

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
      <View className="px-4">
        <NotificationItem item={item} onPress={handleNotificationPress} />
      </View>
    ),
    [handleNotificationPress]
  );

  const renderEmptyState = useCallback(
    () => (
      <EmptyState 
        icon="notifications-off-outline"
        title="Henüz bildirim yok"
        description="Yeni bildirimleriniz burada listelenecektir."
      />
    ),
    []
  );

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="pt-14 flex-row items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 -ml-2 rounded-full"
        >
          <Ionicons name="arrow-back" size={24} color="#9ca3af" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800 dark:text-gray-100">Bildirimler</Text>
        {notifications.length > 0 ? (
          <TouchableOpacity
            onPress={handleClearAll}
            className="py-1 px-2 rounded-lg"
          >
            <Text className="text-red-500 dark:text-red-400 text-sm font-medium">
              Tümünü Temizle
            </Text>
          </TouchableOpacity>
        ) : (
          <View className="w-20" />
        )}
      </View>

      {/* Content */}
      {loading ? (
        <SkeletonNotificationList count={6} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={useCallback((item: NotificationLog) => item.id, [])}
          renderItem={renderNotificationItem}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
        />
      )}
    </View>
  );
}
