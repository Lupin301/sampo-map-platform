'use client';

import { useEffect, useRef, useState } from 'react';

interface Spot {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  description?: string;
  order: number;
}

interface MapEditorProps {
  spots: Spot[];
  onSpotsChange: (spots: Spot[]) => void;
}

export default function MapEditor({ spots, onSpotsChange }: MapEditorProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [mapboxLoaded, setMapboxLoaded] = useState(false);

  // Mapboxの初期化
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initializeMap = async () => {
      try {
        // Mapbox GL JSを動的に読み込み
        const mapboxgl = await import('mapbox-gl');
        
        if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
          console.warn('Mapbox access token not found. Using demo mode.');
          return;
        }

        mapboxgl.default.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

        const map = new mapboxgl.default.Map({
          container: mapContainerRef.current!,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [139.7514, 35.6851], // 東京駅
          zoom: 10
        });

        mapRef.current = map;

        // 地図がロードされたら
        map.on('load', () => {
          setMapboxLoaded(true);
        });

        // 地図クリック時の処理
        map.on('click', (e) => {
          const { lng, lat } = e.lngLat;
          
          // 新しいスポットを追加
          const newSpot: Spot = {
            id: Date.now().toString(),
            name: `スポット ${spots.length + 1}`,
            address: `緯度: ${lat.toFixed(4)}, 経度: ${lng.toFixed(4)}`,
            lat,
            lng,
            description: '',
            order: spots.length + 1
          };
          
          onSpotsChange([...spots, newSpot]);
        });

      } catch (error) {
        console.error('Mapbox initialization error:', error);
      }
    };

    initializeMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // スポットのマーカーを更新
  useEffect(() => {
    if (!mapRef.current || !mapboxLoaded) return;

    // 既存のマーカーを削除
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // 新しいマーカーを追加
    spots.forEach((spot, index) => {
      const mapboxgl = require('mapbox-gl');
      
      // マーカー要素を作成
      const markerElement = document.createElement('div');
      markerElement.className = 'custom-marker';
      markerElement.style.cssText = `
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: #3B82F6;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      `;
      markerElement.textContent = (index + 1).toString();

      // マーカーをクリック時の処理
      markerElement.addEventListener('click', () => {
        setSelectedSpot(spot);
        setIsEditing(true);
      });

      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([spot.lng, spot.lat])
        .addTo(mapRef.current);

      markersRef.current.push(marker);
    });

    // 地図の範囲を調整
    if (spots.length > 0) {
      const bounds = new (require('mapbox-gl')).LngLatBounds();
      spots.forEach(spot => {
        bounds.extend([spot.lng, spot.lat]);
      });
      mapRef.current.fitBounds(bounds, { padding: 50 });
    }
  }, [spots, mapboxLoaded]);

  // スポットを更新
  const handleUpdateSpot = (updatedSpot: Spot) => {
    const updatedSpots = spots.map(spot => 
      spot.id === updatedSpot.id ? updatedSpot : spot
    );
    onSpotsChange(updatedSpots);
    setSelectedSpot(null);
    setIsEditing(false);
  };

  // スポットを削除
  const handleDeleteSpot = (spotId: string) => {
    const updatedSpots = spots.filter(spot => spot.id !== spotId);
    onSpotsChange(updatedSpots);
    setSelectedSpot(null);
    setIsEditing(false);
  };

  return (
    <div className="h-full flex">
      
      {/* 左側: スポット管理パネル */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        
        {/* 検索エリア */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="場所を検索..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute right-3 top-2.5">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            ✅ 場所を検索してスポットを追加できます
          </p>
          <p className="text-sm text-gray-500">
            また地図をクリックしてもスポットを追加できます
          </p>
        </div>

        {/* スポット一覧 */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              スポット一覧 ({spots.length})
            </h3>
            
            {spots.length > 0 ? (
              <div className="space-y-3">
                {spots.map((spot, index) => (
                  <div
                    key={spot.id}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200 cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      setSelectedSpot(spot);
                      setIsEditing(true);
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{spot.name}</h4>
                        <p className="text-sm text-gray-600">{spot.address}</p>
                        {spot.description && (
                          <p className="text-sm text-gray-700 mt-1">{spot.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-sm">まだスポットが追加されていません</p>
              </div>
            )}
          </div>
        </div>

        {/* スポット編集エリア */}
        {isEditing && selectedSpot && (
          <div className="border-t border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">スポットを編集</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              handleUpdateSpot({
                ...selectedSpot,
                name: formData.get('name') as string,
                description: formData.get('description') as string
              });
            }} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  スポット名
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={selectedSpot.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  説明（任意）
                </label>
                <textarea
                  name="description"
                  defaultValue={selectedSpot.description}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  保存
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteSpot(selectedSpot.id)}
                  className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  削除
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSpot(null);
                    setIsEditing(false);
                  }}
                  className="px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* 右側: 地図表示エリア */}
      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="w-full h-full" />
        
        {!mapboxLoaded && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">地図を読み込み中...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
