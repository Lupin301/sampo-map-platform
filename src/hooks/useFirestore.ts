import { useState } from 'react';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// MapDataインターフェースを定義
export interface MapData {
  id: string;
  title: string;
  description?: string;
  isPublic: boolean;
  spots: Spot[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  category?: string;
}

// Spotインターフェースを定義
export interface Spot {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  description?: string;
  order: number;
}

// 地図カテゴリを定義
export const mapCategories = [
  { id: 'restaurant', name: 'レストラン・グルメ', icon: '🍽️' },
  { id: 'cafe', name: 'カフェ', icon: '☕' },
  { id: 'travel', name: '旅行・観光', icon: '🗺️' },
  { id: 'shopping', name: 'ショッピング', icon: '🛍️' },
  { id: 'nature', name: '自然・アウトドア', icon: '🌲' },
  { id: 'culture', name: '文化・芸術', icon: '🎨' },
  { id: 'sports', name: 'スポーツ', icon: '⚽' },
  { id: 'entertainment', name: 'エンターテイメント', icon: '🎬' },
  { id: 'other', name: 'その他', icon: '📍' }
];

export const useFirestore = () => {
  const [loading, setLoading] = useState(false);

  // 地図を作成
  const createMap = async (mapData: Omit<MapData, 'id'>) => {
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'maps'), mapData);
      return docRef.id;
    } catch (error) {
      console.error('地図作成エラー:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 地図を取得
  const getMap = async (mapId: string): Promise<MapData | null> => {
    setLoading(true);
    try {
      const docRef = doc(db, 'maps', mapId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as MapData;
      } else {
        return null;
      }
    } catch (error) {
      console.error('地図取得エラー:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 地図を更新
  const updateMap = async (mapId: string, mapData: Partial<MapData>) => {
    setLoading(true);
    try {
      const docRef = doc(db, 'maps', mapId);
      await updateDoc(docRef, mapData);
    } catch (error) {
      console.error('地図更新エラー:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 地図を削除
  const deleteMap = async (mapId: string) => {
    setLoading(true);
    try {
      const docRef = doc(db, 'maps', mapId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('地図削除エラー:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 公開地図を取得
  const getPublicMaps = async (): Promise<MapData[]> => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'maps'),
        where('isPublic', '==', true),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const maps = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as MapData;
      });
      return maps;
    } catch (error) {
      console.error('公開地図取得エラー:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ユーザーの地図を取得
  const getUserMaps = async (userId: string): Promise<MapData[]> => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'maps'),
        where('createdBy', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const maps = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as MapData;
      });
      return maps;
    } catch (error) {
      console.error('ユーザー地図取得エラー:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // いいねを追加
  const addLike = async (mapId: string, userId: string) => {
    try {
      const likeData = {
        mapId,
        userId,
        createdAt: new Date()
      };
      await addDoc(collection(db, 'userLikes'), likeData);
    } catch (error) {
      console.error('いいね追加エラー:', error);
      throw error;
    }
  };

  // いいねを削除
  const removeLike = async (mapId: string, userId: string) => {
    try {
      const q = query(
        collection(db, 'userLikes'),
        where('mapId', '==', mapId),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
    } catch (error) {
      console.error('いいね削除エラー:', error);
      throw error;
    }
  };

  // いいね状態を確認
  const isLiked = async (mapId: string, userId: string): Promise<boolean> => {
    try {
      const q = query(
        collection(db, 'userLikes'),
        where('mapId', '==', mapId),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('いいね状態確認エラー:', error);
      return false;
    }
  };

  // いいね数を取得
  const likesCount = async (mapId: string): Promise<number> => {
    try {
      const q = query(
        collection(db, 'userLikes'),
        where('mapId', '==', mapId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.error('いいね数取得エラー:', error);
      return 0;
    }
  };

  return {
    loading,
    createMap,
    getMap,
    updateMap,
    deleteMap,
    getPublicMaps,
    getUserMaps,
    addLike,
    removeLike,
    isLiked,
    likesCount
  };
};
