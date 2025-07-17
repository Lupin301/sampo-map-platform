'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFirestore } from '@/hooks/useFirestore';

interface LikeButtonProps {
  mapId: string;
  initialLikeCount: number;
  size?: 'small' | 'medium' | 'large';
  showCount?: boolean;
}

export default function LikeButton({
  mapId,
  initialLikeCount,
  size = 'medium',
  showCount = false
}: LikeButtonProps) {
  const { user } = useAuth();
  const { toggleLike, checkLikeStatus } = useFirestore();
  
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);

  // いいね状態を確認
  useEffect(() => {
    if (user && mapId) {
      checkLikeStatus(mapId)
        .then(status => {
          setIsLiked(status);
        })
        .catch(error => {
          console.error('いいね状態確認エラー:', error);
        });
    }
  }, [user, mapId, checkLikeStatus]);

  const handleLike = async () => {
    if (!user) {
      alert('いいねするにはログインが必要です');
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      await toggleLike(mapId);
      
      // 楽観的更新
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);
      setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1);
    } catch (error) {
      console.error('いいね更新エラー:', error);
      alert('いいねの更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // サイズに応じたスタイル
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'p-1 text-xs';
      case 'large':
        return 'p-3 text-lg';
      default:
        return 'p-2 text-sm';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 'w-4 h-4';
      case 'large':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading || !user}
      className={`
        inline-flex items-center space-x-1 rounded-md transition-colors
        ${getSizeClasses()}
        ${isLiked 
          ? 'bg-red-100 text-red-600 hover:bg-red-200' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }
        ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
        ${!user ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      title={user ? (isLiked ? 'いいねを取り消す' : 'いいね') : 'ログインが必要です'}
    >
      {/* ハートアイコン */}
      <svg
        className={`${getIconSize()} ${isLiked ? 'fill-current' : 'fill-none stroke-current'}`}
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      
      {/* いいね数表示 */}
      {showCount && (
        <span className="font-medium">
          {likeCount}
        </span>
      )}
    </button>
  );
}
