import React, { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { ReportWithRelations } from '../../types'

// Not: Mapbox token'ını uygulamanın .env dosyasına VITE_MAPBOX_TOKEN olarak eklemelisiniz.
// Şimdilik sorunsuz çalışması için genel kullanıma açık bir placeholder token ekliyoruz.
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface InteractiveMapProps {
  reports: ReportWithRelations[]
  onMarkerClick?: (report: ReportWithRelations) => void
}

export default function InteractiveMap({ reports, onMarkerClick }: InteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({})

  useEffect(() => {
    if (map.current || !mapContainer.current) return // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [28.9784, 41.0082], // Istanbul Merkez
      zoom: 12
    })

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
  }, [])

  useEffect(() => {
    if (!map.current) return

    // Mevcut marker'ları temizle
    Object.values(markersRef.current).forEach(marker => marker.remove())
    markersRef.current = {}

    // Yeni marker'ları ekle
    reports.forEach(report => {
      if (report.longitude && report.latitude) {
        let color = '#f59e0b' // pending (Sarı/Turuncu)
        let statusText = 'Bekliyor'
        
        if (report.status === 'in_progress') {
          color = '#3b82f6' // İşlemde (Mavi)
          statusText = 'İşlemde'
        } else if (report.status === 'resolved') {
          color = '#10b981' // Çözüldü (Yeşil)
          statusText = 'Çözüldü'
        } else if (report.status === 'rejected') {
          color = '#ef4444' // Reddedildi (Kırmızı)
          statusText = 'Reddedildi'
        }

        const el = document.createElement('div')
        el.className = 'cursor-pointer'
        el.innerHTML = `
          <svg width="24" height="34" viewBox="0 0 24 34" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.37258 0 0 5.37258 0 12C0 19.3879 10.1583 32.5539 11.2312 33.9103C11.6111 34.3908 12.3889 34.3908 12.7688 33.9103C13.8417 32.5539 24 19.3879 24 12C24 5.37258 18.6274 0 12 0ZM12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18Z" fill="${color}"/>
            <circle cx="12" cy="12" r="5" fill="white"/>
          </svg>
        `

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([report.longitude, report.latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div class="p-2 min-w-[200px] font-sans">
                <h3 class="font-bold text-sm mb-1 text-surface-900">${report.title}</h3>
                <p class="text-xs text-surface-500 mb-2">${report.category?.name || 'Kategori Yok'}</p>
                <span class="inline-block px-2 py-1 text-xs font-semibold rounded-full" 
                      style="background-color: ${color}20; color: ${color}; border: 1px solid ${color}40">
                  ${statusText}
                </span>
              </div>
            `)
          )
          .addTo(map.current!)

        // Popup içinden tıklama yakalamak zor olabilir ama marker'a tıklayınca event gönderelim
        marker.getElement().addEventListener('click', () => {
          if (onMarkerClick) {
            // Popup'un açılmasını engellemeden, dışarıya event fırlatıyoruz.
            // Fakat popup'ın da açılmasını istiyoruz, o yüzden Timeout ile yapabiliriz
            // ya da direkt fırlatabiliriz. Detail modalını açacaksak popup gereksiz de olabilir.
            setTimeout(() => onMarkerClick(report), 50)
          }
        })

        markersRef.current[report.id] = marker
      }
    })

  }, [reports, onMarkerClick])

  return (
    <div className="w-full h-full min-h-[500px] rounded-xl overflow-hidden border border-surface-200 shadow-sm relative group">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full bg-surface-100" />
      {!map.current && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-50/50 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      )}
    </div>
  )
}
