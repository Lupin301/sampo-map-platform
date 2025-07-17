'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFirestore, isFirebaseConfigured } from '@/hooks/useFirestore';

interface LikeButtonProps {
  mapId: string;
  className?: string;
}

export default function LikeButton({ mapId, className = '' }: LikeButtonProps) {
  const { user } = useAuth();
  const { addLike, removeLike, isLiked, likesCount } = useFirestore();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && mapId && isFirebaseConfigured()) {
      // いいね状態を確認
      const checkLikeStatus = async () => {
        try {
          const likedStatus = await isLiked(mapId, user.uid);
          setLiked(likedStatus);
          
          const currentCount = await likesCount(mapId);
          setCount(currentCount);
        } catch (error) {
          console.error('いいね状態の確認エラー:', error);
        }
      };

      checkLikeStatus();
    } else {
      // デモモードの場合はランダムな値を設定
      setLiked(Math.random() > 0.5);
      setCount(Math.floor(Math.random() * 10));
    }
  }, [user, mapId, isLiked, likesCount]);

  const handleLike = async () => {
    if (!user) {
      // ログインしていない場合はログインページに誘導
      alert('いいね機能を使用するにはログインが必要です');
      return;
    }

    setLoading(true);
    try {
      if (isFirebaseConfigured()) {
        if (liked) {
          await removeLike(mapId, user.uid);
          setLiked(false);
          setCount(prev => prev - 1);
        } else {
          await addLike(mapId, user.uid);
          setLiked(true);
          setCount(prev => prev + 1);
        }
      } else {
        // デモモードの場合はローカル状態のみ変更
        if (liked) {
          setLiked(false);
          setCount(prev => prev - 1);
        } else {
          setLiked(true);
          setCount(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('いいね処理エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
        liked
          ? 'bg-red-50 text-red-600 hover:bg-red-100'
          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <svg
        className={`w-5 h-5 ${liked ? 'fill-current' : 'stroke-current fill-none'}`}
        viewBox="0 0 24 24"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span className="text-sm font-medium">{count}</span>
    </button>
  );
}
