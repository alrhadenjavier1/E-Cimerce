// src/services/databaseService.ts
import { supabase } from '../lib/supabase';
import { storeConfig } from '../utils/storeConfig';
import type { Product, Category, FeaturedProduct, FeatureVideo, SocialLink, FooterLink, HeroContent } from '../utils/storeConfig';

const setCurrentUserId = (userId: string | null) => {
  if (userId) {
    // This sets a custom config variable that RLS policies can read
    return supabase.rpc('set_app_current_user_id', { user_id: userId });
  }
  return Promise.resolve();
};

export const databaseService = {
  // Categories
  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('enabled', true)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      if (data && data.length > 0) return data as Category[];
      return storeConfig.categories;
    } catch (error) {
      console.error('Failed to fetch categories, using fallback:', error);
      return storeConfig.categories;
    }
  },

  // Products
// src/services/databaseService.ts - Update getProducts method
async getProducts(section?: 'bestSellers' | 'newArrivals' | 'featured'): Promise<Product[]> {
  try {
    let query = supabase
      .from('products')
      .select('*')
      .eq('enabled', true);
    
    if (section) {
      query = query.eq('section', section);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    if (data && data.length > 0) {
      return data.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        originalPrice: item.original_price,
        rating: item.rating,
        image: item.image,
        images: item.images || [],
        description: item.description,
        isNew: item.is_new,
        isBestSeller: item.is_best_seller,
        isOnSale: item.is_on_sale,
        enabled: item.enabled,
        category_id: item.category_id, // Add this
      })) as Product[];
    }
    
    if (section === 'bestSellers') return storeConfig.bestSellers;
    if (section === 'newArrivals') return storeConfig.newArrivals;
    return [];
  } catch (error) {
    console.error('Failed to fetch products, using fallback:', error);
    if (section === 'bestSellers') return storeConfig.bestSellers;
    if (section === 'newArrivals') return storeConfig.newArrivals;
    return [];
  }
},

  // Hero Content
  async getHeroContent(): Promise<HeroContent> {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('hero_content')
        .limit(1)
        .single();
      
      if (error) throw error;
      if (data?.hero_content) return data.hero_content as HeroContent;
      return storeConfig.heroContent;
    } catch (error) {
      console.error('Failed to fetch hero content, using fallback:', error);
      return storeConfig.heroContent;
    }
  },

  // src/services/databaseService.ts - Add these methods

  // Get all products with filtering
  async getProductsWithFilters(options?: {
    category?: string;
    search?: string;
    sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'rating';
    page?: number;
    limit?: number;
  }): Promise<{ products: Product[]; total: number }> {
    try {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('enabled', true);

      if (options?.category && options.category !== 'all') {
        query = query.eq('category_id', options.category);
      }

      if (options?.search) {
        query = query.ilike('name', `%${options.search}%`);
      }

      if (options?.sortBy) {
        switch (options.sortBy) {
          case 'price_asc':
            query = query.order('price', { ascending: true });
            break;
          case 'price_desc':
            query = query.order('price', { ascending: false });
            break;
          case 'newest':
            query = query.order('created_at', { ascending: false });
            break;
          case 'rating':
            query = query.order('rating', { ascending: false });
            break;
          default:
            query = query.order('created_at', { ascending: false });
        }
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const page = options?.page || 1;
      const limit = options?.limit || 12;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      const products: Product[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        originalPrice: item.original_price,
        rating: item.rating || 4.5,
        image: item.image,
        images: item.images || [],
        description: item.description,
        isNew: item.is_new,
        isBestSeller: item.is_best_seller,
        isOnSale: item.is_on_sale,
        enabled: item.enabled,
      }));

      return { products, total: count || 0 };
    } catch (error) {
      console.error('Failed to fetch products:', error);
      return { products: [], total: 0 };
    }
  },

  // Get single product by ID
  async getProductById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!data) return null;

      return {
        id: data.id,
        name: data.name,
        price: data.price,
        originalPrice: data.original_price,
        rating: data.rating || 4.5,
        image: data.image,
        images: data.images || [],
        description: data.description,
        isNew: data.is_new,
        isBestSeller: data.is_best_seller,
        isOnSale: data.is_on_sale,
        enabled: data.enabled,
      };
    } catch (error) {
      console.error('Failed to fetch product:', error);
      return null;
    }
  },

  // Get products by category
  async getProductsByCategory(categoryId: string, limit: number = 4): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryId)
        .eq('enabled', true)
        .limit(limit);

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        originalPrice: item.original_price,
        rating: item.rating || 4.5,
        image: item.image,
        images: item.images || [],
        description: item.description,
        isNew: item.is_new,
        isBestSeller: item.is_best_seller,
        isOnSale: item.is_on_sale,
        enabled: item.enabled,
      }));
    } catch (error) {
      console.error('Failed to fetch products by category:', error);
      return [];
    }
  },

  // Store Settings
  async getStoreSettings(): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (error) throw error;
      if (data) return data;
      return { company_name: storeConfig.companyName };
    } catch (error) {
      console.error('Failed to fetch store settings, using fallback:', error);
      return { company_name: storeConfig.companyName };
    }
  },

  

  // Footer Links
  async getFooterLinks(): Promise<FooterLink[]> {
    try {
      const { data, error } = await supabase
        .from('footer_links')
        .select(`
          *,
          items:footer_link_items(*)
        `)
        .eq('enabled', true)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      if (data && data.length > 0) {
        return data.map(link => ({
          title: link.title,
          enabled: link.enabled,
          links: link.items
            .filter((item: any) => item.enabled)
            .sort((a: any, b: any) => a.sort_order - b.sort_order)
            .map((item: any) => ({
              label: item.label,
              href: item.href,
              enabled: item.enabled,
            }))
        })) as FooterLink[];
      }
      return storeConfig.footerLinks;
    } catch (error) {
      console.error('Failed to fetch footer links, using fallback:', error);
      return storeConfig.footerLinks;
    }
  },

  // Social Links
  async getSocialLinks(): Promise<SocialLink[]> {
    try {
      const { data, error } = await supabase
        .from('social_links')
        .select('*')
        .eq('enabled', true)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      if (data && data.length > 0) return data as SocialLink[];
      return storeConfig.socialLinks;
    } catch (error) {
      console.error('Failed to fetch social links, using fallback:', error);
      return storeConfig.socialLinks;
    }
  },

  // Featured Products (with videos)
  async getFeaturedProducts(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('featured_products')
        .select(`
          *,
          product:products(*)
        `)
        .eq('enabled', true)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      if (data && data.length > 0) {
        return data.map(item => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          originalPrice: item.product.original_price,
          rating: item.product.rating,
          image: item.product.image,
          description: item.product.description,
          isNew: item.product.is_new,
          isBestSeller: item.product.is_best_seller,
          isOnSale: item.product.is_on_sale,
          enabled: item.product.enabled,
          videoUrl: item.video_url,
          videoThumbnail: item.video_thumbnail,
          videoTitle: item.video_title,
          videoDescription: item.video_description,
        }));
      }
      return storeConfig.featuredProducts;
    } catch (error) {
      console.error('Failed to fetch featured products, using fallback:', error);
      return storeConfig.featuredProducts;
    }
  },

  // Feature Videos
  async getFeatureVideos(): Promise<FeatureVideo[]> {
    try {
      const { data, error } = await supabase
        .from('feature_videos')
        .select('*')
        .eq('enabled', true)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      if (data && data.length > 0) return data as FeatureVideo[];
      return storeConfig.featureVideos;
    } catch (error) {
      console.error('Failed to fetch feature videos, using fallback:', error);
      return storeConfig.featureVideos;
    }

    
  },
