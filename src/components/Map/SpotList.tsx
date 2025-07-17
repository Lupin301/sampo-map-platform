'use client';

import { SpotData } from '@/hooks/useFirestore';

interface SpotListProps {
  spots: SpotData[];
  onEditSpot: (spot: SpotData) => void;
  onDeleteSpot: (spotId: string) => void;
  onSpotClick: (spot: SpotData) => void;
}

export default function SpotList({
  spots,
  onEditSpot,
  onDeleteSpot,
  onSpotClick
}: SpotListProps) {
  if (spots.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <div className="text-4xl mb-2">📍</div>
        <p className="text-sm">まだスポットがありません</p>
        <p className="text-xs mt-1">地図をクリックして最初のスポットを追加しましょう</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex-shrink-0">
        スポット一覧 ({spots.length})
      </h3>
      
      {/* スクロール可能なリストエリア */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {spots.map((spot, index) => (
          <div
            key={spot.id}
            className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSpotClick(spot)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center mb-2">
                  <div className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-sm font-bold mr-3 flex-shrink-0">
                    {index + 1}
                  </div>
                  <h4 className="font-medium text-gray-900 truncate text-sm sm:text-base">
                    {spot.name}
                  </h4>
                </div>
                
                {spot.description && (
                  <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
                    {spot.description}
                  </p>
                )}
                
                {spot.address && (
                  <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                    📍 {spot.address}
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
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
                      <span className="text-yellow-600 text-xs">
                        ⭐ {spot.rating}/5
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-1 ml-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSpotClick(spot);
                  }}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded text-xs transition-colors"
                  title="地図上で表示"
                >
                  🗺️
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditSpot(spot);
                  }}
                  className="p-1 text-gray-600 hover:bg-gray-50 rounded text-xs transition-colors"
                  title="編集"
                >
                  ✏️
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('このスポットを削除しますか？')) {
                      onDeleteSpot(spot.id!);
                    }
                  }}
                  className="p-1 text-red-600 hover:bg-red-50 rounded text-xs transition-colors"
                  title="削除"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
