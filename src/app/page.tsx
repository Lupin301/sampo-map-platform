'use client';

import { useEffect, useState } from 'react';
import { useFirestore, MapData } from '@/hooks/useFirestore';
import Header from '@/components/Header';
import LikeButton from '@/components/UI/LikeButton';
import ClientOnly from '@/components/ClientOnly';
import Link from 'next/link';

export default function HomePage() {
  const { getPublicMaps, loading } = useFirestore();
  const [maps, setMaps] = useState<MapData[]>([]);

  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const publicMaps = await getPublicMaps();
        setMaps(publicMaps);
      } catch (error) {
        console.error('公開地図の取得エラー:', error);
      }
    };

    fetchMaps();
  }, [getPublicMaps]);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        
        {/* ヒーローセクション */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              あなたの特別な場所を共有しよう
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              世界中のクリエイターが作成した地図を発見・購入・販売
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                href="/marketplace"
                className="bg-blue-600 text-white px-8 py-3 rounded-md text-lg hover:bg-blue-700 transition-colors"
              >
                地図を探す
              </Link>
              <Link
                href="/maps/create"
                className="bg-green-600 text-white px-8 py-3 rounded-md text-lg hover:bg-green-700 transition-colors"
              >
                地図を作成
              </Link>
            </div>
          </div>
        </div>

        {/* 人気の地図セクション */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">人気の地図</h2>
            <p className="text-gray-600">みんなに愛されている地図をチェック</p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {maps.length > 0 ? (
                maps.slice(0, 6).map((map) => (
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
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                          {map.title}
                        </h3>
                        <ClientOnly>
                          <LikeButton mapId={map.id} />
                        </ClientOnly>
                      </div>
                      
                      {map.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {map.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500">
                          <span>{map.spots?.length || 0} スポット</span>
                        </div>
                        
                        <Link
                          href={`/maps/${map.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          詳細を見る
                        </Link>
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
                  <h3 className="text-lg font-medium text-gray-900 mb-2">まだ地図がありません</h3>
                  <p className="text-gray-600 mb-6">最初の地図を作成してみませんか？</p>
                  <Link
                    href="/maps/create"
                    className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    地図を作成
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
