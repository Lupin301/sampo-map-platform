'use client';

import { useEffect, useRef, useState } from 'react';

interface GooglePlacesSearchProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  placeholder?: string;
  className?: string;
}

export default function GooglePlacesSearch({
  onPlaceSelect,
  placeholder = "場所を検索...",
  className = ""
}: GooglePlacesSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Google Places APIの初期化（1回のみ）
  useEffect(() => {
    if (isInitialized) return;
    
    initializeGooglePlaces();
  }, [isInitialized]);

  const initializeGooglePlaces = async () => {
    if (isInitialized) return;
    
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    
    if (!apiKey) {
      setError('Google Places APIキーが設定されていません');
      return;
    }

    try {
      setIsInitialized(true);
      
      // Google Maps APIが既に読み込まれているかチェック
      if (window.google && window.google.maps && window.google.maps.places) {
        console.log('✅ Google Maps API already loaded');
        setupAutocomplete();
        return;
      }

      // 既存のスクリプトタグをチェック
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        console.log('⏳ Google Maps API script exists, waiting...');
        waitForGoogleMaps();
        return;
      }

      // 新しいスクリプトを追加
      console.log('📥 Loading Google Maps API...');
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        console.log('✅ Google Maps API script loaded');
        waitForGoogleMaps();
      };

      script.onerror = () => {
        console.error('❌ Google Maps API script failed to load');
        setError('Google Maps APIの読み込みに失敗しました');
        setIsInitialized(false);
      };

      document.head.appendChild(script);

    } catch (error) {
      console.error('Google Places初期化エラー:', error);
      setError('検索機能の初期化に失敗しました');
      setIsInitialized(false);
    }
  };

  const waitForGoogleMaps = () => {
    let attempts = 0;
    const maxAttempts = 50;

    const checkInterval = setInterval(() => {
      attempts++;
      
      if (window.google && window.google.maps && window.google.maps.places) {
        clearInterval(checkInterval);
        setupAutocomplete();
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        setError('Google Maps APIの初期化がタイムアウトしました');
        setIsInitialized(false);
      }
    }, 100);
  };

  const setupAutocomplete = () => {
    if (!inputRef.current) {
      setError('入力要素が見つかりません');
      return;
    }

    if (autocompleteRef.current) {
      console.log('♻️ Autocomplete already exists, cleaning up...');
      // 既存のリスナーをクリーンアップ
      google.maps.event.clearInstanceListeners(autocompleteRef.current);
      autocompleteRef.current = null;
    }

    try {
      console.log('🔧 Setting up Google Places Autocomplete...');
      
      // 新しいAPIが利用可能かチェック（将来的な対応）
      if (window.google.maps.places.PlaceAutocompleteElement) {
        console.log('🆕 New PlaceAutocompleteElement available, but using legacy for stability');
      }
      
      // 従来のAutocompleteを使用（警告は表示されるが動作は安定）
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          fields: ['place_id', 'geometry', 'name', 'formatted_address'],
          types: ['establishment', 'geocode']
        }
      );

      // リスナーを追加
      const listener = autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        console.log('🔍 Place selected:', place?.name);
        
        if (place && place.geometry) {
          // 即座に入力をクリア（地図の再読み込みを防ぐ）
          if (inputRef.current) {
            inputRef.current.value = '';
            inputRef.current.blur(); // フォーカスを外す
          }
          
          // コールバックを呼び出し
          onPlaceSelect(place);
        }
      });

      setIsLoaded(true);
      setError(null);
      console.log('✅ Google Places Autocomplete setup complete');
      
    } catch (error) {
      console.error('Autocomplete設定エラー:', error);
      setError('検索機能の設定に失敗しました');
    }
  };

  // クリーンアップ関数
  useEffect(() => {
    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, []);

  if (error) {
    return (
      <div className={className}>
        <input
          type="text"
          disabled
          placeholder="検索機能が利用できません"
          className="w-full px-4 py-3 border-2 border-red-300 rounded-lg bg-red-50 text-red-700 placeholder-red-400 text-base"
        />
        <p className="text-xs text-red-600 mt-2 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder={isLoaded ? placeholder : "Google Places APIを読み込み中..."}
          disabled={!isLoaded}
          className={`
            w-full pl-12 pr-4 py-3 
            border-2 border-gray-300 rounded-lg 
            bg-white text-gray-900 
            placeholder-gray-500 
            text-base font-medium
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            hover:border-gray-400
            transition-colors duration-200
            ${!isLoaded ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}
          `}
        />
        {!isLoaded && !error && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
      
      {!isLoaded && !error && (
        <p className="text-xs text-blue-600 mt-2 font-medium">
          Google Places検索を準備中...
        </p>
      )}
      
      {isLoaded && (
        <p className="text-xs text-green-600 mt-2 font-medium">
          ✅ 場所を検索してスポットを追加できます
        </p>
      )}
    </div>
  );
}
