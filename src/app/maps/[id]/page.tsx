'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useFirestore, MapData } from '@/hooks/useFirestore';
import Header from '@/components/Header';
import MapViewer from '@/components/Map/MapViewer';
import Link from 'next/link';

export default function MapPreviewPage() {
  const { user } = useAuth();
  const { id } = useParams();
  const router = useRouter();
  const { getMap, updateMap, incrementViewCount, toggleLike, checkLikeStatus, loading } = useFirestore();
  
  const [map, setMap] = useState<MapData | null>(null);
  const [error, setError] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadMap();
    }
  }, [id]);

  const loadMap = async () => {
    try {
      const mapData = await getMap(id as string);
      setMap(mapData);
      
      // 所有者チェック
      if (user && mapData.createdBy === user.uid) {
        setIsOwner(true);
      }
      
      // 閲覧数を増加（所有者以外の場合）
      if (!user || mapData.createdBy !== user.uid) {
        incrementViewCount(id as string);
      }
      
      // いいね状態を確認
      if (user) {
        const liked = await checkLikeStatus(id as string);
        setIsLiked(liked);
      }
    } catch (error: any) {
      console.error('地図読み込みエラー:', error);
      setError(error.message || '地図の読み込みに失敗しました');
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert('いいねするにはログインしてください');
      return;
    }

    try {
      await toggleLike(id as string);
      setIsLiked(!isLiked);
      
      // いいね数を更新
      if (map) {
        setMap(prev => ({
          ...prev!,
          likeCount: (prev!.likeCount || 0) + (isLiked ? -1 : 1)
        }));
      }
    } catch (error: any) {
      console.error('いいねエラー:', error);
      alert('いいねに失敗しました');
    }
  };

  // 公開設定の更新
  const handlePublishToggle = async () => {
    if (!map || !isOwner) return;
    
    setPublishLoading(true);
    try {
      const newPublicState = !map.isPublic;
      await updateMap(map.id!, { isPublic: newPublicState });
      
      setMap(prev => ({
        ...prev!,
        isPublic: newPublicState
      }));
      
      setShowPublishModal(false);
      
      if (newPublicState) {
        alert('地図をマーケットプレイスに公開しました！');
      } else {
        alert('地図を非公開にしました');
      }
    } catch (error: any) {
      console.error('公開設定エラー:', error);
      alert('公開設定の更新に失敗しました');
    } finally {
      setPublishLoading(false);
    }
  };

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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* 地図情報ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  {map.title}
                </h1>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    map.isPublic 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {map.isPublic ? '✅ 公開中' : '🔒 非公開'}
                  </span>
                  {isOwner && (
                    <button
                      onClick={() => setShowPublishModal(true)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        map.isPublic
                          ? 'bg-red-100 text-red-800 hover:bg-red-200'
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      }`}
                    >
                      {map.isPublic ? '非公開にする' : 'マーケットプレイスに公開'}
                    </button>
                  )}
                </div>
              </div>
              
              <p className="text-gray-600 mt-2">{map.description}</p>
              
              <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                <span>📍 {map.spots?.length || 0} スポット</span>
                <span>👁️ {map.viewCount || 0} 閲覧</span>
                <span>❤️ {map.likeCount || 0} いいね</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {!isOwner && user && (
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                    isLiked 
                      ? 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{isLiked ? '❤️' : '🤍'}</span>
                  <span>{isLiked ? 'いいね済み' : 'いいね'}</span>
                </button>
              )}
              
              {isOwner && (
                <Link
                  href={`/maps/${map.id}/edit`}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <span>✏️</span>
                  <span>編集</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 地図表示エリア */}
      <div className="h-screen">
        <MapViewer 
          map={map}
          showSpotList={true}
        />
      </div>

      {/* 公開設定モーダル */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {map.isPublic ? '地図を非公開にしますか？' : '地図をマーケットプレイスに公開しますか？'}
            </h3>
            
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                {map.isPublic ? (
                  <div>
                    <p className="mb-2">この地図を非公開にすると：</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>マーケットプレイスから非表示になります</li>
                      <li>他のユーザーが閲覧できなくなります</li>
                      <li>あなたのみアクセス可能になります</li>
                    </ul>
                  </div>
                ) : (
                  <div>
                    <p className="mb-2">この地図を公開すると：</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>マーケットプレイスに表示されます</li>
                      <li>他のユーザーが閲覧できます</li>
                      <li>いいねや閲覧数が増える可能性があります</li>
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-blue-800">
                  💡 地図の公開状態はいつでも変更できます
                </p>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowPublishModal(false)}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handlePublishToggle}
                disabled={publishLoading}
                className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                  map.isPublic
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } disabled:opacity-50`}
              >
                {publishLoading ? '更新中...' : (map.isPublic ? '非公開にする' : '公開する')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
