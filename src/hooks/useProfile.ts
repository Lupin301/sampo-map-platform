import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';

export interface Profile {
  uid: string;
  displayName?: string;
  bio?: string;
  photoURL?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // プロフィール取得
  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      if (!isFirebaseConfigured()) {
        // デモモードの場合
        const demoProfile = {
          uid: user.uid,
          displayName: user.displayName || 'デモユーザー',
          bio: 'これはデモプロフィールです。',
          photoURL: user.photoURL || '',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setProfile(demoProfile);
        setLoading(false);
        return;
      }

      const profileDoc = await getDoc(doc(db, 'profiles', user.uid));
      
      if (profileDoc.exists()) {
        const data = profileDoc.data();
        setProfile({
          uid: user.uid,
          displayName: data.displayName,
          bio: data.bio,
          photoURL: data.photoURL,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        });
      } else {
        // プロフィールが存在しない場合は基本情報を設定
        const newProfile = {
          uid: user.uid,
          displayName: user.displayName || user.email?.split('@')[0] || '',
          bio: '',
          photoURL: user.photoURL || '',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        // Firestoreに新しいプロフィールを作成
        await setDoc(doc(db, 'profiles', user.uid), newProfile);
        setProfile(newProfile);
      }
    } catch (error) {
      console.error('プロフィール取得エラー:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  // プロフィール更新
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;

    try {
      if (!isFirebaseConfigured()) {
        // デモモードの場合はローカル状態のみ更新
        setProfile(prev => prev ? { ...prev, ...updates, updatedAt: new Date() } : null);
        return;
      }

      const profileRef = doc(db, 'profiles', user.uid);
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };

      // ドキュメントが存在しない場合は作成
      const profileDoc = await getDoc(profileRef);
      if (!profileDoc.exists()) {
        await setDoc(profileRef, {
          uid: user.uid,
          displayName: user.displayName || user.email?.split('@')[0] || '',
          bio: '',
          photoURL: user.photoURL || '',
          createdAt: new Date(),
          ...updateData,
        });
      } else {
        await updateDoc(profileRef, updateData);
      }
      
      // ローカル状態も更新
      setProfile(prev => prev ? { ...prev, ...updateData } : null);
    } catch (error) {
      console.error('プロフィール更新エラー:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    updateProfile,
    refetch: fetchProfile,
  };
};
