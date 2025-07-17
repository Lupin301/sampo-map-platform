'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapboxMapProps {
  onMapLoad?: (map: mapboxgl.Map) => void;
  className?: string;
  center?: [number, number];
  zoom?: number;
}

export default function MapboxMap({
  onMapLoad,
  className = "w-full h-96",
  center = [139.6917, 35.6895], // 東京駅
  zoom = 10
}: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const loadedRef = useRef<boolean>(false);

  useEffect(() => {
    // 既にマップが初期化されている場合は何もしない
    if (!mapContainer.current || mapRef.current || loadedRef.current) {
      return;
    }

    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('Mapbox access token not found');
      return;
    }

    mapboxgl.accessToken = accessToken;

    try {
      // マップ初期化フラグを設定
      loadedRef.current = true;

      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center,
        zoom,
        transformRequest: (url, resourceType) => {
          if (resourceType === 'Tile') {
            return {
              url: url + '?language=ja'
            };
          }
          return { url };
        },
        // タッチイベントの警告を抑制
        touchPitch: false,
        touchZoomRotate: false
      });

      // マップが読み込まれた時のイベント
      mapRef.current.on('load', () => {
        if (mapRef.current && onMapLoad) {
          onMapLoad(mapRef.current);
        }
      });

      // エラーハンドリング
      mapRef.current.on('error', (e) => {
        console.error('Mapbox map error:', e);
      });

    } catch (error) {
      console.error('Error creating Mapbox map:', error);
      loadedRef.current = false;
    }

    // クリーンアップ関数
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      loadedRef.current = false;
    };
  }, []); // 依存配列を空にして一度だけ実行

  return <div ref={mapContainer} className={className} />;
}
