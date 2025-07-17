'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useFirestore, MapData } from '@/hooks/useFirestore';
import Header from '@/components/Header';
import MapEditor from '@/components/Map/MapEditor';

export default function EditMapPage() {
  const { user } = useAuth();
  const { id } = useParams();
  const router = useRouter();
  const { getMap, updateMap, addSpot, updateSpot, deleteSpot, loading } = useFirestore();
  
  const [map, setMap] = useState<MapData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id && user) {
      loadMap();
    }
  }, [id, user]);

  const loadMap = async () => {
    try {
      const mapData = await getMap(id as string);
      
      // 地図の所有者確認
      if (mapData.createdBy !== user?.uid) {
        setError('この地図を編集する権限がありません');
        return;
      }
      
      setMap(mapData);
    } catch (error: any) {
      console.error('地図読み込みエラー:', error);
      setError(error.message || '地図の読み込みに失敗しました');
    }
  };

  // 地図更新処理
  const handleUpdateMap = async (updates: Partial<MapData>) => {
    if (!map?.id) return;
    
    try {
      await updateMap(map.id, updates);
      // ローカル状態も更新
      setMap(prev => prev ? { ...prev, ...updates } : null);
    } catch (error: any) {
      console.error('地図更新エラー:', error);
      throw error;
    }
  };

  // スポット追加処理
  const handleAddSpot = async (spotData: any) => {
    if (!map?.id) throw new Error('地図IDが見つかりません');
    
    try {
      console.log('📍 EditMapPage - Adding spot:', spotData);
      const newSpot = await addSpot(map.id, spotData);
      console.log('✅ EditMapPage - Spot added:', newSpot);
      
      // ローカル状態を更新
      setMap(prev => {
        if (!prev) return null;
        return {
          ...prev,
          spots: [...(prev.spots || []), newSpot]
        };
      });
      
      return newSpot;
    } catch (error: any) {
      console.error('❌ EditMapPage - スポット追加エラー:', error);
      throw error;
    }
  };

  // スポット更新処理
  const handleUpdateSpot = async (spotId: string, updates: any) => {
    if (!map?.id) return;
    
    try {
      await updateSpot(map.id, spotId, updates);
      // ローカル状態を更新
      setMap(prev => {
        if (!prev) return null;
        return {
          ...prev,
          spots: (prev.spots || []).map(spot => 
            spot.id === spotId ? { ...spot, ...updates } : spot
          )
        };
      });
    } catch (error: any) {
      console.error('スポット更新エラー:', error);
      throw error;
    }
  };

  // スポット削除処理
  const handleDeleteSpot = async (spotId: string) => {
    if (!map?.id) return;
    
    try {
      await deleteSpot(map.id, spotId);
      // ローカル状態を更新
      setMap(prev => {
        if (!prev) return null;
        return {
          ...prev,
          spots: (prev.spots || []).filter(spot => spot.id !== spotId)
        };
      });
    } catch (error: any) {
      console.error('スポット削除エラー:', error);
      throw error;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              ログインが必要です
            </h1>
            <p className="text-gray-600">
              地図を編集するにはログインしてください。
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !map) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <div className="mt-2 text-gray-600">
              {error || '地図を読み込み中...'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">エラー</h1>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="space-x-4">
              <button
                onClick={() => router.back()}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                戻る
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                再読み込み
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <MapEditor
        map={map}
        onUpdateMap={handleUpdateMap}
        onAddSpot={handleAddSpot}
        onUpdateSpot={handleUpdateSpot}
        onDeleteSpot={handleDeleteSpot}
      />
    </div>
  );
}
