import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import { productService, categoryService } from '../services/productService';
import ProductCard from '../components/common/ProductCard';
import { SkeletonGrid } from '../components/common/SkeletonCard';
import { EmptyState, Pagination } from '../components/common/SharedUI';

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-ratingsAverage', label: 'Top Rated' },
  { value: '-soldCount', label: 'Best Selling' },
];

const useDebouncedValue = (value, delay) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);
  return debounced;
};

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebouncedValue(searchInput, 400);

  const category = searchParams.get('category') || '';
  const collection = searchParams.get('collection') || '';
  const sort = searchParams.get('sort') || '-createdAt';
  const page = Number(searchParams.get('page')) || 1;
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const { data: categoriesData } = useQuery({ queryKey: ['categories'], queryFn: categoryService.getCategories });

  const queryParams = useMemo(() => {
    const params = { page, limit: 12, sort };
    if (debouncedSearch) params.search = debouncedSearch;
    if (minPrice) params['price[gte]'] = minPrice;
    if (maxPrice) params['price[lte]'] = maxPrice;
    return params;
  }, [page, sort, debouncedSearch, minPrice, maxPrice]);

  const isCollectionView = !!collection;

  const { data, isLoading } = useQuery({
    queryKey: ['products', queryParams, category, collection],
    queryFn: () => {
      if (isCollectionView) return productService.getCollection(collection, { limit: 48 });
      const params = { ...queryParams };
      if (category) {
        const catObj = categoriesData?.categories?.find((c) => c.slug === category);
        if (catObj) params.category = catObj._id;
      }
      return productService.getProducts(params);
    },
    enabled: !isCollectionView || !!collection,
  });

  const updateParam = useCallback(
    (key, value) => {
      const next = new URLSearchParams(searchParams);
      if (value) next.set(key, value);
      else next.delete(key);
      if (key !== 'page') next.delete('page');
      setSearchParams(next);
    },
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    if (debouncedSearch !== (searchParams.get('search') || '')) {
      updateParam('search', debouncedSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const products = data?.products || [];
  const totalPages = isCollectionView ? 1 : data?.pages || 1;
  const total = isCollectionView ? products.length : data?.total || 0;

  const clearFilters = () => {
    setSearchParams({});
    setSearchInput('');
  };

  return (
    <>
      <Helmet>
        <title>Shop Handmade Crochet | Crochet Nest</title>
        <meta name="description" content="Browse our full collection of handmade crochet bags, tops, accessories, and gifts." />
      </Helmet>

      <div className="section-padding pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <span className="label-eyebrow">The Collection</span>
            <h1 className="text-3xl sm:text-4xl mt-2">
              {collection ? collection.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Shop All'}
            </h1>
            <p className="text-brown-light mt-2">{total} handmade piece{total !== 1 ? 's' : ''} found</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search crochet bags, tops, gifts…"
              className="input-cozy flex-1"
            />
            <div className="flex gap-3">
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="input-cozy w-auto"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <button
                onClick={() => setFiltersOpen(true)}
                className="btn-outline lg:hidden px-4"
                aria-label="Filters"
              >
                <SlidersHorizontal size={18} />
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-[220px_1fr] gap-8">
            {/* Desktop filters */}
            <aside className="hidden lg:block">
              <FilterPanel
                categories={categoriesData?.categories || []}
                activeCategory={category}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onCategory={(v) => updateParam('category', v)}
                onPrice={(min, max) => {
                  const next = new URLSearchParams(searchParams);
                  if (min) next.set('minPrice', min); else next.delete('minPrice');
                  if (max) next.set('maxPrice', max); else next.delete('maxPrice');
                  next.delete('page');
                  setSearchParams(next);
                }}
                onClear={clearFilters}
              />
            </aside>

            {/* Mobile filter drawer */}
            {filtersOpen && (
              <div className="fixed inset-0 z-50 lg:hidden flex">
                <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  className="relative w-72 bg-cream h-full p-6 overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display text-lg">Filters</h3>
                    <button onClick={() => setFiltersOpen(false)}><X size={20} /></button>
                  </div>
                  <FilterPanel
                    categories={categoriesData?.categories || []}
                    activeCategory={category}
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    onCategory={(v) => { updateParam('category', v); setFiltersOpen(false); }}
                    onPrice={(min, max) => {
                      const next = new URLSearchParams(searchParams);
                      if (min) next.set('minPrice', min); else next.delete('minPrice');
                      if (max) next.set('maxPrice', max); else next.delete('maxPrice');
                      setSearchParams(next);
                      setFiltersOpen(false);
                    }}
                    onClear={clearFilters}
                  />
                </motion.div>
              </div>
            )}

            <div>
              {isLoading ? (
                <SkeletonGrid count={12} />
              ) : products.length === 0 ? (
                <EmptyState
                  icon="🧶"
                  title="No products found"
                  description="Try adjusting your filters or search term."
                  action={<button onClick={clearFilters} className="btn-primary">Clear Filters</button>}
                />
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 sm:gap-7">
                    {products.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                  {!isCollectionView && (
                    <Pagination page={page} pages={totalPages} onChange={(p) => updateParam('page', p)} />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const FilterPanel = ({ categories, activeCategory, minPrice, maxPrice, onCategory, onPrice, onClear }) => {
  const [min, setMin] = useState(minPrice);
  const [max, setMax] = useState(maxPrice);

  return (
    <div className="space-y-8">
      <div>
        <h4 className="font-label font-semibold text-brown-deep mb-3 text-sm uppercase tracking-wide">Category</h4>
        <div className="space-y-1">
          <button
            onClick={() => onCategory('')}
            className={`block w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${!activeCategory ? 'bg-rose/15 text-rose-dark font-medium' : 'text-brown-deep hover:bg-beige/40'}`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => onCategory(cat.slug)}
              className={`block w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${activeCategory === cat.slug ? 'bg-rose/15 text-rose-dark font-medium' : 'text-brown-deep hover:bg-beige/40'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-label font-semibold text-brown-deep mb-3 text-sm uppercase tracking-wide">Price Range</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            className="input-cozy py-2 text-sm"
          />
          <span className="text-brown-light">–</span>
          <input
            type="number"
            placeholder="Max"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className="input-cozy py-2 text-sm"
          />
        </div>
        <button onClick={() => onPrice(min, max)} className="btn-outline w-full mt-3 text-sm py-2">Apply</button>
      </div>

      <button onClick={onClear} className="text-sm text-rose-dark font-label font-medium hover:underline">
        Clear all filters
      </button>
    </div>
  );
};

export default Shop;
