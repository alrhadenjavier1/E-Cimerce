// src/pages/admin/AdminSocialLinks.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Plus, Trash2, GripVertical, Instagram, Facebook, Twitter, Youtube, Linkedin, Pinterest, Globe, CheckCircle, AlertCircle } from 'lucide-react';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  enabled: boolean;
  sort_order: number;
}

const platformIcons: Record<string, any> = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  youtube: Youtube,
  linkedin: Linkedin,
  pinterest: Pinterest,
  website: Globe,
};

export const AdminSocialLinks = () => {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('social_links')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (!error && data) {
        setLinks(data);
      }
    } catch (error) {
      console.error('Failed to load social links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      // Update each link
      for (const link of links) {
        const { error } = await supabase
          .from('social_links')
          .update({
            url: link.url,
            enabled: link.enabled,
            sort_order: link.sort_order,
          })
          .eq('id', link.id);
        
        if (error) throw error;
      }
      
      setMessage({ type: 'success', text: 'Social links saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save:', error);
      setMessage({ type: 'error', text: 'Failed to save social links' });
    } finally {
      setSaving(false);
    }
  };

  const updateLink = (id: string, updates: Partial<SocialLink>) => {
    setLinks(prev => prev.map(link => 
      link.id === id ? { ...link, ...updates } : link
    ));
  };

  const moveLink = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newLinks = [...links];
      [newLinks[index], newLinks[index - 1]] = [newLinks[index - 1], newLinks[index]];
      newLinks.forEach((link, i) => link.sort_order = i);
      setLinks(newLinks);
    } else if (direction === 'down' && index < links.length - 1) {
      const newLinks = [...links];
      [newLinks[index], newLinks[index + 1]] = [newLinks[index + 1], newLinks[index]];
      newLinks.forEach((link, i) => link.sort_order = i);
      setLinks(newLinks);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-theme-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Social Media Links</h1>
          <p className="text-gray-500 mt-1">Manage your social media presence</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-theme-primary text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-gray-900">Social Platforms</h2>
          <p className="text-sm text-gray-500">Drag to reorder or edit your social media links</p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {links.map((link, index) => {
            const IconComponent = platformIcons[link.platform.toLowerCase()] || Globe;
            
            return (
              <div key={link.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2 text-gray-400 cursor-move">
                  <GripVertical className="w-4 h-4" />
                </div>
                
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <IconComponent className="w-5 h-5 text-gray-600" />
                </div>
                
                <div className="flex-1">
                  <div className="font-medium text-gray-900 capitalize">{link.platform}</div>
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => updateLink(link.id, { url: e.target.value })}
                    className="w-full mt-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-theme-primary"
                    placeholder="https://..."
                  />
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateLink(link.id, { enabled: !link.enabled })}
                    className={`relative w-10 h-5 rounded-full transition-all duration-300 ${
                      link.enabled ? 'bg-theme-primary' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                      link.enabled ? 'right-0.5' : 'left-0.5'
                    }`} />
                  </button>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={() => moveLink(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveLink(index, 'down')}
                      disabled={index === links.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">📱 Tips for Social Media</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use consistent brand imagery across all platforms</li>
          <li>• Share user-generated content to build community</li>
          <li>• Post regularly to maintain engagement</li>
          <li>• Include links to your store in your social bios</li>
        </ul>
      </div>
    </div>
  );
};