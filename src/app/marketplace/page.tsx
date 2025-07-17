'use client';

import { useEffect, useState } from 'react';
import { useFirestore, MapData, mapCategories } from '@/hooks/useFirestore';
import Header from '@/components/Header';
import LikeButton from '@/components/UI/LikeButton';
import Link from 'next/link';

export default function MarketplacePage() {
  const { getPublicMaps, loading } = useFirestore();
  const [maps, setMaps] = useState<MapData[]>([]);
  const [filteredMaps, setFilteredMaps] = useState<MapData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMaps();
  }, []);

  useEffect(() => {
    filterMaps();
  }, [maps, selectedCategory, searchTerm]);

  const loadMaps = async () => {
    try {
      const publicMaps = await getPublicMaps();
      setMaps(publicMaps);
    } catch (error) {
      console.error('地図読み込みエラー:', error);
    }
  };

  const filterMaps = () => {
    let filtered = maps;

    // カテゴリでフィルター
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(map => map.category === selectedCategory);
    }

    // 検索でフィルター
    if (searchTerm) {
      filtered = filtered.filter(map =>
        map.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        map.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMaps(filtered);
  };

  const formatPrice = (price?: number) => {
    if (!price) return '無料';
    return `¥${price.toLocaleString()}`;
  };

  const getCategoryLabel = (categoryValue: string) => {
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
            <div className="mt-2 text-gray-600">地図を読み込み中...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            マーケットプレイス
          </h1>
          <p className="text-gray-600">
            世界中のクリエイターが作成した地図を発見しよう
          </p>
        </div>

        {/* 検索とフィルター */}
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 検索ボックス */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="地図を検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
              />
            </div>

            {/* カテゴリフィルター */}
            <div className="sm:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="all">すべてのカテゴリ</option>
                {mapCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            {filteredMaps.length} 件の地図が見つかりました
          </div>
        </div>

        {/* 地図一覧 */}
        {filteredMaps.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredMaps.map((map) => (
              <div key={map.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-all duration-200">
                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 truncate">
                        {map.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2">
                        {getCategoryLabel(map.category || 'other')}
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
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">条件に一致する地図が見つかりませんでした</div>
            <Link
              href="/maps/create"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              新しい地図を作成
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
