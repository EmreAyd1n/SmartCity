import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export interface NotificationLog {
  id: string;
  title: string;
  body: string;
  issueId?: string;
  isRead: boolean;
  receivedAt: string; // ISO date string
}

const NOTIFICATION_LOG_KEY = '@notification_logs';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync({ projectId: 'your-project-id' })).data;
    console.log(token);
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

export async function sendLocalNotification(title: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
    },
    trigger: null, // Send immediately
  });
}

export async function saveNotificationLog(title: string, body: string, issueId?: string): Promise<void> {
  try {
    const existingLogsJson = await AsyncStorage.getItem(NOTIFICATION_LOG_KEY);
    const logs: NotificationLog[] = existingLogsJson ? JSON.parse(existingLogsJson) : [];

    const newLog: NotificationLog = {
      id: Date.now().toString(),
      title,
      body,
      issueId,
      isRead: false,
      receivedAt: new Date().toISOString(),
    };

    logs.push(newLog);
    await AsyncStorage.setItem(NOTIFICATION_LOG_KEY, JSON.stringify(logs));
  } catch (error) {
    console.error('Error saving notification log:', error);
  }
}

export async function getStoredNotifications(): Promise<NotificationLog[]> {
  try {
    const logsJson = await AsyncStorage.getItem(NOTIFICATION_LOG_KEY);
    if (!logsJson) return [];

    const logs: NotificationLog[] = JSON.parse(logsJson);
    return logs.sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
  } catch (error) {
    console.error('Error getting stored notifications:', error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    const logsJson = await AsyncStorage.getItem(NOTIFICATION_LOG_KEY);
    if (!logsJson) return;

    const logs: NotificationLog[] = JSON.parse(logsJson);
    const updatedLogs = logs.map((log) =>
      log.id === notificationId ? { ...log, isRead: true } : log
    );

    await AsyncStorage.setItem(NOTIFICATION_LOG_KEY, JSON.stringify(updatedLogs));
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const logs = await getStoredNotifications();
    return logs.filter((log) => !log.isRead).length;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
}

export async function clearNotifications(): Promise<void> {
  try {
    await AsyncStorage.removeItem(NOTIFICATION_LOG_KEY);
  } catch (error) {
    console.error('Error clearing notifications:', error);
  }
}
