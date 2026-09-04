import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import MapView, { Marker, Callout, Region } from 'react-native-maps';
import { Issue, getActiveIssuesWithCoordinates } from '../../services/issueService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import OfflineBanner from '../../components/OfflineBanner';
import { useTheme } from '../../context/ThemeContext';

const INITIAL_REGION: Region = {
  latitude: 38.6748,
  longitude: 39.2225,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList } from '../../navigation/RootNavigator';

type RootTabParamList = {
  Home: undefined;
  Report: undefined;
  Map: undefined;
  Profile: undefined;
};

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<RootTabParamList, 'Map'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function MapScreen() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<MapView>(null);
  const navigation = useNavigation<NavigationProp>();
  const { isDark, colors } = useTheme();

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const activeIssues = await getActiveIssuesWithCoordinates();
      setIssues(activeIssues);
    } catch (error) {
      console.error('Error fetching map issues:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const getMarkerColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'beklemede':
        return 'orange';
      case 'in_progress':
      case 'devam_ediyor':
      case 'işlemde':
        return 'blue';
      case 'resolved':
      case 'çözüldü':
        return 'green';
      default:
        return 'red';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Beklemede';
      case 'in_progress':
        return 'İşlemde';
      case 'resolved':
        return 'Çözüldü';
      default:
        return status;
    }
  };

  const goToMyLocation = () => {
    mapRef.current?.animateToRegion(INITIAL_REGION, 1000);
  };

  return (
    <View className="flex-1">
      <OfflineBanner />
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={INITIAL_REGION}
        showsUserLocation={true}
        showsMyLocationButton={false}
        userInterfaceStyle={isDark ? "dark" : "light"}
      >
        {issues.map((issue) => (
          <Marker
            key={issue.id}
            coordinate={{
              latitude: issue.latitude as number,
              longitude: issue.longitude as number,
            }}
            pinColor={getMarkerColor(issue.status)}
          >
            <Callout tooltip onPress={() => navigation.navigate('IssueDetail', { issue })}> 
              <View className="bg-white dark:bg-gray-800 rounded-xl p-2 w-[200px] flex-col border border-gray-200 dark:border-gray-700">
                {issue.image_url && (
                  <Image source={{ uri: issue.image_url }} style={styles.calloutImage} />
                )}
                <View className="flex-1">
                  <Text className="font-bold text-sm mb-1 text-gray-800 dark:text-gray-100" numberOfLines={1}>{issue.title}</Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">{issue.category}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getMarkerColor(issue.status) }]}> 
                    <Text style={styles.statusText}>{getStatusText(issue.status)}</Text>
                  </View>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity className="bg-white dark:bg-gray-800 w-12 h-12 rounded-full justify-center items-center shadow-md mb-2" onPress={fetchIssues}>
          <MaterialCommunityIcons name="refresh" size={24} color={isDark ? "#f3f4f6" : "#374151"} />
        </TouchableOpacity>
        <TouchableOpacity className="bg-white dark:bg-gray-800 w-12 h-12 rounded-full justify-center items-center shadow-md mb-2" onPress={goToMyLocation}>
          <MaterialCommunityIcons name="crosshairs-gps" size={24} color={isDark ? "#f3f4f6" : "#374151"} />
        </TouchableOpacity>
      </View>

      {loading && (
        <View className="absolute top-1/2 left-1/2 -ml-5 -mt-5 bg-white dark:bg-gray-800 p-2.5 rounded-2xl shadow-md">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    gap: 12,
  },
  calloutImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
