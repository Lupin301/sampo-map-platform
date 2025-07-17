'use client';

import { useState, useEffect } from 'react';
import GooglePlacesSearch from './GooglePlacesSearch';
import SpotEditor from './SpotEditor';
import SpotList from './SpotList';

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
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleAddSpot = (placeData: any) => {
    const newSpot: Spot = {
      id: Date.now().toString(),
      name: placeData.name,
      address: placeData.address,
      lat: placeData.lat,
      lng: placeData.lng,
      description: '',
      order: spots.length + 1
    };
    
    onSpotsChange([...spots, newSpot]);
  };

  const handleUpdateSpot = (updatedSpot: Spot) => {
    const updatedSpots = spots.map(spot => 
      spot.id === updatedSpot.id ? updatedSpot : spot
    );
    onSpotsChange(updatedSpots);
    setSelectedSpot(null);
    setIsEditing(false);
  };

  const handleDeleteSpot = (spotId: string) => {
    const updatedSpots = spots.filter(spot => spot.id !== spotId);
    onSpotsChange(updatedSpots);
    setSelectedSpot(null);
    setIsEditing(false);
  };

  const handleEditSpot = (spot: Spot) => {
    setSelectedSpot(spot);
    setIsEditing(true);
  };

  return (
    <div className="space-y-6">
      
      {/* 場所検索 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">場所を検索して追加</h3>
        <GooglePlacesSearch onPlaceSelect={handleAddSpot} />
      </div>

      {/* 追加されたスポットの一覧 */}
      {spots.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            追加されたスポット ({spots.length}件)
          </h3>
          <SpotList 
            spots={spots}
            onEditSpot={handleEditSpot}
            onDeleteSpot={handleDeleteSpot}
          />
        </div>
      )}

      {/* スポット編集フォーム */}
      {isEditing && selectedSpot && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">スポットを編集</h3>
          <SpotEditor
            spot={selectedSpot}
            onSave={handleUpdateSpot}
            onCancel={() => {
              setSelectedSpot(null);
              setIsEditing(false);
            }}
          />
        </div>
      )}

      {/* 空の状態 */}
      {spots.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">スポットを追加してください</h3>
          <p className="text-gray-600">上の検索バーを使って場所を検索し、地図に追加してください</p>
        </div>
      )}
    </div>
  );
}
