'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { FoodItem } from '@/types/meals';
import {
  searchFoods,
  mockRecentFoods,
  mockFavoriteFoods,
} from '@/data/mock-foods';

interface UseFoodSearchOptions {
  debounceMs?: number;
}

interface UseFoodSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: FoodItem[];
  isLoading: boolean;
  error: string | null;
  recentFoods: FoodItem[];
  favoriteFoods: FoodItem[];
  clearSearch: () => void;
}

export function useFoodSearch(
  options: UseFoodSearchOptions = {}
): UseFoodSearchReturn {
  const { debounceMs = 300 } = options;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search effect
  useEffect(() => {
    // Reset results if query is too short
    if (!query || query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const timeoutId = setTimeout(() => {
      try {
        // In production, this would be an API call
        const searchResults = searchFoods(query);
        setResults(searchResults);
        setIsLoading(false);
      } catch (err) {
        setError('Erreur lors de la recherche');
        setIsLoading(false);
      }
    }, debounceMs);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [query, debounceMs]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
  }, []);

  // Memoize recent and favorite foods
  const recentFoods = useMemo(() => mockRecentFoods, []);
  const favoriteFoods = useMemo(() => mockFavoriteFoods, []);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    recentFoods,
    favoriteFoods,
    clearSearch,
  };
}

// Hook for scanning barcodes (placeholder for future implementation)
export function useBarcodeScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedFood, setScannedFood] = useState<FoodItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startScan = useCallback(() => {
    // In production, this would open the camera and use a barcode scanning library
    setIsScanning(true);
    setError(null);

    // Mock: After 2 seconds, show "not found" message
    setTimeout(() => {
      setIsScanning(false);
      setError('Scanner de code-barres non disponible');
    }, 2000);
  }, []);

  const stopScan = useCallback(() => {
    setIsScanning(false);
  }, []);

  const clearScan = useCallback(() => {
    setScannedFood(null);
    setError(null);
  }, []);

  return {
    isScanning,
    scannedFood,
    error,
    startScan,
    stopScan,
    clearScan,
  };
}

export default useFoodSearch;
