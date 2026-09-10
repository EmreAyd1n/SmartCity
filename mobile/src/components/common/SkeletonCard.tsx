import React, { useEffect } from 'react';
import { View, Animated } from 'react-native';

interface SkeletonCardProps {
  count?: number;
}

const SkeletonCardItem = () => {
  const animatedValue = new Animated.Value(0.5);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View 
      style={{ opacity: animatedValue }}
      className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm mb-3 flex-row justify-between items-center"
    >
      <View className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700 mr-3" />
      <View className="flex-1 mr-3">
        <View className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
        <View className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
      </View>
      <View className="w-16 h-6 rounded-full bg-gray-200 dark:bg-gray-700" />
    </Animated.View>
  );
};

const SkeletonCard: React.FC<SkeletonCardProps> = ({ count = 3 }) => {
  return (
    <View className="px-4">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCardItem key={index} />
      ))}
    </View>
  );
};

export default SkeletonCard;
