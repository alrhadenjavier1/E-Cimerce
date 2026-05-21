// src/pages/admin/AdminCategories.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit, Trash2, Eye, X, MoveUp, MoveDown, Check, AlertCircle, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  sort_order: number;
  enabled: boolean;
  created_at: string;
}

export const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    image: '',
    description: '',
    sort_order: 0,
    enabled: true
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    }
    if (!formData.image.trim()) {
      newErrors.image = 'Category image URL is required';
    }
    
    // Check for duplicate slug (excluding current category when editing)
    const existingCategory = categories.find(c => 
      c.slug === formData.slug && c.id !== editingCategory?.id
    );
    if (existingCategory) {
      newErrors.slug = 'Slug already exists. Please use a unique slug.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const categoryData = {
      name: formData.name,
      slug: formData.slug,
      image: formData.image,
      description: formData.description || null,
      sort_order: formData.sort_order,
      enabled: formData.enabled
    };
    
    if (editingCategory) {
      const { error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', editingCategory.id);
      
      if (!error) {
        setSuccessMessage('Category updated successfully!');
        await loadCategories();
        setShowModal(false);
        setEditingCategory(null);
        resetForm();
      } else {
        setErrors({ submit: error.message });
      }
    } else {
      const { error } = await supabase
        .from('categories')
        .insert([categoryData]);
      
      if (!error) {
        setSuccessMessage('Category created successfully!');
        await loadCategories();
        setShowModal(false);
        resetForm();
      } else {
        setErrors({ submit: error.message });
      }
    }
  };

  const handleDelete = async (id: string) => {
    // Check if category has products
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id);
    
    if (countError) {
      console.error('Error checking products:', countError);
    }
    
    const productCount = count || 0;
    const warningMessage = productCount > 0
      ? `This category has ${productCount} product(s) associated with it. Deleting will set their category to uncategorized. Are you sure you want to continue?`
      : 'Are you sure you want to delete this category? This action cannot be undone.';
    
    if (confirm(warningMessage)) {
      // If category has products, set their category_id to null
      if (productCount > 0) {
        await supabase
          .from('products')
          .update({ category_id: null })
          .eq('category_id', id);
      }
      
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (!error) {
        setSuccessMessage('Category deleted successfully!');
        await loadCategories();
      } else {
        setErrors({ submit: error.message });
      }
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      image: category.image || '',
      description: category.description || '',
      sort_order: category.sort_order,
      enabled: category.enabled
    });
    setImagePreview(category.image);
    setShowModal(true);
  };

  const handleMoveOrder = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = categories.findIndex(c => c.id === id);
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === categories.length - 1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const updatedCategories = [...categories];
    [updatedCategories[currentIndex], updatedCategories[newIndex]] = [updatedCategories[newIndex], updatedCategories[currentIndex]];
    
    // Update sort_order in database
    for (let i = 0; i < updatedCategories.length; i++) {
      await supabase
        .from('categories')
        .update({ sort_order: i })
        .eq('id', updatedCategories[i].id);
    }
    
    await loadCategories();
    setSuccessMessage('Category order updated!');
  };

  const handleToggleEnabled = async (id: string, currentEnabled: boolean) => {
    const { error } = await supabase
      .from('categories')
      .update({ enabled: !currentEnabled })
      .eq('id', id);
    
    if (!error) {
      await loadCategories();
      setSuccessMessage(`Category ${!currentEnabled ? 'enabled' : 'disabled'} successfully!`);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      image: '',
      description: '',
      sort_order: categories.length,
      enabled: true
    });
    setImagePreview(null);
    setErrors({});
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name)
    });
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">Manage product categories for your store</p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null);
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Stats Bar */}
      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Total: <span className="font-medium text-gray-700">{categories.length}</span> categories
          <span className="mx-2">•</span>
          Active: <span className="font-medium text-green-600">{categories.filter(c => c.enabled).length}</span>
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <ImageIcon className="w-16 h-16 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900">No categories yet</h3>
            <p className="text-gray-500">Create categories to organize your products.</p>
            <button
              onClick={() => {
                setEditingCategory(null);
                resetForm();
                setShowModal(true);
              }}
              className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Create Your First Category
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className={`bg-white rounded-lg shadow overflow-hidden transition-all hover:shadow-lg ${
                !category.enabled ? 'opacity-60' : ''
              }`}
            >
              {/* Category Image */}
              <div className="relative h-40 bg-gray-100">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x160?text=No+Image';
                  }}
                />
                {/* Sort Order Badge */}
                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                  Order: {category.sort_order}
                </div>
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    category.enabled ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                  }`}>
                    {category.enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                <p className="text-xs text-gray-400 mb-2">/{category.slug}</p>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                  {category.description || 'No description'}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleMoveOrder(category.id, 'up')}
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
                      onClick={() => handleMoveOrder(category.id, 'down')}
                      disabled={index === categories.length - 1}
                      className={`p-1.5 rounded transition-colors ${
                        index === categories.length - 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-100'
                      }`}
                      title="Move Down"
                    >
                      <MoveDown className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleEnabled(category.id, category.enabled)}
                      className={`p-1.5 rounded transition-colors ${
                        category.enabled
                          ? 'text-yellow-600 hover:bg-yellow-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={category.enabled ? 'Disable' : 'Enable'}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
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

      {/* Category Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Error Summary */}
              {errors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{errors.submit}</span>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Jewelry, Handbags, Watches"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.slug ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="jewelry"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">URL-friendly name. Auto-generated from category name.</p>
                {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug}</p>}
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => {
                    setFormData({ ...formData, image: e.target.value });
                    setImagePreview(e.target.value);
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.image ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="https://example.com/category-image.jpg"
                />
                {errors.image && <p className="text-xs text-red-500 mt-1">{errors.image}</p>}
                
                {/* Image Preview */}
                {imagePreview && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">Preview:</p>
                    <img
                      src={imagePreview}
                      alt="Category preview"
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x160?text=Invalid+URL';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Brief description of this category..."
                />
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
                    <span className="text-sm text-gray-700">Enable this category</span>
                  </label>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="text-sm font-medium text-blue-800 mb-1">💡 Tips</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Categories help organize products for easier browsing</li>
                  <li>• Use clear, descriptive names for categories</li>
                  <li>• Slugs are used in URLs (e.g., /products/jewelry)</li>
                  <li>• Disabled categories won't appear on the homepage</li>
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
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};