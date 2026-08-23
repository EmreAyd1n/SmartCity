import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { getRecentIssues, getIssueStats, Issue, IssueStats } from '../../services/issueService';

type RootTabParamList = {
  Home: undefined;
  Report: undefined;
  Map: undefined;
  Profile: undefined;
};

type NavigationProp = BottomTabNavigationProp<RootTabParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<IssueStats | null>(null);
  const [recentIssues, setRecentIssues] = useState<Issue[]>([]);

  const fetchData = async () => {
    const [fetchedStats, fetchedIssues] = await Promise.all([
      getIssueStats(),
      getRecentIssues(4),
    ]);
    setStats(fetchedStats);
    setRecentIssues(fetchedIssues);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'çözüldü':
        return { text: 'Çözüldü', bg: 'bg-emerald-100', textCol: 'text-emerald-800' };
      case 'in_progress':
      case 'devam_ediyor':
      case 'işlemde':
        return { text: 'İşlemde', bg: 'bg-blue-100', textCol: 'text-blue-800' };
      default:
        return { text: 'Bekliyor', bg: 'bg-amber-100', textCol: 'text-amber-800' };
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
    } catch {
      return isoString;
    }
  };

  const userName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Vatandaş';

  return (
    <ScrollView 
      className="flex-1 bg-gray-50"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View className="bg-blue-600 pt-16 pb-6 px-4 rounded-b-3xl">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-blue-100 text-sm">Merhaba,</Text>
            <Text className="text-white text-2xl font-bold">{userName}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} className="bg-blue-500 p-2 rounded-full">
            <Ionicons name="person" size={24} color="white" />
          </TouchableOpacity>
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
        {/* Stats */}
        <Text className="text-lg font-bold text-gray-800 mb-3">Özet İstatistikler</Text>
        {loading && !refreshing ? (
          <ActivityIndicator size="small" color="#2563eb" />
        ) : (
          <View className="flex-row flex-wrap justify-between">
            <View className="bg-white w-[48%] p-4 rounded-2xl shadow-sm mb-4">
              <Ionicons name="documents-outline" size={24} color="#3b82f6" />
              <Text className="text-3xl font-bold text-gray-800 mt-2">{stats?.total || 0}</Text>
              <Text className="text-gray-500 text-xs mt-1">Toplam Bildirim</Text>
            </View>
            <View className="bg-white w-[48%] p-4 rounded-2xl shadow-sm mb-4">
              <Ionicons name="checkmark-circle-outline" size={24} color="#10b981" />
              <Text className="text-3xl font-bold text-gray-800 mt-2">{stats?.resolved || 0}</Text>
              <Text className="text-gray-500 text-xs mt-1">Çözülen</Text>
            </View>
            <View className="bg-white w-[48%] p-4 rounded-2xl shadow-sm mb-4">
              <Ionicons name="construct-outline" size={24} color="#f59e0b" />
              <Text className="text-3xl font-bold text-gray-800 mt-2">{stats?.inProgress || 0}</Text>
              <Text className="text-gray-500 text-xs mt-1">İşlemde</Text>
            </View>
            <View className="bg-white w-[48%] p-4 rounded-2xl shadow-sm mb-4">
              <Ionicons name="people-outline" size={24} color="#8b5cf6" />
              <Text className="text-3xl font-bold text-gray-800 mt-2">{stats?.activeTeams || 0}</Text>
              <Text className="text-gray-500 text-xs mt-1">Saha Ekibi Aktif</Text>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <Text className="text-lg font-bold text-gray-800 mb-3 mt-2">Hızlı İşlemler</Text>
        <View className="flex-row justify-between mb-6">
          <TouchableOpacity 
            className="bg-blue-600 flex-1 mr-2 p-4 rounded-2xl items-center flex-row justify-center"
            onPress={() => navigation.navigate('Report')}
          >
            <Ionicons name="add-circle" size={24} color="white" />
            <Text className="text-white font-bold ml-2">Sorun Bildir</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="bg-emerald-500 flex-1 ml-2 p-4 rounded-2xl items-center flex-row justify-center"
            onPress={() => navigation.navigate('Map')}
          >
            <Ionicons name="map" size={24} color="white" />
            <Text className="text-white font-bold ml-2">Canlı Harita</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <View className="flex-row justify-between items-end mb-3">
          <Text className="text-lg font-bold text-gray-800">Son Bildirimler</Text>
          <TouchableOpacity>
            <Text className="text-blue-600 text-sm">Tümünü Gör</Text>
          </TouchableOpacity>
        </View>

        {loading && !refreshing ? (
          <ActivityIndicator size="small" color="#2563eb" className="mt-4" />
        ) : recentIssues.length === 0 ? (
          <View className="bg-white p-6 rounded-2xl shadow-sm items-center">
            <Text className="text-gray-500">Henüz bildirim bulunmamaktadır.</Text>
          </View>
        ) : (
          recentIssues.map((issue) => {
            const badge = getStatusBadge(issue.status);
            return (
              <View key={issue.id} className="bg-white p-4 rounded-2xl shadow-sm mb-3 flex-row justify-between items-center">
                <View className="flex-1 mr-3">
                  <Text className="text-gray-800 font-semibold mb-1" numberOfLines={1}>{issue.title}</Text>
                  <Text className="text-gray-400 text-xs">{formatDate(issue.created_at)}</Text>
                </View>
                <View className={`px-3 py-1 rounded-full ${badge.bg}`}>
                  <Text className={`text-xs font-medium ${badge.textCol}`}>{badge.text}</Text>
                </View>
              </View>
            );
          })
        )}
        
        <View className="h-10" />
      </View>
    </ScrollView>
  );
}
