'use client';

import { useState, useEffect } from 'react';

interface Spot {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  description?: string;
  order: number;
}

interface SpotEditorProps {
  spot: Spot;
  onSave: (spot: Spot) => void;
  onCancel: () => void;
}

export default function SpotEditor({ spot, onSave, onCancel }: SpotEditorProps) {
  const [formData, setFormData] = useState({
    name: spot.name,
    description: spot.description || ''
  });

  useEffect(() => {
    setFormData({
      name: spot.name,
      description: spot.description || ''
    });
  }, [spot]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...spot,
      name: formData.name,
      description: formData.description
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          スポット名
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          説明（任意）
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="このスポットについて説明してください"
        />
      </div>

      <div className="flex space-x-3">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          保存
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
