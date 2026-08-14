export type SensorType = 'aqi' | 'waste' | 'noise' | 'water';
export type SensorStatus = 'normal' | 'warning' | 'critical';

export interface IoTSensor {
  id: string;
  name: string;
  type: SensorType;
  location: [number, number]; // [lat, lng]
  value: number;
  unit: string;
  threshold: { warning: number; critical: number };
  status: SensorStatus;
  lastUpdated: string;
  history: { timestamp: string; value: number }[];
}

export const initialMockSensors: IoTSensor[] = [
  {
    id: 'sensor-aqi-1',
    name: 'Gazi Caddesi Hava Kalitesi',
    type: 'aqi',
    location: [38.6765, 39.2230],
    value: 45,
    unit: 'AQI',
    threshold: { warning: 100, critical: 150 },
    status: 'normal',
    lastUpdated: new Date().toISOString(),
    history: [],
  },
  {
    id: 'sensor-aqi-2',
    name: 'Kültür Park Hava Kalitesi',
    type: 'aqi',
    location: [38.6654, 39.2081],
    value: 60,
    unit: 'AQI',
    threshold: { warning: 100, critical: 150 },
    status: 'normal',
    lastUpdated: new Date().toISOString(),
    history: [],
  },
  {
    id: 'sensor-waste-1',
    name: 'İzzetpaşa Akıllı Konteyner',
    type: 'waste',
    location: [38.6798, 39.2255],
    value: 80,
    unit: '%',
    threshold: { warning: 75, critical: 90 },
    status: 'warning',
    lastUpdated: new Date().toISOString(),
    history: [],
  },
  {
    id: 'sensor-waste-2',
    name: 'Fırat Üni. Akıllı Konteyner',
    type: 'waste',
    location: [38.6720, 39.1905],
    value: 45,
    unit: '%',
    threshold: { warning: 75, critical: 90 },
    status: 'normal',
    lastUpdated: new Date().toISOString(),
    history: [],
  },
  {
    id: 'sensor-noise-1',
    name: 'Zübeyde Hanım Cad. Ses Sensörü',
    type: 'noise',
    location: [38.6781, 39.2150],
    value: 65,
    unit: 'dB',
    threshold: { warning: 70, critical: 85 },
    status: 'normal',
    lastUpdated: new Date().toISOString(),
    history: [],
  },
  {
    id: 'sensor-noise-2',
    name: 'Hastaneler Kavşağı Ses Sensörü',
    type: 'noise',
    location: [38.6690, 39.2195],
    value: 72,
    unit: 'dB',
    threshold: { warning: 70, critical: 85 },
    status: 'warning',
    lastUpdated: new Date().toISOString(),
    history: [],
  },
  {
    id: 'sensor-water-1',
    name: 'Keban Yolu Su Baskın Sensörü',
    type: 'water',
    location: [38.6850, 39.1800],
    value: 5,
    unit: 'cm',
    threshold: { warning: 20, critical: 40 },
    status: 'normal',
    lastUpdated: new Date().toISOString(),
    history: [],
  },
  {
    id: 'sensor-water-2',
    name: 'Harput Yolu Su Seviyesi',
    type: 'water',
    location: [38.7052, 39.2551],
    value: 0,
    unit: 'cm',
    threshold: { warning: 20, critical: 40 },
    status: 'normal',
    lastUpdated: new Date().toISOString(),
    history: [],
  }
];
