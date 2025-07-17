'use client';

import { useEffect, useRef } from 'react';

interface Spot {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  description?: string;
  order: number;
}

interface MapViewerProps {
  spots: Spot[];
  height?: string;
  interactive?: boolean;
}

export default function MapViewer({ spots, height = 'h-96', interactive = true }: MapViewerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // TODO: Mapbox GL JSの実装
    // 現在は仮のマップ表示
    const initializeMap = () => {
      // Mapbox GL JSがロードされていない場合の仮実装
      if (mapContainerRef.current) {
        mapContainerRef.current.innerHTML = `
          <div class="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg">
            <div class="text-center text-gray-600">
              <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3v10"></path>
              </svg>
              <p class="text-lg font-medium">地図を表示</p>
              <p class="text-sm">${spots.length}個のスポット</p>
            </div>
          </div>
        `;
      }
    };

    initializeMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [spots]);

  return (
    <div className={`w-full ${height} rounded-lg overflow-hidden border border-gray-200`}>
      <div ref={mapContainerRef} className="w-full h-full"></div>
    </div>
  );
}
