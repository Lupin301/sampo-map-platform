'use client';

import { useEffect, useState } from 'react';
import { useFirestore, MapData, mapCategories } from '@/hooks/useFirestore';
import Header from '@/components/Header';
import LikeButton from '@/components/UI/LikeButton';
import ClientOnly from '@/components/ClientOnly';
import Link from 'next/link';

export default function HomePage() {
  const { getPublicMaps, loading } = useFirestore();
  const [mapsByCategory, setMapsByCategory] = useState<{ [key: string]: MapData[] }>({});
  const [allMaps, setAllMaps] = useState<MapData[]>([]);

  useEffect(() => {
    loadMaps();
  }, []);

  const loadMaps = async () => {
    try {
      const publicMaps = await getPublicMaps();
      setAllMaps(publicMaps);
      
      // カテゴリ別に地図を分類
      const categorizedMaps: { [key: string]: MapData[] } = {};
      
      mapCategories.forEach(category => {
        categorizedMaps[category.value] = publicMaps
          .filter(map => map.category === category.value)
          .slice(0, 4); // 各カテゴリ最大4つまで表示
      });
      
      setMapsByCategory(categorizedMaps);
    } catch (error) {
      console.error('地図読み込みエラー:', error);
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return '無料';
    return `¥${price.toLocaleString()}`;
  };

  const getCategoryIcon = (categoryValue: string) => {
    const category = mapCategories.find(cat => cat.value === categoryValue);
    return category ? category.label : 'その他';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <div className="mt-2 text-gray-600">読み込み中...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* ヒーローセクション */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            sampo
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-6">
            世界中のクリエイターが作成した地図を発見・購入・販売
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/marketplace"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              地図を探す
            </Link>
            <Link
              href="/maps/create"
              className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
            >
              地図を作成
            </Link>
          </div>
        </div>

        {/* カテゴリ別地図表示 */}
        <ClientOnly fallback={<div className="text-center py-8">読み込み中...</div>}>
          <div className="space-y-8 sm:space-y-12">
            {mapCategories.map((category) => {
              const categoryMaps = mapsByCategory[category.value] || [];
              
              if (categoryMaps.length === 0) return null;
              
              return (
                <section key={category.value}>
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      {category.label}
                    </h2>
                    <Link
                      href={`/marketplace?category=${category.value}`}
                      className="text-blue-600 hover:text-blue-700 text-sm sm:text-base"
                    >
                      もっと見る →
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {categoryMaps.map((map) => (
                      <div key={map.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-all duration-200">
                        <div className="p-4 sm:p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="min-w-0 flex-1">
                              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 truncate">
                                {map.title}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-600 mb-2">
                                {getCategoryIcon(map.category || 'other')}
                              </p>
                            </div>
                            <div className="text-right ml-2">
                              <div className="text-sm sm:text-base font-bold text-blue-600">
                                {formatPrice(map.price)}
                              </div>
                              {map.forSale && (
                                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                  販売中
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-gray-700 mb-4 text-sm line-clamp-2">
                            {map.description}
                          </p>

                          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 mb-4">
                            <div className="flex items-center space-x-2 sm:space-x-4">
                              <span>スポット {map.spots?.length || 0}</span>
                              <span>閲覧 {map.viewCount || 0}</span>
                            </div>
                            <LikeButton 
                              mapId={map.id!} 
                              initialLikeCount={map.likeCount || 0}
                              size="small"
                              showCount={true}
                            />
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2">
                            <Link
                              href={`/maps/${map.id}`}
                              className="flex-1 bg-gray-600 text-white px-3 py-2 rounded text-center text-sm hover:bg-gray-700 transition-colors"
                            >
                              詳細を見る
                            </Link>
                            {map.forSale && map.price && (
                              <Link
                                href={`/maps/${map.id}/purchase`}
                                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-center text-sm hover:bg-blue-700 transition-colors"
                              >
                                購入する
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </ClientOnly>
      </div>
    </div>
  );
}
