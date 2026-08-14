import React, { useMemo, useState } from 'react';
import { useIoTSimulator } from '../../services/iotSimulator';
import { Activity, AlertTriangle, Wind, Trash2, Volume2, Droplets, Filter } from 'lucide-react';
import type { IoTSensor, SensorType, SensorStatus } from '../../types/iot';

interface IoTSensorWidgetProps {
  onSensorClick?: (sensor: IoTSensor) => void;
}

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

export default function IoTSensorWidget({ onSensorClick }: IoTSensorWidgetProps) {
  const sensors = useIoTSimulator();
  const [filterType, setFilterType] = useState<SensorType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<SensorStatus | 'all'>('all');

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
      
      <div className="px-4 py-2 border-b border-surface-200 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-800/30 flex flex-col gap-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          <Filter className="w-3.5 h-3.5 text-surface-400 shrink-0" />
          {(['all', 'aqi', 'waste', 'noise', 'water'] as const).map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-2 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${filterType === t ? 'bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-400' : 'text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-700'}`}
            >
              {t === 'all' ? 'Tümü' : t === 'aqi' ? 'Hava' : t === 'waste' ? 'Çöp' : t === 'noise' ? 'Ses' : 'Su'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {(['all', 'normal', 'warning', 'critical'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-2 py-1 text-[10px] uppercase font-bold rounded-md whitespace-nowrap transition-colors ${filterStatus === s ? 'bg-surface-200 text-surface-900 dark:bg-surface-600 dark:text-surface-100' : 'text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-700'}`}
            >
              {s === 'all' ? 'Tümü' : s === 'normal' ? 'Normal' : s === 'warning' ? 'Uyarı' : 'Kritik'}
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-2 overflow-y-auto custom-scrollbar flex-1">
        <div className="space-y-1">
          {sensors
            .filter(s => (filterType === 'all' || s.type === filterType) && (filterStatus === 'all' || s.status === filterStatus))
            .map((sensor) => (
            <div 
              key={sensor.id} 
              onClick={() => onSensorClick?.(sensor)}
              className="flex items-center justify-between p-3 hover:bg-surface-50 dark:hover:bg-surface-700/50 rounded-lg transition-colors group cursor-pointer"
            >
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
