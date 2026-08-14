import React, { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { ReportWithRelations } from '../../types'
import type { IoTSensor, SensorType, SensorStatus } from '../../types/iot'
import { useIoTSimulator } from '../../services/iotSimulator'
import { Activity, Filter } from 'lucide-react'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface InteractiveMapProps {
  reports: ReportWithRelations[]
  onMarkerClick?: (report: ReportWithRelations) => void
  onIoTSensorClick?: (sensor: IoTSensor) => void
}

export default React.memo(function InteractiveMap({ reports, onMarkerClick, onIoTSensorClick }: InteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const popupRef = useRef<mapboxgl.Popup | null>(null)
  const iotPopupRef = useRef<mapboxgl.Popup | null>(null)
  const onMarkerClickRef = useRef(onMarkerClick)
  const onIoTSensorClickRef = useRef(onIoTSensorClick)
  
  const sensors = useIoTSimulator()
  const [showSensors, setShowSensors] = useState(false)
  const [filterType, setFilterType] = useState<SensorType | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<SensorStatus | 'all'>('all')

  useEffect(() => {
    onMarkerClickRef.current = onMarkerClick
    onIoTSensorClickRef.current = onIoTSensorClick
  }, [onMarkerClick, onIoTSensorClick])

  useEffect(() => {
    if (map.current || !mapContainer.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [39.2228, 38.6744], // Elazığ Merkez
      zoom: 12
    })

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    map.current.on('load', () => {
      if (!map.current) return;

      // ── REPORTS SOURCE & LAYERS ──
      map.current.addSource('reports', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });

      map.current.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'reports',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#6366f1',
            10,
            '#8b5cf6',
            50,
            '#d946ef'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,
            10,
            30,
            50,
            40
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff'
        }
      });

      map.current.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'reports',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 14
        },
        paint: {
          'text-color': '#ffffff'
        }
      });

      map.current.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'reports',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'match',
            ['get', 'status'],
            'pending', '#f59e0b',
            'in_progress', '#3b82f6',
            'resolved', '#10b981',
            'rejected', '#ef4444',
            '#f59e0b'
          ],
          'circle-radius': 8,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#fff'
        }
      });

      // ── IOT SENSORS SOURCE & LAYERS ──
      map.current.addSource('iot-sensors', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      // Dış hale (pulse effect for critical)
      map.current.addLayer({
        id: 'iot-sensors-halo',
        type: 'circle',
        source: 'iot-sensors',
        paint: {
          'circle-radius': [
            'match',
            ['get', 'status'],
            'critical', 20,
            'warning', 15,
            0
          ],
          'circle-color': [
            'match',
            ['get', 'status'],
            'critical', '#ef4444',
            'warning', '#f59e0b',
            'transparent'
          ],
          'circle-opacity': 0.3
        }
      });

      // İç nokta
      map.current.addLayer({
        id: 'iot-sensors-point',
        type: 'circle',
        source: 'iot-sensors',
        paint: {
          'circle-color': [
            'match',
            ['get', 'status'],
            'critical', '#ef4444',
            'warning', '#f59e0b',
            '#10b981' // normal
          ],
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff'
        }
      });


      // ── INTERACTIONS ──

      // Cluster click
      map.current.on('click', 'clusters', (e) => {
        const features = map.current?.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        if (!features || !features.length) return;
        const clusterId = (features[0].properties as any)?.cluster_id;
        const source = map.current?.getSource('reports') as mapboxgl.GeoJSONSource;
        
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          const coords = (features[0].geometry as any).coordinates;
          map.current?.easeTo({ center: coords, zoom: zoom });
        });
      });

      // Report point click
      map.current.on('click', 'unclustered-point', (e) => {
        if (!e.features || !e.features.length || !map.current) return;
        const feature = e.features[0];
        const coords = (feature.geometry as any).coordinates.slice();
        const properties = feature.properties as any;
        
        while (Math.abs(e.lngLat.lng - coords[0]) > 180) {
          coords[0] += e.lngLat.lng > coords[0] ? 360 : -360;
        }

        const statusColors: any = {
          pending: { color: '#f59e0b', text: 'Bekliyor' },
          in_progress: { color: '#3b82f6', text: 'İşlemde' },
          resolved: { color: '#10b981', text: 'Çözüldü' },
          rejected: { color: '#ef4444', text: 'Reddedildi' }
        };
        const statusInfo = statusColors[properties.status] || statusColors.pending;

        const popupContent = document.createElement('div');
        popupContent.className = 'p-3 min-w-[240px] font-sans flex flex-col gap-3 dark:bg-surface-900 rounded-xl';
        popupContent.innerHTML = `
          ${properties.imageUrl ? `<img src="${properties.imageUrl}" class="w-full h-32 object-cover rounded-lg shadow-sm" alt="Report Image" />` : ''}
          <div>
            <h3 class="font-bold text-base mb-1 text-surface-900 dark:text-surface-100">${properties.title}</h3>
            <p class="text-xs text-surface-500 dark:text-surface-400 mb-2">${properties.categoryName}</p>
            <span class="inline-block px-2.5 py-1 text-xs font-semibold rounded-full" 
                  style="background-color: ${statusInfo.color}20; color: ${statusInfo.color}; border: 1px solid ${statusInfo.color}40">
              ${statusInfo.text}
            </span>
          </div>
          <button id="btn-detail-${properties.id}" class="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            Detayları Gör
          </button>
        `;

        if (popupRef.current) popupRef.current.remove();
        popupRef.current = new mapboxgl.Popup({ offset: 10, maxWidth: '300px' })
          .setLngLat(coords)
          .setDOMContent(popupContent)
          .addTo(map.current);

        const detailBtn = popupContent.querySelector(`#btn-detail-${properties.id}`);
        if (detailBtn) {
          detailBtn.addEventListener('click', () => {
            if (onMarkerClickRef.current) {
              onMarkerClickRef.current(JSON.parse(properties.reportStr));
            }
            if (popupRef.current) popupRef.current.remove();
          });
        }
      });

      // IoT point click
      map.current.on('click', 'iot-sensors-point', (e) => {
        if (!e.features || !e.features.length || !map.current) return;
        const feature = e.features[0];
        const coords = (feature.geometry as any).coordinates.slice();
        const properties = feature.properties as any;
        
        while (Math.abs(e.lngLat.lng - coords[0]) > 180) {
          coords[0] += e.lngLat.lng > coords[0] ? 360 : -360;
        }

        const popupContent = document.createElement('div');
        popupContent.className = 'p-3 min-w-[200px] font-sans flex flex-col gap-2 dark:bg-surface-900 rounded-xl';
        
        const statusColors: any = {
          critical: { color: '#ef4444', text: 'Kritik' },
          warning: { color: '#f59e0b', text: 'Uyarı' },
          normal: { color: '#10b981', text: 'Normal' }
        };
        const sInfo = statusColors[properties.status] || statusColors.normal;

        popupContent.innerHTML = `
          <div class="flex items-center gap-2 mb-1">
             <div class="p-1.5 rounded-md" style="background-color: ${sInfo.color}20; color: ${sInfo.color};">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
             </div>
             <h3 class="font-bold text-sm text-surface-900 dark:text-surface-100">${properties.name}</h3>
          </div>
          <div class="flex justify-between items-center mt-2">
            <span class="text-2xl font-black" style="color: ${sInfo.color}">${properties.value} <span class="text-xs font-normal text-surface-500">${properties.unit}</span></span>
            <span class="inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase" style="background-color: ${sInfo.color}20; color: ${sInfo.color};">
              ${sInfo.text}
            </span>
          </div>
          <p class="text-[10px] text-surface-400 mt-1 text-right">Son günc.: ${new Date(properties.lastUpdated).toLocaleTimeString()}</p>
          <button id="btn-iot-detail-${properties.id}" class="mt-2 w-full py-1.5 bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-900 dark:text-surface-100 rounded-md text-xs font-semibold transition-colors">
            Detayları Gör
          </button>
        `;

        if (iotPopupRef.current) iotPopupRef.current.remove();
        iotPopupRef.current = new mapboxgl.Popup({ offset: 10, maxWidth: '250px' })
          .setLngLat(coords)
          .setDOMContent(popupContent)
          .addTo(map.current);
          
        const detailBtn = popupContent.querySelector(`#btn-iot-detail-${properties.id}`);
        if (detailBtn) {
          detailBtn.addEventListener('click', () => {
            if (onIoTSensorClickRef.current) {
              onIoTSensorClickRef.current(JSON.parse(properties.sensorStr));
            }
            if (iotPopupRef.current) iotPopupRef.current.remove();
          });
        }
      });

      // Hover effects
      const setPointer = () => { if (map.current) map.current.getCanvas().style.cursor = 'pointer'; };
      const clearPointer = () => { if (map.current) map.current.getCanvas().style.cursor = ''; };

      map.current.on('mouseenter', 'clusters', setPointer);
      map.current.on('mouseleave', 'clusters', clearPointer);
      map.current.on('mouseenter', 'unclustered-point', setPointer);
      map.current.on('mouseleave', 'unclustered-point', clearPointer);
      map.current.on('mouseenter', 'iot-sensors-point', setPointer);
      map.current.on('mouseleave', 'iot-sensors-point', clearPointer);
    });

  }, [])

  // Sync Reports Data
  useEffect(() => {
    if (!map.current) return;
    const updateData = () => {
      const source = map.current?.getSource('reports') as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData({
          type: 'FeatureCollection',
          features: reports.filter(r => r.latitude && r.longitude).map(r => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [r.longitude, r.latitude] },
            properties: {
              id: r.id,
              title: r.title,
              categoryName: r.category?.name || 'Kategori Yok',
              status: r.status,
              imageUrl: r.image_url || '',
              reportStr: JSON.stringify(r)
            }
          }))
        });
      }
    };
    if (map.current.isStyleLoaded()) updateData();
    else map.current.once('load', updateData);
  }, [reports])

  // Sync IoT Sensors Data
  useEffect(() => {
    if (!map.current) return;
    const updateIoTData = () => {
      const source = map.current?.getSource('iot-sensors') as mapboxgl.GeoJSONSource;
      if (source) {
        if (!showSensors) {
          source.setData({ type: 'FeatureCollection', features: [] });
        } else {
          source.setData({
            type: 'FeatureCollection',
            features: sensors
              .filter(s => (filterType === 'all' || s.type === filterType) && (filterStatus === 'all' || s.status === filterStatus))
              .map(s => ({
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [s.location[1], s.location[0]] }, // mapbox: lng, lat
              properties: {
                id: s.id,
                name: s.name,
                type: s.type,
                value: s.value,
                unit: s.unit,
                status: s.status,
                lastUpdated: s.lastUpdated,
                sensorStr: JSON.stringify(s)
              }
            }))
          });
        }
      }
    };
    if (map.current.isStyleLoaded()) updateIoTData();
    else map.current.once('load', updateIoTData);
  }, [sensors, showSensors, filterType, filterStatus])

  return (
    <div className="w-full h-full min-h-[500px] rounded-xl overflow-hidden border border-surface-200 dark:border-surface-700 shadow-sm relative group transition-colors duration-200">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full bg-surface-100 dark:bg-surface-800 transition-colors duration-200" />
      
      {/* IoT Toggle Control */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <div className="bg-white/90 dark:bg-surface-800/90 backdrop-blur-sm p-2 rounded-lg shadow-sm border border-surface-200 dark:border-surface-700 flex items-center justify-between gap-3 min-w-[200px]">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-surface-900 dark:text-surface-100">Sensör Ağı</span>
          </div>
          <button
            onClick={() => setShowSensors(prev => !prev)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${showSensors ? 'bg-primary-500' : 'bg-surface-300 dark:bg-surface-600'}`}
          >
            <span className="sr-only">Toggle IoT Sensors</span>
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition duration-200 ease-in-out ${showSensors ? 'translate-x-4.5' : 'translate-x-1'}`}
            />
          </button>
        </div>

        {showSensors && (
          <div className="bg-white/90 dark:bg-surface-800/90 backdrop-blur-sm p-2 rounded-lg shadow-sm border border-surface-200 dark:border-surface-700 flex flex-col gap-2 min-w-[200px] animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['all', 'aqi', 'waste', 'noise', 'water'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-2 py-1 text-[10px] font-medium rounded-md transition-colors ${filterType === t ? 'bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-400' : 'text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-700'}`}
                >
                  {t === 'all' ? 'Tümü' : t === 'aqi' ? 'Hava' : t === 'waste' ? 'Çöp' : t === 'noise' ? 'Ses' : 'Su'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap pt-1.5 border-t border-surface-200 dark:border-surface-700">
              {(['all', 'normal', 'warning', 'critical'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-2 py-1 text-[9px] uppercase font-bold rounded-md transition-colors ${filterStatus === s ? 'bg-surface-200 text-surface-900 dark:bg-surface-600 dark:text-surface-100' : 'text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-700'}`}
                >
                  {s === 'all' ? 'Tümü' : s === 'normal' ? 'Normal' : s === 'warning' ? 'Uyarı' : 'Kritik'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {!map.current && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-50/50 dark:bg-surface-900/50 backdrop-blur-sm transition-colors duration-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
        </div>
      )}
    </div>
  )
})
