'use client';

import { useState, useRef, useEffect } from 'react';

interface GooglePlacesSearchProps {
  onPlaceSelect: (place: any) => void;
}

export default function GooglePlacesSearch({ onPlaceSelect }: GooglePlacesSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Google Places API検索（実装は後で）
  const searchPlaces = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      // TODO: Google Places APIの実装
      // 現在はダミーデータ
      const dummyResults = [
        {
          name: `${searchQuery} - サンプル場所1`,
          address: '東京都渋谷区',
          lat: 35.6762,
          lng: 139.6503
        },
        {
          name: `${searchQuery} - サンプル場所2`,
          address: '東京都新宿区',
          lat: 35.6896,
          lng: 139.6917
        }
      ];
      setResults(dummyResults);
    } catch (error) {
      console.error('場所検索エラー:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (place: any) => {
    onPlaceSelect(place);
    setQuery('');
    setResults([]);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchPlaces(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="場所を検索..."
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      
      {loading && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-md p-4 z-10">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">検索中...</span>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-md max-h-60 overflow-y-auto z-10">
          {results.map((place, index) => (
            <button
              key={index}
              onClick={() => handleSelect(place)}
              className="w-full px-4 py-3 text-left hover:bg-gray-100 border-b border-gray-200 last:border-b-0"
            >
              <div className="font-medium text-gray-900">{place.name}</div>
              <div className="text-sm text-gray-600">{place.address}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
