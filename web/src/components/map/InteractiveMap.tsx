import React, { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { ReportWithRelations } from '../../types'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface InteractiveMapProps {
  reports: ReportWithRelations[]
  onMarkerClick?: (report: ReportWithRelations) => void
}

export default React.memo(function InteractiveMap({ reports, onMarkerClick }: InteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const popupRef = useRef<mapboxgl.Popup | null>(null)
  const onMarkerClickRef = useRef(onMarkerClick)

  useEffect(() => {
    onMarkerClickRef.current = onMarkerClick
  }, [onMarkerClick])

  useEffect(() => {
    if (map.current || !mapContainer.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [28.9784, 41.0082], // Istanbul Merkez
      zoom: 12
    })

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    map.current.on('load', () => {
      if (!map.current) return;

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

      // Cluster click to zoom
      map.current.on('click', 'clusters', (e) => {
        const features = map.current?.queryRenderedFeatures(e.point, {
          layers: ['clusters']
        });
        if (!features || !features.length) return;
        const clusterId = (features[0].properties as any)?.cluster_id;
        const source = map.current?.getSource('reports') as mapboxgl.GeoJSONSource;
        
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          const coords = (features[0].geometry as any).coordinates;
          map.current?.easeTo({
            center: coords,
            zoom: zoom
          });
        });
      });

      // Point click to show popup
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
              const report = JSON.parse(properties.reportStr);
              onMarkerClickRef.current(report);
            }
            if (popupRef.current) popupRef.current.remove();
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
    });

  }, [])

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

    if (map.current.isStyleLoaded()) {
      updateData();
    } else {
      map.current.once('load', updateData);
    }
  }, [reports])

  return (
    <div className="w-full h-full min-h-[500px] rounded-xl overflow-hidden border border-surface-200 dark:border-surface-700 shadow-sm relative group transition-colors duration-200">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full bg-surface-100 dark:bg-surface-800 transition-colors duration-200" />
      {!map.current && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-50/50 dark:bg-surface-900/50 backdrop-blur-sm transition-colors duration-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
        </div>
      )}
    </div>
  )
})