// ========================================
  // CART METHODS
  // ========================================
  
    async getCartItems(userId: string) {
    try {
        // Set the user ID for RLS
        await setCurrentUserId(userId);
        
        const { data, error } = await supabase
        .from('cart_items')
        .select(`
            *,
            product:products(*)
        `)
        .eq('user_id', userId);
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Failed to fetch cart items:', error);
        return [];
    }
    },

  async addToCart(userId: string, productId: string, quantity: number = 1, size?: string, color?: string) {
    try {
      // Check if item already exists
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .eq('size', size || null)
        .eq('color', color || null)
        .single();

      if (existing) {
        // Update quantity
        const { data, error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id)
          .select()
          .single();
        
        if (error) throw error;
        return { data, error: null };
      } else {
        // Insert new item
        const { data, error } = await supabase
          .from('cart_items')
          .insert({
            user_id: userId,
            product_id: productId,
            quantity,
            size,
            color
          })
          .select()
          .single();
        
        if (error) throw error;
        return { data, error: null };
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      return { data: null, error };
    }
  },

  async updateCartItemQuantity(cartItemId: string, quantity: number) {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', cartItemId)
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Failed to update cart item:', error);
      return { data: null, error };
    }
  },

  async removeFromCart(cartItemId: string) {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);
      
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      return { error };
    }
  },

  async clearCart(userId: string) {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId);
      
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Failed to clear cart:', error);
      return { error };
    }
  },

  // ========================================
  // WISHLIST METHODS
  // ========================================
  
  async getWishlistItems(userId: string) {
    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', userId);
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      return [];
    }
  },

  async addToWishlist(userId: string, productId: string) {
    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .insert({ user_id: userId, product_id: productId })
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      return { data: null, error };
    }
  },

  async removeFromWishlist(userId: string, productId: string) {
    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);
      
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      return { error };
    }
  },

  async isInWishlist(userId: string, productId: string) {
    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Failed to check wishlist:', error);
      return false;
    }
  },

  // ========================================
  // ORDER METHODS
  // ========================================
  
  async createOrder(userId: string, orderData: any, cartItems: any[]) {
    try {
      // Start a transaction
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          subtotal: orderData.subtotal,
          shipping_cost: orderData.shipping_cost,
          tax: orderData.tax,
          total: orderData.total,
          shipping_first_name: orderData.firstName,
          shipping_last_name: orderData.lastName,
          shipping_email: orderData.email,
          shipping_address: orderData.address,
          shipping_city: orderData.city,
          shipping_postal_code: orderData.postalCode,
          payment_method: orderData.paymentMethod,
          status: 'pending',
          payment_status: 'pending'
        })
        .select()
        .single();
      
      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product.name,
        product_image: item.product.image,
        quantity: item.quantity,
        price: item.product.price,
        original_price: item.product.original_price,
        size: item.size,
        color: item.color
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) throw itemsError;

      // Clear the cart
      await this.clearCart(userId);

      return { order, error: null };
    } catch (error) {
      console.error('Failed to create order:', error);
      return { order: null, error };
    }
  },

  async getUserOrders(userId: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      return [];
    }
  },

  async getOrderDetails(orderId: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('id', orderId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      return null;
    }
  },  
  
};