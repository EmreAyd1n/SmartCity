import React, { useEffect } from 'react';
import { View, Animated } from 'react-native';

const SkeletonStatCard = () => {
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
      className="bg-white dark:bg-gray-800 w-[48%] p-4 rounded-2xl shadow-sm mb-4"
    >
      <View className="w-6 h-6 rounded bg-gray-200 dark:bg-gray-700 mb-2" />
      <View className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded mt-2" />
      <View className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded mt-2" />
    </Animated.View>
  );
};

const SkeletonStats: React.FC = () => {
  return (
    <View className="flex-row flex-wrap justify-between">
      {Array.from({ length: 4 }).map((_, index) => (
        <SkeletonStatCard key={index} />
      ))}
    </View>
  );
};

const SkeletonDetailBlock = () => {
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
    <Animated.View style={{ opacity: animatedValue }}>
      {/* Image placeholder */}
      <View className="w-full h-56 bg-gray-200 dark:bg-gray-700" />

      {/* Title & description */}
      <View className="bg-white dark:bg-gray-800 mx-4 mt-4 p-4 rounded-2xl shadow-sm">
        <View className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
        <View className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
        <View className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
      </View>

      {/* Details */}
      <View className="bg-white dark:bg-gray-800 mx-4 mt-4 p-4 rounded-2xl shadow-sm">
        <View className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-4" />
        {Array.from({ length: 3 }).map((_, i) => (
          <View key={i} className="flex-row items-center mb-3">
            <View className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 mr-3" />
            <View className="flex-1">
              <View className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1" />
              <View className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
            </View>
          </View>
        ))}
      </View>

      {/* Progress tracker */}
      <View className="bg-white dark:bg-gray-800 mx-4 mt-4 p-4 rounded-2xl shadow-sm">
        <View className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4" />
        <View className="flex-row items-center justify-between">
          {Array.from({ length: 3 }).map((_, i) => (
            <View key={i} className="items-center flex-1">
              <View className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
              <View className="h-3 w-14 bg-gray-200 dark:bg-gray-700 rounded mt-2" />
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
};

const SkeletonNotificationItem = () => {
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
      className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm mb-3 mx-4 flex-row items-center"
    >
      <View className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 mr-3" />
      <View className="flex-1">
        <View className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
        <View className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      </View>
    </Animated.View>
  );
};

interface SkeletonNotificationListProps {
  count?: number;
}

const SkeletonNotificationList: React.FC<SkeletonNotificationListProps> = ({ count = 5 }) => {
  return (
    <View className="pt-4">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonNotificationItem key={index} />
      ))}
    </View>
  );
};

export { SkeletonStats, SkeletonDetailBlock, SkeletonNotificationList };
