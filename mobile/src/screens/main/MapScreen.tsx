import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import MapView, { Marker, Callout, Region } from 'react-native-maps';
import { Issue, getActiveIssuesWithCoordinates } from '../../services/issueService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Elazığ coordinates
const INITIAL_REGION: Region = {
  latitude: 38.6748,
  longitude: 39.2225,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

type RootStackParamList = {
  Home: undefined;
  ReportIssue: undefined;
  Map: undefined;
  Profile: undefined;
  IssueDetail: { issueId: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Map'>;

export default function MapScreen() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<MapView>(null);
  const navigation = useNavigation<NavigationProp>();

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
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={INITIAL_REGION}
        showsUserLocation={true}
        showsMyLocationButton={false}
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
            <Callout tooltip onPress={() => navigation.navigate('IssueDetail', { issueId: issue.id })}>
              <View style={styles.calloutContainer}>
                {issue.image_url && (
                  <Image source={{ uri: issue.image_url }} style={styles.calloutImage} />
                )}
                <View style={styles.calloutTextContainer}>
                  <Text style={styles.calloutTitle} numberOfLines={1}>{issue.title}</Text>
                  <Text style={styles.calloutCategory}>{issue.category}</Text>
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
        <TouchableOpacity style={styles.actionButton} onPress={fetchIssues}>
          <MaterialCommunityIcons name="refresh" size={24} color="#374151" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={goToMyLocation}>
          <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  actionButton: {
    backgroundColor: 'white',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 8,
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    width: 200,
    flexDirection: 'column',
    // Android için tooltip gölgesi/sınırı oluşturma
    borderColor: '#e5e7eb',
    borderWidth: 1,
  },
  calloutImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  calloutTextContainer: {
    flex: 1,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
    color: '#1f2937',
  },
  calloutCategory: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6,
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
