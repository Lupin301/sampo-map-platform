'use client';

import { useState, useRef, useEffect } from 'react';

interface GooglePlacesSearchProps {
  onPlaceSelect: (place: any) => void;
}

export default function GooglePlacesSearch({ onPlaceSelect }: GooglePlacesSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Next.js APIルートを使って検索
  const searchPlaces = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/places/search?q=${encodeURIComponent(searchQuery)}`);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (data.results && Array.isArray(data.results)) {
        setResults(data.results);
        setShowResults(true);
      } else {
        setResults([]);
        setShowResults(false);
      }
    } catch (error) {
      console.error('Search error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      
      // エラー時のフォールバック: 異なる場所のデモデータ
      const fallbackResults = [
        {
          name: `${searchQuery}駅`,
          address: '東京都千代田区丸の内1丁目',
          lat: 35.6812 + (Math.random() - 0.5) * 0.01,
          lng: 139.7671 + (Math.random() - 0.5) * 0.01,
          place_id: `fallback-1-${Date.now()}`
        },
        {
          name: `${searchQuery}センター`,
          address: '東京都新宿区新宿3丁目',
          lat: 35.6896 + (Math.random() - 0.5) * 0.01,
          lng: 139.7006 + (Math.random() - 0.5) * 0.01,
          place_id: `fallback-2-${Date.now()}`
        },
        {
          name: `${searchQuery}ビル`,
          address: '東京都渋谷区道玄坂1丁目',
          lat: 35.6580 + (Math.random() - 0.5) * 0.01,
          lng: 139.7016 + (Math.random() - 0.5) * 0.01,
          place_id: `fallback-3-${Date.now()}`
        }
      ];
      
      setResults(fallbackResults);
      setShowResults(true);
    } finally {
      setLoading(false);
    }
  };

  // 場所選択時の処理
  const handlePlaceSelect = (place: any) => {
    console.log('Selected place:', place); // デバッグ用
    onPlaceSelect(place);
    setQuery('');
    setResults([]);
    setShowResults(false);
    setError(null);
  };

  // 検索の遅延実行
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        searchPlaces(query);
      } else {
        setResults([]);
        setShowResults(false);
        setError(null);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // 外側クリックで結果を非表示
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={inputRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowResults(results.length > 0)}
          placeholder="場所を検索..."
          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="absolute right-3 top-2.5">
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          ) : (
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
      </div>
      
      {error && (
        <div className="absolute top-full left-0 right-0 bg-red-50 border border-red-200 rounded-b-md p-3 z-10">
          <div className="text-sm text-red-600">
            ⚠️ {error}
          </div>
        </div>
      )}
      
      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-md max-h-60 overflow-y-auto z-20 shadow-lg">
          {results.map((place, index) => (
            <button
              key={place.place_id || index}
              onClick={() => handlePlaceSelect(place)}
              className="w-full px-4 py-3 text-left hover:bg-gray-100 border-b border-gray-200 last:border-b-0 transition-colors"
            >
              <div className="font-medium text-gray-900">{place.name}</div>
              <div className="text-sm text-gray-600">{place.address}</div>
              <div className="text-xs text-gray-500 mt-1">
                緯度: {place.lat.toFixed(4)}, 経度: {place.lng.toFixed(4)}
              </div>
            </button>
          ))}
        </div>
      )}
      
      {showResults && results.length === 0 && !loading && !error && query.trim() && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-md p-4 z-10 shadow-lg">
          <div className="text-center text-gray-500">
            <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-sm">検索結果が見つかりませんでした</p>
          </div>
        </div>
      )}
    </div>
  );
}
