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
  const inputRef = useRef<HTMLInputElement>(null);

  // 検索関数
  const searchPlaces = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`/api/places/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (data.results && Array.isArray(data.results)) {
        setResults(data.results);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  };

  // 場所選択
  const handlePlaceSelect = (place: any) => {
    onPlaceSelect(place);
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  // 検索の遅延実行
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        searchPlaces(query);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div className="relative" ref={inputRef}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="場所を検索..."
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      
      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-md max-h-60 overflow-y-auto z-20 shadow-lg">
          {results.map((place, index) => (
            <button
              key={place.place_id || index}
              onClick={() => handlePlaceSelect(place)}
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
