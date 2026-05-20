// src/pages/admin/AdminProducts.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit, Trash2, Eye, Search, Filter, X, ChevronDown, ChevronUp, Copy, Check, AlertCircle, Upload, Image as ImageIcon } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  enabled: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  description: string | null;
  image: string | null;
  images: string[] | null;
  category_id: string | null;
  is_new: boolean;
  is_best_seller: boolean;
  is_on_sale: boolean;
  enabled: boolean;
  rating: number;
  section: string | null;
  has_sizes: boolean;
  sizes: string[] | null;
  created_at: string;
}

export const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageGallery, setImageGallery] = useState<string[]>([]);
  const [sizeInput, setSizeInput] = useState('');

    const adminStyles = {
    button: {
        color: '#1f2937',
        backgroundColor: '#f3f4f6',
    },
    primaryButton: {
        color: '#ffffff',
        backgroundColor: '#7c3aed',
    },
    editButton: {
        color: '#2563eb',
    },
    deleteButton: {
        color: '#dc2626',
    },
    };
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    original_price: '',
    description: '',
    image: '',
    images: [] as string[],
    category_id: '',
    is_new: false,
    is_best_seller: false,
    is_on_sale: false,
    enabled: true,
    section: '',
    has_sizes: false,
    sizes: [] as string[],
    rating: 0
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug, enabled')
        .eq('enabled', true)
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    if (!formData.image) {
      newErrors.image = 'Product image URL is required';
    }
    if (!formData.category_id) {
      newErrors.category_id = 'Please select a category';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const productData = {
      name: formData.name,
      price: parseFloat(formData.price),
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      description: formData.description || null,
      image: formData.image,
      images: formData.images,
      category_id: formData.category_id || null,
      is_new: formData.is_new,
      is_best_seller: formData.is_best_seller,
      is_on_sale: formData.is_on_sale,
      enabled: formData.enabled,
      section: formData.section || null,
      has_sizes: formData.has_sizes,
      sizes: formData.has_sizes ? formData.sizes : null,
      rating: formData.rating
    };
    
    if (editingProduct) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id);
      
      if (!error) {
        setSuccessMessage('Product updated successfully!');
        await loadProducts();
        setShowModal(false);
        setEditingProduct(null);
        resetForm();
      } else {
        setErrors({ submit: error.message });
      }
    } else {
      const { error } = await supabase
        .from('products')
        .insert([productData]);
      
      if (!error) {
        setSuccessMessage('Product created successfully!');
        await loadProducts();
        setShowModal(false);
        resetForm();
      } else {
        setErrors({ submit: error.message });
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (!error) {
        setSuccessMessage('Product deleted successfully!');
        await loadProducts();
      } else {
        setErrors({ submit: error.message });
      }
    }
  };

  const handleDuplicate = async (product: Product) => {
    const newProduct = {
      name: `${product.name} (Copy)`,
      price: product.price,
      original_price: product.original_price,
      description: product.description,
      image: product.image,
      images: product.images,
      category_id: product.category_id,
      is_new: false,
      is_best_seller: false,
      is_on_sale: false,
      enabled: true,
      section: null,
      has_sizes: product.has_sizes,
      sizes: product.sizes,
      rating: 0
    };

    const { error } = await supabase
      .from('products')
      .insert([newProduct]);
    
    if (!error) {
      setSuccessMessage('Product duplicated successfully!');
      await loadProducts();
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      original_price: product.original_price?.toString() || '',
      description: product.description || '',
      image: product.image || '',
      images: product.images || [],
      category_id: product.category_id || '',
      is_new: product.is_new,
      is_best_seller: product.is_best_seller,
      is_on_sale: product.is_on_sale,
      enabled: product.enabled,
      section: product.section || '',
      has_sizes: product.has_sizes || false,
      sizes: product.sizes || [],
      rating: product.rating || 0
    });
    setImagePreview(product.image || null);
    setImageGallery(product.images || []);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      original_price: '',
      description: '',
      image: '',
      images: [],
      category_id: '',
      is_new: false,
      is_best_seller: false,
      is_on_sale: false,
      enabled: true,
      section: '',
      has_sizes: false,
      sizes: [],
      rating: 0
    });
    setImagePreview(null);
    setImageGallery([]);
    setErrors({});
    setSizeInput('');
  };

  const addImageToGallery = () => {
    if (formData.image && !formData.images.includes(formData.image)) {
      const newImages = [...formData.images, formData.image];
      setFormData({ ...formData, images: newImages });
      setImageGallery(newImages);
    }
  };

  const removeImageFromGallery = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
    setImageGallery(newImages);
  };

  const addSize = () => {
    if (sizeInput.trim() && !formData.sizes.includes(sizeInput.trim().toUpperCase())) {
      const newSizes = [...formData.sizes, sizeInput.trim().toUpperCase()];
      setFormData({ ...formData, sizes: newSizes });
      setSizeInput('');
    }
  };

  const removeSize = (size: string) => {
    const newSizes = formData.sizes.filter(s => s !== size);
    setFormData({ ...formData, sizes: newSizes });
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return 'Uncategorized';
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    const matchesSection = selectedSection === 'all' || product.section === selectedSection;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'enabled' && product.enabled) ||
      (statusFilter === 'disabled' && !product.enabled);
    
    return matchesSearch && matchesCategory && matchesSection && matchesStatus;
  });

  const sectionOptions = [
    { value: 'all', label: 'All Sections' },
    { value: 'bestSellers', label: 'Best Sellers' },
    { value: 'newArrivals', label: 'New Arrivals' },
    { value: 'featured', label: 'Featured' }
  ];

  return (
    <div className="p-6">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-slide-down">
          <Check className="w-4 h-4" />
          {successMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your product catalog</p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
            {(selectedCategory !== 'all' || selectedSection !== 'all' || statusFilter !== 'all') && (
              <span className="w-2 h-2 bg-purple-600 rounded-full" />
            )}
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              {/* Section Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {sectionOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Status</option>
                  <option value="enabled">Enabled</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
            </div>

            {/* Clear Filters Button */}
            {(selectedCategory !== 'all' || selectedSection !== 'all' || statusFilter !== 'all' || searchTerm) && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedSection('all');
                    setStatusFilter('all');
                    setSearchTerm('');
                  }}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                >
                  <X className="w-3 h-3" />
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats Bar */}
      <div className="mb-4 flex justify-between items-center text-sm text-gray-500">
        <span>Showing {filteredProducts.length} of {products.length} products</span>
        {filteredProducts.length !== products.length && (
          <span className="text-purple-600">Filtered</span>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Badges</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-12 h-12 text-gray-300" />
                      <p>No products found</p>
                      {(searchTerm || selectedCategory !== 'all' || selectedSection !== 'all' || statusFilter !== 'all') && (
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setSelectedCategory('all');
                            setSelectedSection('all');
                            setStatusFilter('all');
                          }}
                          className="text-purple-600 hover:underline text-sm"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <img 
                        src={product.image || 'https://via.placeholder.com/50x50?text=No+Image'} 
                        alt={product.name} 
                        className="w-12 h-12 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/50x50?text=No+Image';
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-500">{product.id.slice(0, 8)}...</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{getCategoryName(product.category_id)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">${product.price.toFixed(2)}</div>
                      {product.original_price && (
                        <div className="text-xs text-gray-400 line-through">${product.original_price.toFixed(2)}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${product.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {product.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {product.is_new && (
                          <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">New</span>
                        )}
                        {product.is_best_seller && (
                          <span className="px-1.5 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">Bestseller</span>
                        )}
                        {product.is_on_sale && (
                          <span className="px-1.5 py-0.5 text-xs bg-red-100 text-red-800 rounded">Sale</span>
                        )}
                        {product.section && (
                          <span className="px-1.5 py-0.5 text-xs bg-purple-100 text-purple-800 rounded">
                            {product.section === 'bestSellers' ? 'Best Sellers' : 
                             product.section === 'newArrivals' ? 'New Arrivals' : 'Featured'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(product)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              {/* Error Summary */}
              {errors.submit && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{errors.submit}</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Luxury Silk Scarf"
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          errors.price ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="0.00"
                      />
                      {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Original Price</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.original_price}
                        onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.category_id ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select a category...</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                    {errors.category_id && <p className="text-xs text-red-500 mt-1">{errors.category_id}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                    <select
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">None</option>
                      <option value="bestSellers">Best Sellers</option>
                      <option value="newArrivals">New Arrivals</option>
                      <option value="featured">Featured</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="0 - 5"
                    />
                  </div>
                </div>

                {/* Right Column - Images & Details */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Main Image URL <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={formData.image}
                        onChange={(e) => {
                          setFormData({ ...formData, image: e.target.value });
                          setImagePreview(e.target.value);
                        }}
                        className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          errors.image ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="https://example.com/image.jpg"
                      />
                      <button
                        type="button"
                        onClick={addImageToGallery}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Add to gallery"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    {errors.image && <p className="text-xs text-red-500 mt-1">{errors.image}</p>}
                    
                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="mt-2">
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image Gallery</label>
                    <div className="flex flex-wrap gap-2">
                      {formData.images.map((img, index) => (
                        <div key={index} className="relative group">
                          <img src={img} alt={`Gallery ${index + 1}`} className="w-16 h-16 object-cover rounded border border-gray-200" />
                          <button
                            type="button"
                            onClick={() => removeImageFromGallery(index)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {formData.images.length === 0 && (
                        <p className="text-sm text-gray-400">No gallery images added</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Product description..."
                    />
                  </div>

                  {/* Sizes Section */}
                  <div>
                    <label className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={formData.has_sizes}
                        onChange={(e) => setFormData({ ...formData, has_sizes: e.target.checked, sizes: e.target.checked ? formData.sizes : [] })}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Product has sizes/variants</span>
                    </label>
                    
                    {formData.has_sizes && (
                      <div className="mt-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={sizeInput}
                            onChange={(e) => setSizeInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Add size (e.g., S, M, L, XL)"
                          />
                          <button
                            type="button"
                            onClick={addSize}
                            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                          >
                            Add
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.sizes.map(size => (
                            <span key={size} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-1">
                              {size}
                              <button
                                type="button"
                                onClick={() => removeSize(size)}
                                className="hover:text-red-500"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Badges Section */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Product Badges</h3>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_new}
                      onChange={(e) => setFormData({ ...formData, is_new: e.target.checked })}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm">New Arrival</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_best_seller}
                      onChange={(e) => setFormData({ ...formData, is_best_seller: e.target.checked })}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm">Best Seller</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_on_sale}
                      onChange={(e) => setFormData({ ...formData, is_on_sale: e.target.checked })}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm">On Sale</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.enabled}
                      onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm">Enabled (Visible in store)</span>
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};