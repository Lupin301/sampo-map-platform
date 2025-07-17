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
  
  const [formData, setFormData] = useState({
    title: '',
    description: '', // 空文字列でも可
    isPublic: true,
    spots: []
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      router.push('/login');
      return;
    }

    if (!formData.title.trim()) {
      alert('地図のタイトルを入力してください');
      return;
    }

    setIsLoading(true);
    
    try {
      const mapData = {
        ...formData,
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          
          {/* ヘッダー */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">地図を作成</h1>
            <p className="text-gray-600">あなたの特別な場所を共有しましょう</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 基本情報 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">基本情報</h2>
              
              <div className="space-y-4">
                {/* タイトル（必須） */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    地図のタイトル <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例：お気に入りのカフェ巡り"
                    required
                  />
                </div>

                {/* 説明（任意） */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    説明（任意）
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="この地図について簡単に説明してください（任意）"
                  />
                </div>

                {/* 公開設定 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    公開設定
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="isPublic"
                        checked={formData.isPublic}
                        onChange={() => setFormData({ ...formData, isPublic: true })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">公開（みんなが見ることができます）</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="isPublic"
                        checked={!formData.isPublic}
                        onChange={() => setFormData({ ...formData, isPublic: false })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">非公開（自分だけが見ることができます）</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* 地図エディター */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">地図にスポットを追加</h2>
              <MapEditor
                spots={formData.spots}
                onSpotsChange={(spots) => setFormData({ ...formData, spots })}
              />
            </div>

            {/* 作成ボタン */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.title.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? '作成中...' : '地図を作成'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
}
