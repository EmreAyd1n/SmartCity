import React, { useMemo } from 'react';
import { useIoTSimulator } from '../../services/iotSimulator';
import { Activity, AlertTriangle, Wind, Trash2, Volume2, Droplets } from 'lucide-react';
import type { IoTSensor, SensorType } from '../../types';

const getIconForType = (type: SensorType) => {
  switch (type) {
    case 'aqi': return <Wind className="w-5 h-5" />;
    case 'waste': return <Trash2 className="w-5 h-5" />;
    case 'noise': return <Volume2 className="w-5 h-5" />;
    case 'water': return <Droplets className="w-5 h-5" />;
    default: return <Activity className="w-5 h-5" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'critical': return 'text-danger-600 bg-danger-50 dark:bg-danger-500/10';
    case 'warning': return 'text-warning-600 bg-warning-50 dark:bg-warning-500/10';
    default: return 'text-accent-600 bg-accent-50 dark:bg-accent-500/10';
  }
};

export default function IoTSensorWidget() {
  const sensors = useIoTSimulator();

  const { criticalCount, warningCount } = useMemo(() => {
    return {
      criticalCount: sensors.filter(s => s.status === 'critical').length,
      warningCount: sensors.filter(s => s.status === 'warning').length,
    };
  }, [sensors]);

  return (
    <div className="bg-white dark:bg-surface-800 rounded-xl shadow-sm border border-surface-200 dark:border-surface-700 overflow-hidden flex flex-col transition-colors duration-200 h-full max-h-[400px]">
      <div className="p-4 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between bg-surface-50 dark:bg-surface-800/50">
        <div className="flex items-center gap-2">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
          </div>
          <h2 className="text-sm font-bold text-surface-900 dark:text-surface-100">Canlı Sensör Ağı</h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold">
          {criticalCount > 0 && (
            <span className="flex items-center gap-1 text-danger-700 dark:text-danger-400 bg-danger-100 dark:bg-danger-500/20 px-2 py-1 rounded-full">
              <AlertTriangle className="w-3.5 h-3.5" />
              {criticalCount} Kritik
            </span>
          )}
          {warningCount > 0 && (
            <span className="flex items-center gap-1 text-warning-700 dark:text-warning-400 bg-warning-100 dark:bg-warning-500/20 px-2 py-1 rounded-full">
              {warningCount} Uyarı
            </span>
          )}
          {criticalCount === 0 && warningCount === 0 && (
            <span className="text-accent-700 dark:text-accent-400 bg-accent-100 dark:bg-accent-500/20 px-2 py-1 rounded-full">Tümü Normal</span>
          )}
        </div>
      </div>
      
      <div className="p-2 overflow-y-auto custom-scrollbar flex-1">
        <div className="space-y-1">
          {sensors.map((sensor) => (
            <div key={sensor.id} className="flex items-center justify-between p-3 hover:bg-surface-50 dark:hover:bg-surface-700/50 rounded-lg transition-colors group">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getStatusColor(sensor.status)} transition-colors`}>
                  {getIconForType(sensor.type)}
                </div>
                <div>
                  <p className="text-sm font-medium text-surface-900 dark:text-surface-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{sensor.name}</p>
                  <p className="text-xs text-surface-500 dark:text-surface-400 capitalize">{sensor.type} Sensörü</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${sensor.status === 'critical' ? 'text-danger-600 dark:text-danger-400' : sensor.status === 'warning' ? 'text-warning-600 dark:text-warning-400' : 'text-surface-900 dark:text-surface-100'}`}>
                  {sensor.value} <span className="text-xs font-medium opacity-75">{sensor.unit}</span>
                </p>
                <p className="text-[10px] text-surface-400 dark:text-surface-500">
                  {new Date(sensor.lastUpdated).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
