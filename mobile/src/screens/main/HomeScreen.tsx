import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, RefreshControl, TouchableOpacity, ActivityIndicator, FlatList, Platform } from 'react-native';
import { useNavigation, useFocusEffect, CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { getRecentIssues, getIssueStats, Issue, IssueStats } from '../../services/issueService';
import { getUnreadNotificationCount } from '../../services/notificationService';
import { RootStackParamList } from '../../navigation/RootNavigator';
import OfflineBanner from '../../components/OfflineBanner';
import IssueCard from '../../components/IssueCard';

type RootTabParamList = {
  Home: undefined;
  Report: undefined;
  Map: undefined;
  Profile: undefined;
};

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<RootTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<IssueStats | null>(null);
  const [recentIssues, setRecentIssues] = useState<Issue[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchData = async () => {
    const [fetchedStats, fetchedIssues, fetchedUnreadCount] = await Promise.all([
      getIssueStats(),
      getRecentIssues(4),
      getUnreadNotificationCount(),
    ]);
    setStats(fetchedStats);
    setRecentIssues(fetchedIssues);
    setUnreadCount(fetchedUnreadCount);
  };

  const loadInitialData = async () => {
    setLoading(true);
    await fetchData();
    setLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadInitialData();
    }, [])
  );

  const userName = useMemo(() => {
    return user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Vatandaş';
  }, [user]);

  const handleIssuePress = useCallback((issue: Issue) => {
    navigation.navigate('IssueDetail', { issue });
  }, [navigation]);

  const renderHeader = useCallback(() => (
    <>
      <View className="bg-blue-600 dark:bg-blue-800 pt-16 pb-6 px-4 rounded-b-3xl">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-blue-100 text-sm">Merhaba,</Text>
            <Text className="text-white text-2xl font-bold">{userName}</Text>
          </View>
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => navigation.navigate('Notifications')}
              className="bg-blue-500 dark:bg-blue-700 p-2 rounded-full mr-2 relative"
            >
              <Ionicons name="notifications" size={24} color="white" />
              {unreadCount > 0 && (
                <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[20px] h-5 items-center justify-center px-1">
                  <Text className="text-white text-xs font-bold">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')} className="bg-blue-500 dark:bg-blue-700 p-2 rounded-full">
              <Ionicons name="person" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        <View className="bg-white/20 mt-4 p-3 rounded-xl flex-row items-center">
          <Ionicons name="partly-sunny" size={24} color="white" />
          <View className="ml-3 flex-1">
            <Text className="text-white font-semibold text-base">Elazığ Şehir Durumu</Text>
            <Text className="text-blue-100 text-sm">Hava Kalitesi: İyi (AQI: 42)</Text>
          </View>
        </View>
      </View>

      <View className="px-4 pt-6">
        <Text className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">Özet İstatistikler</Text>
        {loading && !refreshing ? (
          <ActivityIndicator size="small" color="#3b82f6" />
        ) : (
          <View className="flex-row flex-wrap justify-between">
            <View className="bg-white dark:bg-gray-800 w-[48%] p-4 rounded-2xl shadow-sm mb-4">
              <Ionicons name="documents-outline" size={24} color="#3b82f6" />
              <Text className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-2">{stats?.total || 0}</Text>
              <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">Toplam Bildirim</Text>
            </View>
            <View className="bg-white dark:bg-gray-800 w-[48%] p-4 rounded-2xl shadow-sm mb-4">
              <Ionicons name="checkmark-circle-outline" size={24} color="#10b981" />
              <Text className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-2">{stats?.resolved || 0}</Text>
              <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">Çözülen</Text>
            </View>
            <View className="bg-white dark:bg-gray-800 w-[48%] p-4 rounded-2xl shadow-sm mb-4">
              <Ionicons name="construct-outline" size={24} color="#f59e0b" />
              <Text className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-2">{stats?.inProgress || 0}</Text>
              <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">İşlemde</Text>
            </View>
            <View className="bg-white dark:bg-gray-800 w-[48%] p-4 rounded-2xl shadow-sm mb-4">
              <Ionicons name="people-outline" size={24} color="#8b5cf6" />
              <Text className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-2">{stats?.activeTeams || 0}</Text>
              <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">Saha Ekibi Aktif</Text>
            </View>
          </View>
        )}

        <Text className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3 mt-2">Hızlı İşlemler</Text>
        <View className="flex-row justify-between mb-6">
          <TouchableOpacity 
            className="bg-blue-600 dark:bg-blue-700 flex-1 mr-2 p-4 rounded-2xl items-center flex-row justify-center"
            onPress={() => navigation.navigate('Report')}
          >
            <Ionicons name="add-circle" size={24} color="white" />
            <Text className="text-white font-bold ml-2">Sorun Bildir</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="bg-emerald-500 dark:bg-emerald-600 flex-1 ml-2 p-4 rounded-2xl items-center flex-row justify-center"
            onPress={() => navigation.navigate('Map')}
          >
            <Ionicons name="map" size={24} color="white" />
            <Text className="text-white font-bold ml-2">Canlı Harita</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-between items-end mb-3">
          <Text className="text-lg font-bold text-gray-800 dark:text-gray-100">Son Bildirimler</Text>
          <TouchableOpacity>
            <Text className="text-blue-600 dark:text-blue-400 text-sm">Tümünü Gör</Text>
          </TouchableOpacity>
        </View>

        {loading && !refreshing && (
          <ActivityIndicator size="small" color="#3b82f6" className="mt-4 mb-4" />
        )}
      </View>
    </>
  ), [userName, unreadCount, stats, loading, refreshing, navigation]);

  const renderEmpty = useCallback(() => {
    if (loading && !refreshing) return null;
    return (
      <View className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm items-center mx-4">
        <Text className="text-gray-500 dark:text-gray-400">Henüz bildirim bulunmamaktadır.</Text>
      </View>
    );
  }, [loading, refreshing]);

  const renderItem = useCallback(({ item }: { item: Issue }) => (
    <View className="px-4">
      <IssueCard issue={item} onPress={handleIssuePress} />
    </View>
  ), [handleIssuePress]);

  const keyExtractor = useCallback((item: Issue) => item.id, []);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <OfflineBanner />
      <FlatList 
        className="flex-1 bg-gray-50 dark:bg-gray-900"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        data={recentIssues}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={<View className="h-10" />}
        contentContainerStyle={{ paddingBottom: 20 }}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}
      />
    </View>
  );
}
