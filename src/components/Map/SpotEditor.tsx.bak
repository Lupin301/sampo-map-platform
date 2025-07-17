'use client';

import { useState, useEffect } from 'react';
import { SpotData, spotTypes } from '@/hooks/useFirestore';

interface SpotEditorProps {
  spot?: SpotData | null;
  coordinates?: { lat: number; lng: number } | null;
  onSave: (spotData: Omit<SpotData, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export default function SpotEditor({
  spot,
  coordinates,
  onSave,
  onCancel,
  onDelete
}: SpotEditorProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('other');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [rating, setRating] = useState<number | ''>('');
  const [spotCoordinates, setSpotCoordinates] = useState({ lat: 0, lng: 0 });

  useEffect(() => {
    if (spot) {
      setName(spot.name);
      setDescription(spot.description || '');
      setType(spot.type || 'other');
      setAddress(spot.address || '');
      setWebsite(spot.website || '');
      setRating(spot.rating || '');
      setSpotCoordinates(spot.coordinates);
    } else if (coordinates) {
      setSpotCoordinates(coordinates);
      setName('');
      setDescription('');
      setType('other');
      setAddress('');
      setWebsite('');
      setRating('');
    }
  }, [spot, coordinates]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('スポット名を入力してください');
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim(),
      type,
      coordinates: spotCoordinates,
      address: address.trim(),
      website: website.trim(),
      rating: rating === '' ? undefined : Number(rating)
    });
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('このスポットを削除しますか？')) {
      onDelete();
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4">
        {spot ? 'スポットを編集' : '新しいスポット'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            スポット名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            placeholder="スポットの名前を入力"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            説明
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            placeholder="このスポットについて説明してください"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            カテゴリ
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          >
            {spotTypes.map((spotType) => (
              <option key={spotType.value} value={spotType.value}>
                {spotType.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            住所
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            placeholder="住所を入力"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ウェブサイト
          </label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            評価 (1-5)
          </label>
          <input
            type="number"
            min="1"
            max="5"
            step="0.1"
            value={rating}
            onChange={(e) => setRating(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            placeholder="1.0 - 5.0"
          />
        </div>

        <div className="text-xs text-gray-500">
          座標: {spotCoordinates.lat.toFixed(6)}, {spotCoordinates.lng.toFixed(6)}
        </div>

        <div className="flex space-x-2 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
          >
            キャンセル
          </button>
          
          {onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors"
            >
              削除
            </button>
          )}
          
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            {spot ? '更新' : '追加'}
          </button>
        </div>
      </form>
    </div>
  );
}
