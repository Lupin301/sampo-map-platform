'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useFirestore } from '@/hooks/useFirestore';
import Header from '@/components/Header';
import MapEditor from '@/components/Map/MapEditor';

export default function CreateMapPage() {
  const { user } = useAuth();
  const { createMap } = useFirestore();
  const router = useRouter();
  
  const [mapTitle, setMapTitle] = useState('');
  const [mapDescription, setMapDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [spots, setSpots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveMap = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!mapTitle.trim()) {
      alert('地図のタイトルを入力してください');
      return;
    }

    setIsLoading(true);
    
    try {
      const mapData = {
        title: mapTitle,
        description: mapDescription,
        isPublic,
        spots,
        createdBy: user.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const mapId = await createMap(mapData);
      router.push(`/maps/${mapId}`);
    } catch (error) {
      console.error('地図作成エラー:', error);
      alert('地図の作成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="h-screen bg-gray-50 flex flex-col">
        
        {/* 上部のタイトル入力エリア */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex-1 mr-4">
              <input
                type="text"
                value={mapTitle}
                onChange={(e) => setMapTitle(e.target.value)}
                className="w-full px-0 py-2 text-xl font-bold text-gray-900 placeholder-gray-400 border-0 focus:outline-none"
                placeholder="地図のタイトルを入力"
              />
              <input
                type="text"
                value={mapDescription}
                onChange={(e) => setMapDescription(e.target.value)}
                className="w-full px-0 py-1 text-gray-600 placeholder-gray-400 border-0 focus:outline-none"
                placeholder="説明（任意）"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="isPublic" className="text-sm text-gray-700">
                  公開中
                </label>
              </div>
              
              <button
                onClick={handleSaveMap}
                disabled={isLoading || !mapTitle.trim()}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>

        {/* 地図エディター */}
        <div className="flex-1">
          <MapEditor
            spots={spots}
            onSpotsChange={setSpots}
          />
        </div>
      </div>
    </>
  );
}
