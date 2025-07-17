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
    description: '',
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
        <div className="max-w-4xl mx-auto px-4 py-8">
          
          {/* シンプルなヘッダー */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">地図を作成</h1>
            <p className="text-gray-600">あなたの特別な場所を共有しましょう</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 基本情報 - note.com風のシンプルなデザイン */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="space-y-4">
                
                {/* タイトル */}
                <div>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-0 py-2 text-2xl font-bold text-gray-900 placeholder-gray-400 border-0 border-b-2 border-transparent focus:border-blue-500 focus:outline-none resize-none"
                    placeholder="地図のタイトルを入力"
                    required
                  />
                </div>

                {/* 説明（任意） */}
                <div>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-0 py-2 text-gray-700 placeholder-gray-400 border-0 border-b border-gray-200 focus:border-blue-500 focus:outline-none resize-none"
                    placeholder="この地図について簡単に説明してください（任意）"
                  />
                </div>

                {/* 公開設定 */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="isPublic"
                        checked={formData.isPublic}
                        onChange={() => setFormData({ ...formData, isPublic: true })}
                        className="mr-2 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">公開</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="isPublic"
                        checked={!formData.isPublic}
                        onChange={() => setFormData({ ...formData, isPublic: false })}
                        className="mr-2 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">非公開</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* 地図エディター */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <MapEditor
                spots={formData.spots}
                onSpotsChange={(spots) => setFormData({ ...formData, spots })}
              />
            </div>

            {/* 作成ボタン - note.com風のシンプルなデザイン */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading || !formData.title.trim()}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? '作成中...' : '公開する'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
}
