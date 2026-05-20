// src/pages/admin/AdminFeaturedProducts.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit, Trash2, Eye, X, Play, MoveUp, MoveDown, Check, AlertCircle, Link as LinkIcon } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  enabled: boolean;
}

interface FeaturedProduct {
  id: string;
  product_id: string;
  video_url: string;
  video_thumbnail: string;
  video_title: string;
  video_description: string;
  sort_order: number;
  enabled: boolean;
  created_at: string;
  product?: Product;
}

export const AdminFeaturedProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<FeaturedProduct | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    product_id: '',
    video_url: '',
    video_thumbnail: '',
    video_title: '',
    video_description: '',
    enabled: true,
    sort_order: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load featured products with product details
      const { data: featuredData, error: featuredError } = await supabase
        .from('featured_products')
        .select(`
          *,
          product:products(*)
        `)
        .order('sort_order', { ascending: true });
      
      if (featuredError) throw featuredError;
      
      // Load all available products (only enabled ones)
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name, price, image, enabled')
        .eq('enabled', true)
        .order('name');
      
      if (productsError) throw productsError;
      
      setFeaturedProducts(featuredData || []);
      setAllProducts(productsData || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.product_id) {
      newErrors.product_id = 'Please select a product';
    }
    if (!formData.video_url.trim()) {
      newErrors.video_url = 'Video URL is required';
    }
    if (!formData.video_thumbnail.trim()) {
      newErrors.video_thumbnail = 'Thumbnail image URL is required';
    }
    if (!formData.video_title.trim()) {
      newErrors.video_title = 'Video title is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const featuredData = {
      product_id: formData.product_id,
      video_url: formData.video_url,
      video_thumbnail: formData.video_thumbnail,
      video_title: formData.video_title,
      video_description: formData.video_description || null,
      enabled: formData.enabled,
      sort_order: formData.sort_order
    };
    
    if (editingItem) {
      const { error } = await supabase
        .from('featured_products')
        .update(featuredData)
        .eq('id', editingItem.id);
      
      if (!error) {
        setSuccessMessage('Featured product updated successfully!');
        await loadData();
        setShowModal(false);
        setEditingItem(null);
        resetForm();
      } else {
        setErrors({ submit: error.message });
      }
    } else {
      const { error } = await supabase
        .from('featured_products')
        .insert([featuredData]);
      
      if (!error) {
        setSuccessMessage('Featured product added successfully!');
        await loadData();
        setShowModal(false);
        resetForm();
      } else {
        setErrors({ submit: error.message });
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this product from featured collection? This action cannot be undone.')) {
      const { error } = await supabase
        .from('featured_products')
        .delete()
        .eq('id', id);
      
      if (!error) {
        setSuccessMessage('Featured product removed successfully!');
        await loadData();
      } else {
        setErrors({ submit: error.message });
      }
    }
  };

  const handleEdit = (item: FeaturedProduct) => {
    setEditingItem(item);
    setFormData({
      product_id: item.product_id,
      video_url: item.video_url,
      video_thumbnail: item.video_thumbnail,
      video_title: item.video_title,
      video_description: item.video_description || '',
      enabled: item.enabled,
      sort_order: item.sort_order
    });
    setVideoPreview(item.video_url);
    setSelectedProduct(item.product || null);
    setShowModal(true);
  };

  const handleMoveOrder = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = featuredProducts.findIndex(v => v.id === id);
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === featuredProducts.length - 1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const updatedItems = [...featuredProducts];
    [updatedItems[currentIndex], updatedItems[newIndex]] = [updatedItems[newIndex], updatedItems[currentIndex]];
    
    // Update sort_order in database
    for (let i = 0; i < updatedItems.length; i++) {
      await supabase
        .from('featured_products')
        .update({ sort_order: i })
        .eq('id', updatedItems[i].id);
    }
    
    await loadData();
    setSuccessMessage('Order updated successfully!');
  };

  const handleToggleEnabled = async (id: string, currentEnabled: boolean) => {
    const { error } = await supabase
      .from('featured_products')
      .update({ enabled: !currentEnabled })
      .eq('id', id);
    
    if (!error) {
      await loadData();
      setSuccessMessage(`Featured product ${!currentEnabled ? 'enabled' : 'disabled'} successfully!`);
    }
  };

  const handleProductSelect = (productId: string) => {
    const product = allProducts.find(p => p.id === productId);
    setSelectedProduct(product || null);
    setFormData({ ...formData, product_id: productId });
    
    // Auto-fill video title with product name
    if (product && !formData.video_title) {
      setFormData(prev => ({ ...prev, video_title: product.name }));
    }
  };

  const resetForm = () => {
    setFormData({
      product_id: '',
      video_url: '',
      video_thumbnail: '',
      video_title: '',
      video_description: '',
      enabled: true,
      sort_order: featuredProducts.length
    });
    setVideoPreview(null);
    setSelectedProduct(null);
    setErrors({});
  };

  const extractYouTubeID = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getEmbedUrl = (url: string) => {
    const youtubeId = extractYouTubeID(url);
    if (youtubeId) {
      return `https://www.youtube.com/embed/${youtubeId}`;
    }
    return url;
  };

  // Check if a product is already featured (for dropdown filtering)
  const isProductFeatured = (productId: string) => {
    if (editingItem) {
      // Allow current product to stay selected
      return featuredProducts.some(fp => fp.product_id === productId && fp.id !== editingItem.id);
    }
    return featuredProducts.some(fp => fp.product_id === productId);
  };

  // Available products (not already featured)
  const availableProducts = allProducts.filter(p => !isProductFeatured(p.id));

  return (
    <div className="p-6 admin-products">
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
          <h1 className="text-2xl font-bold text-gray-900">Featured Products (Cinematic Collection)</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage products that appear in the video carousel section on the homepage
          </p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Featured Product
        </button>
      </div>

      {/* Stats Bar */}
      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Total: <span className="font-medium text-gray-700">{featuredProducts.length}</span> featured products
          <span className="mx-2">•</span>
          Active: <span className="font-medium text-green-600">{featuredProducts.filter(v => v.enabled).length}</span>
        </div>
      </div>

      {/* Featured Products Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : featuredProducts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <Play className="w-16 h-16 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900">No featured products yet</h3>
            <p className="text-gray-500">Add products with videos to display in the cinematic carousel section.</p>
            <button
              onClick={() => {
                setEditingItem(null);
                resetForm();
                setShowModal(true);
              }}
              className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Add Your First Featured Product
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {featuredProducts.map((item, index) => (
            <div
              key={item.id}
              className={`bg-white rounded-lg shadow overflow-hidden transition-all hover:shadow-lg ${
                !item.enabled ? 'opacity-60' : ''
              }`}
            >
              <div className="flex flex-col md:flex-row">
                {/* Product Image */}
                <div className="md:w-1/3">
                  <img
                    src={item.product?.image || 'https://via.placeholder.com/200x200?text=No+Image'}
                    alt={item.product?.name}
                    className="w-full h-48 md:h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x200?text=No+Image';
                    }}
                  />
                </div>
                
                {/* Content */}
                <div className="flex-1 p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.product?.name}</h3>
                      <p className="text-sm text-gray-500">${item.product?.price?.toFixed(2)}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleMoveOrder(item.id, 'up')}
                        disabled={index === 0}
                        className={`p-1.5 rounded transition-colors ${
                          index === 0
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-100'
                        }`}
                        title="Move Up"
                      >
                        <MoveUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveOrder(item.id, 'down')}
                        disabled={index === featuredProducts.length - 1}
                        className={`p-1.5 rounded transition-colors ${
                          index === featuredProducts.length - 1
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-100'
                        }`}
                        title="Move Down"
                      >
                        <MoveDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Video Info */}
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700">Video:</p>
                    <p className="text-sm text-gray-600 line-clamp-1">{item.video_title}</p>
                    <p className="text-xs text-gray-400 truncate">{item.video_url}</p>
                  </div>
                  
                  {/* Description */}
                  {item.video_description && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{item.video_description}</p>
                  )}
                  
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {item.enabled ? 'Active' : 'Disabled'}
                    </span>
                    <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                      Order: {item.sort_order}
                    </span>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleToggleEnabled(item.id, item.enabled)}
                      className={`p-1.5 rounded transition-colors ${
                        item.enabled
                          ? 'text-yellow-600 hover:bg-yellow-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={item.enabled ? 'Disable' : 'Enable'}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingItem ? 'Edit Featured Product' : 'Add Featured Product'}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Error Summary */}
              {errors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{errors.submit}</span>
                </div>
              )}

              {/* Product Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Product <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.product_id}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.product_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a product...</option>
                  {editingItem ? (
                    // When editing, show all products including the current one
                    allProducts.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} - ${product.price.toFixed(2)}
                      </option>
                    ))
                  ) : (
                    // When adding new, only show available products
                    availableProducts.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} - ${product.price.toFixed(2)}
                      </option>
                    ))
                  )}
                </select>
                {errors.product_id && <p className="text-xs text-red-500 mt-1">{errors.product_id}</p>}
                {!editingItem && availableProducts.length === 0 && (
                  <p className="text-xs text-yellow-600 mt-1">
                    All products are already featured. Edit existing ones or add more products first.
                  </p>
                )}
              </div>

              {/* Selected Product Preview */}
              {selectedProduct && (
                <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                  <img
                    src={selectedProduct.image || 'https://via.placeholder.com/50x50?text=No+Image'}
                    alt={selectedProduct.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{selectedProduct.name}</p>
                    <p className="text-sm text-gray-500">${selectedProduct.price.toFixed(2)}</p>
                  </div>
                </div>
              )}

              {/* Video Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.video_title}
                  onChange={(e) => setFormData({ ...formData, video_title: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.video_title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., The Art of Craftsmanship"
                />
                {errors.video_title && <p className="text-xs text-red-500 mt-1">{errors.video_title}</p>}
              </div>

              {/* Video Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Video Description</label>
                <textarea
                  value={formData.video_description}
                  onChange={(e) => setFormData({ ...formData, video_description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Brief description of the video content..."
                />
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => {
                    setFormData({ ...formData, video_url: e.target.value });
                    setVideoPreview(e.target.value);
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.video_url ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="https://youtube.com/watch?v=... or https://example.com/video.mp4"
                />
                {errors.video_url && <p className="text-xs text-red-500 mt-1">{errors.video_url}</p>}
                
                {/* Video Preview */}
                {videoPreview && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">Preview:</p>
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      {extractYouTubeID(videoPreview) ? (
                        <iframe
                          src={getEmbedUrl(videoPreview)}
                          className="w-full h-full"
                          title="Video Preview"
                        />
                      ) : (
                        <video
                          src={videoPreview}
                          className="w-full h-full object-cover"
                          controls
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Thumbnail URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thumbnail URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={formData.video_thumbnail}
                  onChange={(e) => setFormData({ ...formData, video_thumbnail: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.video_thumbnail ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="https://example.com/thumbnail.jpg"
                />
                {errors.video_thumbnail && <p className="text-xs text-red-500 mt-1">{errors.video_thumbnail}</p>}
                
                {/* Thumbnail Preview */}
                {formData.video_thumbnail && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">Thumbnail Preview:</p>
                    <img
                      src={formData.video_thumbnail}
                      alt="Thumbnail preview"
                      className="w-32 h-20 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128x80?text=Invalid+URL';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Sort Order and Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="0"
                  />
                  <p className="text-xs text-gray-400 mt-1">Lower numbers appear first</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <label className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      checked={formData.enabled}
                      onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Enable this featured product</span>
                  </label>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Tips</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Featured products appear in the "Cinematic Collection" carousel on the homepage</li>
                  <li>• YouTube URLs will be automatically embedded</li>
                  <li>• For best results, use 16:9 aspect ratio images (e.g., 1920x1080)</li>
                  <li>• Items are displayed in order of sort_order (lowest first)</li>
                  <li>• Each product can only be featured once</li>
                </ul>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  disabled={!editingItem && availableProducts.length === 0}
                >
                  {editingItem ? 'Update' : 'Add Featured Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};