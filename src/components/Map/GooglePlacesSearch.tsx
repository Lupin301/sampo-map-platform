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

  // 検索関数
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
      console.log('Searching for:', searchQuery); // デバッグ用
      
      const response = await fetch(`/api/places/search?q=${encodeURIComponent(searchQuery)}`);
      
      console.log('Response status:', response.status); // デバッグ用
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText); // デバッグ用
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data); // デバッグ用
      
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
      setResults([]);
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  };

  // 場所選択
  const handlePlaceSelect = (place: any) => {
    console.log('Place selected:', place); // デバッグ用
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
    }, 800); // 800msに延長

    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div className="relative" ref={inputRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
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
                緯度: {place.lat}, 経度: {place.lng}
              </div>
            </button>
          ))}
        </div>
      )}
      
      {loading && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-md p-3 z-10">
          <div className="text-sm text-gray-600 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            検索中...
          </div>
        </div>
      )}
    </div>
  );
}
