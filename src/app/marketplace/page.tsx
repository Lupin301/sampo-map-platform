'use client';

import { useEffect, useState } from 'react';
import { useFirestore, MapData, mapCategories } from '@/hooks/useFirestore';
import Header from '@/components/Header';
import LikeButton from '@/components/UI/LikeButton';
import ClientOnly from '@/components/ClientOnly';

export default function MarketplacePage() {
  const { getPublicMaps, loading } = useFirestore();
  const [maps, setMaps] = useState<MapData[]>([]);
  const [filteredMaps, setFilteredMaps] = useState<MapData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const publicMaps = await getPublicMaps();
        setMaps(publicMaps);
        setFilteredMaps(publicMaps);
      } catch (error) {
        console.error('公開地図の取得エラー:', error);
      }
    };

    fetchMaps();
  }, [getPublicMaps]);

  // フィルタリング機能
  useEffect(() => {
    let filtered = maps;

    // カテゴリフィルタ
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(map => map.category === selectedCategory);
    }

    // 検索フィルタ
    if (searchQuery.trim()) {
      filtered = filtered.filter(map => 
        map.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        map.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredMaps(filtered);
  }, [maps, selectedCategory, searchQuery]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50">
          <div className="flex items-center justify-center pt-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          
          {/* ヘッダー */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">マーケットプレイス</h1>
            <p className="text-gray-600">みんなが作った地図を探してみよう</p>
          </div>

          {/* 検索・フィルタ */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              
              {/* 検索バー */}
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="地図のタイトルや説明から検索..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* カテゴリフィルタ */}
              <div className="md:w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option key="all" value="all">全てのカテゴリ</option>
                  {mapCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 地図一覧 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaps.length > 0 ? (
              filteredMaps.map((map) => (
                <div
                  key={map.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* 地図サムネイル */}
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3v10" />
                    </svg>
                  </div>

                  {/* 地図情報 */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                        {map.title}
                      </h3>
                      <ClientOnly>
                        <LikeButton mapId={map.id} />
                      </ClientOnly>
                    </div>
                    
                    {map.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {map.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {map.spots?.length || 0} スポット
                        </span>
                        {map.category && (
                          <span className="text-sm text-gray-500">
                            • {mapCategories.find(c => c.id === map.category)?.name}
                          </span>
                        )}
                      </div>
                      
                      <button
                        onClick={() => window.location.href = `/maps/${map.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        詳細を見る
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3v10" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery || selectedCategory !== 'all' ? '検索結果がありません' : '公開地図がありません'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || selectedCategory !== 'all' 
                    ? '検索条件を変更してもう一度試してください'
                    : '最初の地図を作成してみませんか？'
                  }
                </p>
                {!searchQuery && selectedCategory === 'all' && (
                  <button
                    onClick={() => window.location.href = '/maps/create'}
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    地図を作成
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
