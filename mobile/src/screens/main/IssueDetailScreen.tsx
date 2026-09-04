import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { updateIssueStatus, Issue } from '../../services/issueService';
import { sendLocalNotification } from '../../services/notificationService';

type IssueDetailRouteParams = {
  IssueDetail: {
    issue: Issue;
  };
};

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'resolved':
    case 'çözüldü':
      return {
        text: 'Çözüldü',
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        textCol: 'text-emerald-800 dark:text-emerald-300',
        icon: 'checkmark-circle' as const,
        iconColor: '#10b981',
        step: 3,
      };
    case 'in_progress':
    case 'devam_ediyor':
    case 'işlemde':
      return {
        text: 'İşlemde',
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        textCol: 'text-blue-800 dark:text-blue-300',
        icon: 'construct' as const,
        iconColor: '#3b82f6',
        step: 2,
      };
    default:
      return {
        text: 'Beklemede',
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        textCol: 'text-amber-800 dark:text-amber-300',
        icon: 'time' as const,
        iconColor: '#f59e0b',
        step: 1,
      };
  }
};

const formatDate = (isoString: string) => {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
};

export default function IssueDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<IssueDetailRouteParams, 'IssueDetail'>>();
  const { role } = useAuth();
  const { colors } = useTheme();

  const [issue, setIssue] = useState<Issue>(route.params.issue);
  const [updating, setUpdating] = useState(false);

  const statusInfo = getStatusInfo(issue.status);
  const isFieldTeamOrAdmin = role === 'field_team' || role === 'admin';

  const handleStatusUpdate = async (newStatus: 'in_progress' | 'resolved') => {
    const statusLabel = newStatus === 'in_progress' ? 'İşleme Al' : 'Çözüldü Olarak İşaretle';

    Alert.alert(
      'Durum Güncelle',
      `Bu bildirimi "${statusLabel}" olarak güncellemek istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Onayla',
          onPress: async () => {
            setUpdating(true);
            try {
              const updated = await updateIssueStatus(issue.id, newStatus);
              if (updated) {
                setIssue(updated);
                
                const title = newStatus === 'in_progress' ? 'Bildirim İşleme Alındı' : 'Bildirim Çözüldü';
                const body = newStatus === 'in_progress' 
                  ? `"${issue.title}" başlıklı bildiriminiz işleme alınmıştır.` 
                  : `"${issue.title}" başlıklı bildiriminiz çözülmüştür.`;
                  
                await sendLocalNotification(title, body);
                
                Alert.alert('Başarılı', 'Durum başarıyla güncellendi.');
              } else {
                Alert.alert('Hata', 'Durum güncellenirken bir sorun oluştu.');
              }
            } catch {
              Alert.alert('Hata', 'Durum güncellenirken bir sorun oluştu.');
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  const ProgressTracker = () => {
    const currentStep = statusInfo.step;
    const steps = [
      { label: 'Beklemede', icon: 'time' as const },
      { label: 'İşlemde', icon: 'construct' as const },
      { label: 'Çözüldü', icon: 'checkmark-circle' as const },
    ];

    return (
      <View className="bg-white dark:bg-gray-800 mx-4 mt-4 p-4 rounded-2xl shadow-sm">
        <Text className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-4">Süreç Durumu</Text>
        <View className="flex-row items-center justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber <= currentStep;
            const isLast = index === steps.length - 1;

            return (
              <React.Fragment key={step.label}>
                <View className="items-center flex-1">
                  <View
                    className={`w-10 h-10 rounded-full items-center justify-center ${
                      isActive ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <Ionicons
                      name={step.icon}
                      size={20}
                      color={isActive ? 'white' : '#9ca3af'}
                    />
                  </View>
                  <Text
                    className={`text-xs mt-1 ${
                      isActive ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {step.label}
                  </Text>
                </View>
                {!isLast && (
                  <View
                    className={`h-0.5 flex-1 mx-1 ${
                      stepNumber < currentStep ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="bg-blue-600 dark:bg-blue-800 pt-14 pb-4 px-4 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold flex-1" numberOfLines={1}>
          Bildirim Detayı
        </Text>
        <View className={`px-3 py-1 rounded-full ${statusInfo.bg}`}>
          <Text className={`text-xs font-medium ${statusInfo.textCol}`}>
            {statusInfo.text}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Image */}
        {issue.image_url ? (
          <Image
            source={{ uri: issue.image_url }}
            className="w-full h-56"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-40 bg-gray-200 dark:bg-gray-800 items-center justify-center">
            <Ionicons name="image-outline" size={48} color="#9ca3af" />
            <Text className="text-gray-400 dark:text-gray-500 mt-2">Fotoğraf yok</Text>
          </View>
        )}

        {/* Title & Description */}
        <View className="bg-white dark:bg-gray-800 mx-4 mt-4 p-4 rounded-2xl shadow-sm">
          <Text className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{issue.title}</Text>
          {issue.description ? (
            <Text className="text-gray-600 dark:text-gray-300 leading-5">{issue.description}</Text>
          ) : (
            <Text className="text-gray-400 dark:text-gray-500 italic">Açıklama eklenmemiş.</Text>
          )}
        </View>

        {/* Details */}
        <View className="bg-white dark:bg-gray-800 mx-4 mt-4 p-4 rounded-2xl shadow-sm">
          <Text className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3">Detaylar</Text>

          {issue.category && (
            <View className="flex-row items-center mb-3">
              <View className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full mr-3">
                <Ionicons name="pricetag" size={16} color="#8b5cf6" />
              </View>
              <View>
                <Text className="text-xs text-gray-400 dark:text-gray-500">Kategori</Text>
                <Text className="text-sm text-gray-800 dark:text-gray-200 font-medium">{issue.category}</Text>
              </View>
            </View>
          )}

          <View className="flex-row items-center mb-3">
            <View className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full mr-3">
              <Ionicons name="calendar" size={16} color="#3b82f6" />
            </View>
            <View>
              <Text className="text-xs text-gray-400 dark:text-gray-500">Tarih</Text>
              <Text className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                {formatDate(issue.created_at)}
              </Text>
            </View>
          </View>

          {issue.latitude && issue.longitude && (
            <View className="flex-row items-center">
              <View className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-full mr-3">
                <Ionicons name="location" size={16} color="#10b981" />
              </View>
              <View>
                <Text className="text-xs text-gray-400 dark:text-gray-500">Konum</Text>
                <Text className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                  {issue.latitude.toFixed(4)}, {issue.longitude.toFixed(4)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Progress Tracker */}
        <ProgressTracker />

        {/* Spacer for bottom buttons */}
        <View className="h-32" />
      </ScrollView>

      {/* Status Update Buttons - Only for field_team / admin */}
      {isFieldTeamOrAdmin && (
        <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 pt-3 pb-8">
          {updating ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <View className="flex-row">
              {issue.status === 'pending' && (
                <TouchableOpacity
                  className="flex-1 bg-blue-600 py-3 rounded-xl items-center flex-row justify-center"
                  onPress={() => handleStatusUpdate('in_progress')}
                >
                  <Ionicons name="construct" size={20} color="white" />
                  <Text className="text-white font-bold ml-2">İşleme Al</Text>
                </TouchableOpacity>
              )}

              {(issue.status === 'pending' || issue.status === 'in_progress') && (
                <TouchableOpacity
                  className={`flex-1 bg-emerald-500 py-3 rounded-xl items-center flex-row justify-center ${
                    issue.status === 'pending' ? 'ml-3' : ''
                  }`}
                  onPress={() => handleStatusUpdate('resolved')}
                >
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <Text className="text-white font-bold ml-2">Çözüldü İşaretle</Text>
                </TouchableOpacity>
              )}

              {issue.status === 'resolved' && (
                <View className="flex-1 bg-gray-100 dark:bg-gray-700 py-3 rounded-xl items-center flex-row justify-center">
                  <Ionicons name="checkmark-done-circle" size={20} color="#10b981" />
                  <Text className="text-emerald-700 dark:text-emerald-400 font-bold ml-2">Bu sorun çözüldü</Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
}
