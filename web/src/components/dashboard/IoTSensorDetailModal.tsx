import React from 'react';
import { X, Activity, AlertTriangle, Wind, Trash2, Volume2, Droplets } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { IoTSensor, SensorType } from '../../types';

interface IoTSensorDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  sensor: IoTSensor | null;
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
    case 'critical': return 'text-danger-600 bg-danger-50 dark:bg-danger-500/10 border-danger-200 dark:border-danger-500/20';
    case 'warning': return 'text-warning-600 bg-warning-50 dark:bg-warning-500/10 border-warning-200 dark:border-warning-500/20';
    default: return 'text-accent-600 bg-accent-50 dark:bg-accent-500/10 border-accent-200 dark:border-accent-500/20';
  }
};

export default function IoTSensorDetailModal({ isOpen, onClose, sensor }: IoTSensorDetailModalProps) {
  if (!isOpen || !sensor) return null;

  const statusText = {
    critical: 'Kritik Seviye',
    warning: 'Uyarı Seviyesi',
    normal: 'Normal Seviye'
  }[sensor.status];

  // Format history for chart
  const chartData = sensor.history.map(h => ({
    time: new Date(h.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    value: h.value
  }));

  const yDomainMax = sensor.type === 'waste' ? 100 : sensor.type === 'water' ? 100 : 'auto';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-surface-200 dark:border-surface-700 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-700">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${getStatusColor(sensor.status)}`}>
              {getIconForType(sensor.type)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-surface-900 dark:text-surface-100">{sensor.name}</h2>
              <p className="text-sm text-surface-500 dark:text-surface-400 capitalize">{sensor.type} Sensörü</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
              <p className="text-xs font-semibold text-surface-500 dark:text-surface-400 mb-1 uppercase tracking-wider">Anlık Değer</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-surface-900 dark:text-surface-100">{sensor.value}</span>
                <span className="text-sm font-medium text-surface-500 mb-1">{sensor.unit}</span>
              </div>
            </div>
            
            <div className="p-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
              <p className="text-xs font-semibold text-surface-500 dark:text-surface-400 mb-1 uppercase tracking-wider">Durum</p>
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-bold border ${getStatusColor(sensor.status)}`}>
                {sensor.status === 'critical' ? <AlertTriangle className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                {statusText}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
              <p className="text-xs font-semibold text-surface-500 dark:text-surface-400 mb-1 uppercase tracking-wider">Eşik Değerleri</p>
              <div className="flex flex-col gap-1 text-sm font-medium">
                <div className="flex justify-between items-center text-warning-600 dark:text-warning-400">
                  <span>Uyarı:</span>
                  <span>{sensor.threshold.warning} {sensor.unit}</span>
                </div>
                <div className="flex justify-between items-center text-danger-600 dark:text-danger-400">
                  <span>Kritik:</span>
                  <span>{sensor.threshold.critical} {sensor.unit}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="p-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
            <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100 mb-4">Değişim Trendi</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 10, fill: '#6b7280' }} 
                    axisLine={false} 
                    tickLine={false}
                    minTickGap={20}
                  />
                  <YAxis 
                    domain={[0, yDomainMax]} 
                    tick={{ fontSize: 10, fill: '#6b7280' }} 
                    axisLine={false} 
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    labelStyle={{ color: '#374151', fontWeight: 'bold', marginBottom: '4px' }}
                    itemStyle={{ color: '#6366f1', fontWeight: 'bold' }}
                  />
                  
                  <ReferenceLine y={sensor.threshold.critical} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'Kritik', fill: '#ef4444', fontSize: 10 }} />
                  <ReferenceLine y={sensor.threshold.warning} stroke="#f59e0b" strokeDasharray="3 3" label={{ position: 'bottom', value: 'Uyarı', fill: '#f59e0b', fontSize: 10 }} />

                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    name={sensor.unit}
                    stroke="#6366f1" 
                    strokeWidth={3} 
                    dot={false}
                    activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
                    animationDuration={300}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
