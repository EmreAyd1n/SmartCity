// @ts-expect-error NativeWind global css import
import './global.css';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import RootNavigator from './src/navigation/RootNavigator';
import { useEffect } from 'react';
import { registerForPushNotificationsAsync } from './src/services/notificationService';
import ErrorBoundary from './src/components/common/ErrorBoundary';

export default function App() {
  useEffect(() => {
    registerForPushNotificationsAsync().catch(console.error);
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <RootNavigator />
          <StatusBar style="auto" />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
