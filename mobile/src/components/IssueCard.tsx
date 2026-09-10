import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Issue } from '../services/issueService';
import FallbackImage from './common/FallbackImage';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'resolved':
    case 'çözüldü':
      return { text: 'Çözüldü', bg: 'bg-emerald-100 dark:bg-emerald-900/30', textCol: 'text-emerald-800 dark:text-emerald-300' };
    case 'in_progress':
    case 'devam_ediyor':
    case 'işlemde':
      return { text: 'İşlemde', bg: 'bg-blue-100 dark:bg-blue-900/30', textCol: 'text-blue-800 dark:text-blue-300' };
    default:
      return { text: 'Bekliyor', bg: 'bg-amber-100 dark:bg-amber-900/30', textCol: 'text-amber-800 dark:text-amber-300' };
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

interface IssueCardProps {
  issue: Issue;
  onPress: (issue: Issue) => void;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue, onPress }) => {
  const badge = getStatusBadge(issue.status);

  return (
    <TouchableOpacity
      className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm mb-3 flex-row justify-between items-center"
      onPress={() => onPress(issue)}
      activeOpacity={0.7}
    >
      <FallbackImage 
        uri={issue.image_url} 
        containerStyle={{ width: 48, height: 48, borderRadius: 12, marginRight: 12 }} 
        fallbackIcon="image-outline"
      />
      <View className="flex-1 mr-3">
        <Text className="text-gray-800 dark:text-gray-100 font-semibold mb-1" numberOfLines={1}>{issue.title}</Text>
        <Text className="text-gray-400 dark:text-gray-500 text-xs">{formatDate(issue.created_at)}</Text>
      </View>
      <View className={`px-3 py-1 rounded-full ${badge.bg}`}>
        <Text className={`text-xs font-medium ${badge.textCol}`}>{badge.text}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(IssueCard);
