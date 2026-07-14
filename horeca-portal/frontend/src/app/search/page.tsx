'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/services/api';
import ProductCard from '@/components/ui/ProductCard';
import Loading from '@/components/common/Loading';
import { Product } from '@/types';
import { debounce } from '@/lib/utils';

interface AutocompleteItem {
  id: string;
  nameUz: string;
  nameRu?: string;
  sku: string;
  imageUrl?: string;
}

interface PopularSearch {
  query: string;
  count: number;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Product[]>([]);
  const [autocomplete, setAutocomplete] = useState<AutocompleteItem[]>([]);
  const [popularSearches, setPopularSearches] = useState<PopularSearch[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  useEffect(() => {
    loadPopularSearches();
    loadRecentSearches();
  }, []);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const loadPopularSearches = async () => {
    try {
      const data = await api.getPopularSearches();
      setPopularSearches(data);
    } catch (error) {
      console.error('Failed to load popular searches:', error);
    }
  };

  const loadRecentSearches = async () => {
    try {
      const data = await api.getSearchHistory();
      setRecentSearches(data.map((item: any) => item.query));
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  };

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setShowAutocomplete(false);

    try {
      const data = await api.search(searchQuery);
      setResults(data.results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutocomplete = useCallback(
    debounce(async (value: string) => {
      if (value.length < 2) {
        setAutocomplete([]);
        return;
      }

      try {
        const data = await api.autocomplete(value);
        setAutocomplete(data);
        setShowAutocomplete(true);
      } catch (error) {
        console.error('Autocomplete failed:', error);
      }
    }, 300),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    handleAutocomplete(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleAutocompleteSelect = (item: AutocompleteItem) => {
    setQuery(item.nameUz);
    setShowAutocomplete(false);
    router.push(`/search?q=${encodeURIComponent(item.nameUz)}`);
  };

  const handlePopularSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="px-4 py-3">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => router.back()} className="p-1 -ml-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={query}
                  onChange={handleInputChange}
                  onFocus={() => query.length >= 2 && setShowAutocomplete(true)}
                  onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
                  placeholder="Mahsulot qidirish..."
                  autoFocus
                  className="w-full px-4 py-2 pl-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {query && (
                  <button type="button" onClick={() => { setQuery(''); setResults([]); setAutocomplete([]); }} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {showAutocomplete && autocomplete.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                {autocomplete.map((item) => (
                  <button key={item.id} type="button" onClick={() => handleAutocompleteSelect(item)} className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.nameUz}</p>
                      {item.nameRu && <p className="text-xs text-gray-500">{item.nameRu}</p>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </form>
        </div>
      </header>

      <div className="px-4 py-4">
        {loading && <Loading text="Qidirilmoqda..." />}

        {!loading && results.length > 0 && (
          <div>
            <p className="text-sm text-gray-500 mb-3">{results.length} ta natija topildi</p>
            <div className="space-y-3">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <div className="text-center py-12">
            <span className="text-5xl mb-4 block">🔍</span>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Natija topilmadi</h3>
            <p className="text-gray-500">&quot;{query}&quot; bo&apos;yicha mahsulot topilmadi</p>
          </div>
        )}

        {!loading && !query && (
          <div className="space-y-6">
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Oxirgi qidiruvlar</h3>
                  <button onClick={async () => { await api.clearSearchHistory(); setRecentSearches([]); }} className="text-sm text-blue-500">Tozalash</button>
                </div>
                <div className="space-y-2">
                  {recentSearches.slice(0, 5).map((search, index) => (
                    <button key={index} onClick={() => handlePopularSearch(search)} className="w-full flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-50">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-700">{search}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {popularSearches.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Mashhur qidiruvlar</h3>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((item, index) => (
                    <button key={index} onClick={() => handlePopularSearch(item.query)} className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50">
                      {item.query}
                      <span className="ml-2 text-xs text-gray-400">({item.count})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Tavsiya etilgan</h3>
              <div className="flex flex-wrap gap-2">
                {['Deterjan', 'Peçete', 'Havlu', 'Dezenfektan', 'Nevresim'].map((term) => (
                  <button key={term} onClick={() => handlePopularSearch(term)} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm hover:bg-blue-100">
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<Loading fullScreen text="Yuklanmoqda..." />}>
      <SearchContent />
    </Suspense>
  );
}