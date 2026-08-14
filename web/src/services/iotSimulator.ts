import { useState, useEffect } from 'react';
import { initialMockSensors } from '../types/iot';
import type { IoTSensor, SensorStatus } from '../types/iot';

type Listener = (sensors: IoTSensor[]) => void;

class IoTSimulator {
  private sensors: IoTSensor[] = [...initialMockSensors];
  private listeners: Set<Listener> = new Set();
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.startSimulation();
  }

  startSimulation(intervalMs: number = 5000) {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => {
      this.updateSensors();
    }, intervalMs);
  }

  stopSimulation() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener(this.sensors);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getSensors() {
    return this.sensors;
  }

  private updateSensors() {
    this.sensors = this.sensors.map(sensor => {
      let newValue = sensor.value;
      const change = (Math.random() - 0.5) * 10; // -5 to +5
      
      if (sensor.type === 'aqi') {
        newValue = Math.max(0, Math.min(300, newValue + change));
      } else if (sensor.type === 'waste') {
        if (newValue > 95 && Math.random() > 0.8) {
          newValue = 0; // Emptied
        } else {
          newValue = Math.max(0, Math.min(100, newValue + Math.random() * 5));
        }
      } else if (sensor.type === 'noise') {
        newValue = Math.max(30, Math.min(120, newValue + change));
      } else if (sensor.type === 'water') {
        newValue = Math.max(0, Math.min(100, newValue + change));
      }

      newValue = Math.round(newValue * 10) / 10;

      let status: SensorStatus = 'normal';
      if (newValue >= sensor.threshold.critical) {
        status = 'critical';
      } else if (newValue >= sensor.threshold.warning) {
        status = 'warning';
      }

      return {
        ...sensor,
        value: newValue,
        status,
        lastUpdated: new Date().toISOString()
      };
    });

    this.notifyListeners();
  }

  private notifyListeners() {
    // Array clone so react triggers re-render
    const clonedSensors = [...this.sensors];
    this.listeners.forEach(l => l(clonedSensors));
  }
}

export const iotSimulator = new IoTSimulator();

export function useIoTSimulator() {
  const [sensors, setSensors] = useState<IoTSensor[]>(iotSimulator.getSensors());

  useEffect(() => {
    const unsubscribe = iotSimulator.subscribe((newSensors) => {
      setSensors(newSensors);
    });
    return unsubscribe;
  }, []);

  return sensors;
}
