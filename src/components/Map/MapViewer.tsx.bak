'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { MapData, SpotData } from '@/hooks/useFirestore';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapViewerProps {
 map: MapData;
 showSpotList?: boolean;
 height?: string;
}

export default function MapViewer({ 
 map, 
 showSpotList = false, 
 height = "100vh" 
}: MapViewerProps) {
 const mapContainer = useRef<HTMLDivElement>(null);
 const mapRef = useRef<mapboxgl.Map | null>(null);
 const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
 const mapInitialized = useRef<boolean>(false);
 
 const [loading, setLoading] = useState(true);
 const [sidebarOpen, setSidebarOpen] = useState(showSpotList);
 const [mapError, setMapError] = useState<string | null>(null);

 // 地図の初期化
 useEffect(() => {
   if (!mapContainer.current || mapInitialized.current) {
     return;
   }

   const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
   if (!accessToken) {
     setMapError('Mapboxアクセストークンが設定されていません');
     setLoading(false);
     return;
   }

   console.log('🗺️ Initializing MapViewer');
   mapboxgl.accessToken = accessToken;

   const spots = map.spots || [];
   const center = spots.length > 0 
     ? [spots[0].coordinates.lng, spots[0].coordinates.lat] as [number, number]
     : [139.6917, 35.6895] as [number, number];

   try {
     mapInitialized.current = true;
     
     mapRef.current = new mapboxgl.Map({
       container: mapContainer.current,
       style: 'mapbox://styles/mapbox/streets-v12',
       center,
       zoom: spots.length > 0 ? 12 : 10,
       antialias: true
     });

     // コントロールを追加
     mapRef.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
     mapRef.current.addControl(
       new mapboxgl.GeolocateControl({
         positionOptions: {
           enableHighAccuracy: true
         },
         trackUserLocation: true,
         showUserHeading: true
       }),
       'bottom-right'
     );

     // 地図読み込み完了イベント
     mapRef.current.on('load', () => {
       console.log('✅ MapViewer loaded successfully');
       setLoading(false);
       setMapError(null);
       updateMarkers();
     });

     // エラーイベント
     mapRef.current.on('error', (e) => {
       console.error('❌ MapViewer error:', e);
       setMapError('地図の読み込みに失敗しました');
       setLoading(false);
     });

   } catch (error: any) {
     console.error('❌ Error creating MapViewer:', error);
     setMapError('地図の初期化に失敗しました: ' + error.message);
     setLoading(false);
     mapInitialized.current = false;
   }

   // クリーンアップ関数
   return () => {
     if (mapRef.current) {
       console.log('🧹 Cleaning up MapViewer');
       mapRef.current.remove();
       mapRef.current = null;
     }
     mapInitialized.current = false;
   };
 }, [map.id]);

 // マーカー更新
 const updateMarkers = useCallback(() => {
   if (!mapRef.current || !mapRef.current.isStyleLoaded()) {
     console.log('⏳ Map not ready for markers yet');
     return;
   }

   console.log('🔄 Updating markers in MapViewer. Total spots:', map.spots?.length || 0);

   const currentSpots = map.spots || [];
   
   // 既存のマーカーをすべて削除
   Object.values(markersRef.current).forEach(marker => {
     marker.remove();
   });
   markersRef.current = {};

   // 新しいマーカーを追加（番号付き）
   currentSpots.forEach((spot, index) => {
     if (!spot.id) {
       console.log('⚠️ Spot without ID found:', spot);
       return;
     }

     const spotNumber = index + 1;
     console.log(`📍 Adding marker ${spotNumber} for spot: ${spot.name}`);

     const markerElement = document.createElement('div');
     markerElement.className = 'custom-marker';
     markerElement.innerHTML = `
       <div style="
         background: #3B82F6;
         border: 3px solid white;
         border-radius: 50%;
         width: 32px;
         height: 32px;
         cursor: pointer;
         box-shadow: 0 2px 4px rgba(0,0,0,0.3);
         display: flex;
         align-items: center;
         justify-content: center;
         color: white;
         font-weight: bold;
         font-size: 14px;
         font-family: system-ui, -apple-system, sans-serif;
         transition: transform 0.2s;
       " 
       onmouseover="this.style.transform='scale(1.1)'" 
       onmouseout="this.style.transform='scale(1)'"
       >${spotNumber}</div>
     `;

     try {
       const marker = new mapboxgl.Marker(markerElement)
         .setLngLat([spot.coordinates.lng, spot.coordinates.lat])
         .setPopup(
           new mapboxgl.Popup({ offset: 25 }).setHTML(`
             <div class="p-3">
               <div class="flex items-center mb-2">
                 <span class="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-sm font-bold mr-2">
                   ${spotNumber}
                 </span>
                 <h3 class="font-bold text-lg">${spot.name}</h3>
               </div>
               ${spot.description ? `<p class="text-sm text-gray-600 mb-2">${spot.description}</p>` : ''}
               ${spot.address ? `<p class="text-xs text-gray-500 mb-2">${spot.address}</p>` : ''}
               ${spot.rating ? `<div class="text-sm">評価: ${spot.rating}/5</div>` : ''}
             </div>
           `)
         )
         .addTo(mapRef.current!);

       markersRef.current[spot.id] = marker;
     } catch (error) {
       console.error('❌ Error adding marker:', error);
     }
   });

   console.log('✅ Markers updated in MapViewer. Total markers:', Object.keys(markersRef.current).length);
 }, [map.spots]);

 useEffect(() => {
   if (mapRef.current && mapRef.current.isStyleLoaded()) {
     updateMarkers();
   }
 }, [map.spots, updateMarkers]);

 // スポットクリック処理
 const handleSpotClick = (spot: SpotData) => {
   if (mapRef.current && mapRef.current.isStyleLoaded()) {
     mapRef.current.flyTo({
       center: [spot.coordinates.lng, spot.coordinates.lat],
       zoom: 16,
       duration: 1000
     });
     
     const marker = markersRef.current[spot.id!];
     if (marker) {
       marker.getPopup().addTo(mapRef.current);
     }
   }
 };

 return (
   <div className="flex h-full bg-gray-100">
     {/* レスポンシブサイドバー */}
     {showSpotList && (
       <div className={`bg-white shadow-lg transition-all duration-300 ${
         sidebarOpen ? 'w-80 md:w-80 sm:w-72' : 'w-0'
       } overflow-hidden flex flex-col`}>
         
         {/* サイドバーヘッダー（固定） */}
         <div className="flex-shrink-0 p-4 border-b bg-blue-50">
           <h2 className="text-lg font-bold text-gray-900">{map.title}</h2>
           <p className="text-sm text-gray-600 mt-1 line-clamp-2">{map.description}</p>
           <div className="text-xs text-gray-500 mt-2">
             📍 {map.spots?.length || 0} スポット
           </div>
         </div>
         
         {/* スポットリスト（スクロール可能） */}
         <div className="flex-1 overflow-y-auto p-4">
           {(map.spots || []).length === 0 ? (
             <div className="text-center text-gray-500 py-8">
               <div className="text-4xl mb-2">📍</div>
               <p className="text-sm">スポットがありません</p>
             </div>
           ) : (
             <div className="h-full flex flex-col">
               <h3 className="text-lg font-semibold text-gray-900 mb-3 flex-shrink-0">
                 スポット一覧 ({map.spots?.length || 0})
               </h3>
               
               {/* スクロール可能なリストエリア */}
               <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                 {(map.spots || []).map((spot, index) => (
                   <div
                     key={spot.id}
                     className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                     onClick={() => handleSpotClick(spot)}
                   >
                     <div className="flex items-start">
                       <div className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-sm font-bold mr-3 flex-shrink-0">
                         {index + 1}
                       </div>
                       <div className="flex-1 min-w-0">
                         <h4 className="font-medium text-gray-900 truncate text-sm sm:text-base">
                           {spot.name}
                         </h4>
                         
                         {spot.description && (
                           <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                             {spot.description}
                           </p>
                         )}
                         
                         {spot.address && (
                           <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                             📍 {spot.address}
                           </p>
                         )}
                         
                         <div className="flex items-center mt-2 text-xs text-gray-500">
                           <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                             {spot.type === 'restaurant' ? '🍽️ レストラン' :
                              spot.type === 'cafe' ? '☕ カフェ' :
                              spot.type === 'shopping' ? '🛍️ ショッピング' :
                              spot.type === 'sightseeing' ? '🏛️ 観光地' :
                              spot.type === 'hotel' ? '🏨 ホテル' :
                              spot.type === 'park' ? '🌳 公園' :
                              spot.type === 'museum' ? '🏛️ 博物館' :
                              spot.type === 'entertainment' ? '🎭 エンターテイメント' :
                              spot.type === 'transportation' ? '🚉 交通機関' :
                              '📌 その他'}
                           </span>
                           
                           {spot.rating && (
                             <span className="text-yellow-600 ml-2 text-xs">
                               ⭐ {spot.rating}/5
                             </span>
                           )}
                         </div>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           )}
         </div>
       </div>
     )}

     {/* メイン地図エリア */}
     <div className="flex-1 relative">
       {showSpotList && (
         <div className="absolute top-4 left-4 z-10">
           <button
             onClick={() => setSidebarOpen(!sidebarOpen)}
             className="bg-white p-2 rounded-md shadow-md hover:bg-gray-50 transition-colors"
           >
             <span className="text-gray-600">
               {sidebarOpen ? '←' : '→'}
             </span>
           </button>
         </div>
       )}

       <div 
         ref={mapContainer} 
         className="w-full h-full"
         style={{ height }}
       />
       
       {loading && (
         <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
           <div className="text-center">
             <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
             <div className="text-gray-600">地図を読み込み中...</div>
           </div>
         </div>
       )}

       {mapError && (
         <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
           <div className="text-center max-w-md mx-4">
             <div className="text-red-600 mb-4 text-sm">{mapError}</div>
             <button
               onClick={() => window.location.reload()}
               className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
             >
               地図を再読み込み
             </button>
           </div>
         </div>
       )}
     </div>
   </div>
 );
}
