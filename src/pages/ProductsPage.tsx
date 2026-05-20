// src/pages/ProductsPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, ChevronDown, Grid, List, X } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { ProductCard } from '../components/ui/ProductCard';
import { databaseService } from '../services/databaseService';
import { useStoreData } from '../hooks/useStoreData';
import type { Product, Category } from '../utils/storeConfig';

export const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { categories, footerLinks, socialLinks, storeSettings } = useStoreData();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const itemsPerPage = 12;

  useEffect(() => {
    loadProducts();
  }, [currentPage, selectedCategory, sortBy, searchTerm]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const result = await databaseService.getProductsWithFilters({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        search: searchTerm || undefined,
        sortBy: sortBy as any,
        page: currentPage,
        limit: itemsPerPage,
      });
      
      setProducts(result.products);
      setTotalProducts(result.total);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    updateURLParams();
    loadProducts();
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    updateURLParams();
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(1);
    updateURLParams();
  };

  const updateURLParams = () => {
    const params: any = {};
    if (searchTerm) params.search = searchTerm;
    if (selectedCategory !== 'all') params.category = selectedCategory;
    if (sortBy !== 'newest') params.sort = sortBy;
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('newest');
    setCurrentPage(1);
    setSearchParams({});
    loadProducts();
  };

  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
  ];

  return (
    <div className="min-h-screen bg-theme-surface">
      <Navbar categories={categories} companyName={storeSettings?.company_name} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif text-theme mb-2">All Products</h1>
          <p className="text-theme-light">Discover our curated collection of premium products</p>
        </div>

        {/* Search and Filters Bar */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-theme-primary text-gray-900"
                />
              </div>
            </form>

            {/* Filter Toggle Button (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-theme"
            >
              <Filter className="w-4 h-4" />
              Filters
              {(selectedCategory !== 'all' || searchTerm) && (
                <span className="w-2 h-2 bg-theme-primary rounded-full" />
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="appearance-none px-4 py-2.5 pr-10 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-theme-primary text-gray-900 cursor-pointer"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* View Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-theme-primary text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-theme-primary text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          <div className={`mt-4 p-4 bg-white rounded-lg border border-gray-200 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Categories</h3>
              {(selectedCategory !== 'all' || searchTerm) && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear all
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryChange('all')}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-theme-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Products
              </button>
              {categories.filter(c => c.enabled).map(category => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-theme-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-theme-light">
            Showing {products.length} of {totalProducts} products
          </div>
        </div>

        {/* Products Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-theme-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-medium text-theme mb-2">No products found</h3>
            <p className="text-theme-light mb-4">Try adjusting your search or filters</p>
            <button
              onClick={clearFilters}
              className="text-theme-primary hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {products.map(product => (
              <div key={product.id} className="flex gap-4 bg-white rounded-lg p-4 shadow">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-24 h-24 object-cover rounded-lg cursor-pointer"
                  onClick={() => navigate(`/product/${product.id}`)}
                />
                <div className="flex-1">
                  <h3 
                    className="font-medium text-theme cursor-pointer hover:text-theme-primary"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    {product.name}
                  </h3>
                  <p className="text-sm text-theme-light mt-1 line-clamp-2">{product.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-lg font-bold text-theme">${product.price}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-theme-light line-through">${product.originalPrice}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {/* Add to cart logic */}}
                  className="px-4 py-2 bg-theme-primary text-white rounded-lg hover:bg-opacity-90"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-lg transition-colors ${
                      currentPage === pageNum
                        ? 'bg-theme-primary text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </main>

      <Footer footerLinks={footerLinks} socialLinks={socialLinks} companyName={storeSettings?.company_name} />
    </div>
  );
};