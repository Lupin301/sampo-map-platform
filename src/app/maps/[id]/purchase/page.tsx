'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useFirestore, MapData } from '@/hooks/useFirestore';
import Header from '@/components/Header';
import { formatPrice, calculateStripeAmount } from '@/lib/stripe';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import CheckoutForm from '@/components/Payment/CheckoutForm';

export default function PurchaseMapPage() {
  const { user } = useAuth();
  const { id } = useParams();
  const router = useRouter();
  const { getMap, incrementViewCount, loading } = useFirestore();
  
  const [map, setMap] = useState<MapData | null>(null);
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    if (id) {
      loadMap();
    }
  }, [user, id]);

  const loadMap = async () => {
    try {
      const mapData = await getMap(id as string);
      
      // 販売中でない場合はエラー
      if (!mapData.forSale || !mapData.price) {
        setError('この地図は販売されていません');
        return;
      }

      // 自分の地図は購入できない
      if (mapData.createdBy === user?.uid) {
        setError('自分の地図は購入できません');
        return;
      }
      
      setMap(mapData);
      await incrementViewCount(id as string);
      
      // PaymentIntentを作成
      await createPaymentIntent(mapData);
    } catch (error) {
      setError('地図の読み込みに失敗しました');
    }
  };

  const createPaymentIntent = async (mapData: MapData) => {
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mapId: mapData.id,
          amount: mapData.price,
          currency: 'jpy',
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        return;
      }

      setClientSecret(data.clientSecret);
    } catch (error) {
      setError('決済の準備に失敗しました');
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
              地図を購入するにはログインしてください。
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
          <div className="text-center">
            <div className="text-gray-600">
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
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">エラー</h1>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => router.back()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalAmount = calculateStripeAmount(map.price || 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">地図を購入</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 地図情報 */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">購入する地図</h2>
              
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {map.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {map.description}
                </p>
                
                <div className="space-y-2 text-sm text-gray-500">
                  <div>スポット数: {map.spots?.length || 0}個</div>
                  <div>カテゴリ: {map.category}</div>
                  <div>閲覧数: {map.viewCount || 0}</div>
                  {map.averageRating && map.averageRating > 0 && (
                    <div>評価: ⭐ {map.averageRating.toFixed(1)} ({map.reviewCount}件)</div>
                  )}
                </div>

                {map.tags && map.tags.length > 0 && (
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {map.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">購入後にできること</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 地図の完全版を閲覧</li>
                  <li>• すべてのスポット情報にアクセス</li>
                  <li>• オフラインでの利用</li>
                  <li>• レビューの投稿</li>
                </ul>
              </div>
            </div>

            {/* 決済フォーム */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">お支払い</h2>
              
              <div className="border rounded-lg p-6">
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span>地図価格</span>
                    <span>{formatPrice(map.price || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2 text-sm text-gray-500">
                    <span>決済手数料</span>
                    <span>{formatPrice(totalAmount - (map.price || 0))}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between items-center font-semibold">
                    <span>合計</span>
                    <span>{formatPrice(totalAmount)}</span>
                  </div>
                </div>

                {clientSecret && (
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      appearance: {
                        theme: 'stripe',
                        variables: {
                          colorPrimary: '#2563eb',
                        },
                      },
                    }}
                  >
                    <CheckoutForm
                      mapId={map.id!}
                      amount={totalAmount}
                      onSuccess={() => {
                        router.push(`/maps/${map.id}?purchased=true`);
                      }}
                    />
                  </Elements>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
