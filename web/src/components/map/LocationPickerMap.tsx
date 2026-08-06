import React, { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface LocationPickerMapProps {
  onLocationSelect: (lat: number, lng: number) => void;
  defaultLat?: number;
  defaultLng?: number;
}

export default React.memo(function LocationPickerMap({ onLocationSelect, defaultLat = 41.0082, defaultLng = 28.9784 }: LocationPickerMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const marker = useRef<mapboxgl.Marker | null>(null)

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [defaultLng, defaultLat],
      zoom: 12
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      
      if (!marker.current) {
        marker.current = new mapboxgl.Marker({ color: '#ef4444' })
          .setLngLat([lng, lat])
          .addTo(map.current!);
      } else {
        marker.current.setLngLat([lng, lat]);
      }
      
      onLocationSelect(lat, lng);
    });
  }, [onLocationSelect, defaultLat, defaultLng]);

  return (
    <div className="w-full h-[250px] rounded-xl overflow-hidden border border-surface-200 dark:border-surface-700 shadow-sm relative group transition-colors duration-200">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full bg-surface-100 dark:bg-surface-800 transition-colors duration-200" />
      {!map.current && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-50/50 dark:bg-surface-900/50 backdrop-blur-sm transition-colors duration-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
        </div>
      )}
    </div>
  )
})
