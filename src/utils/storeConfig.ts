// src/utils/storeConfig.ts

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description?: string;
  enabled: boolean;
}

// src/utils/storeConfig.ts - Update Product interface
// src/utils/storeConfig.ts - Update Product interface
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  image: string;
  images?: string[];
  isNew?: boolean;
  isBestSeller?: boolean;
  isOnSale?: boolean;
  description?: string;
  enabled: boolean;
  category_id?: string;
  has_sizes?: boolean; // Add this - indicates if product has size variants
  sizes?: string[];    // Add this - available sizes for this product
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    background: string;
    backgroundSecondary: string;
    surface: string;
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    textLight: string;
    border: string;
    success: string;
    error: string;
    warning: string;
  };
}

export interface FeaturedProduct extends Product {
  videoUrl: string;
  videoThumbnail: string;
  videoTitle: string;
  videoDescription: string;
}

export interface FeatureVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  enabled: boolean;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
  enabled: boolean;
}

export interface FooterLink {
  title: string;
  links: { label: string; href: string; enabled: boolean }[];
  enabled: boolean;
}

export interface HeroContent {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  backgroundImage: string;
  enabled: boolean;
}

export const themePresets: Theme[] = [
  {
    id: 'pearl',
    name: 'Pearl Elegance',
    description: 'Warm, sophisticated neutrals with lavender accents',
    colors: {
      background: '#E9E3DE',
      backgroundSecondary: '#F5F1ED',
      surface: '#FFFFFF',
      primary: '#AF9AC9',
      secondary: '#E3C49B',
      accent: '#C4A4D4',
      text: '#666161',
      textLight: '#9B9595',
      border: '#D4CEC8',
      success: '#4CAF50',
      error: '#f44336',
      warning: '#FF9800',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight Luxury',
    description: 'Deep navy, gold accents, sophisticated dark theme',
    colors: {
      background: '#1A1A2E',
      backgroundSecondary: '#16213E',
      surface: '#0F3460',
      primary: '#E94560',
      secondary: '#FFD700',
      accent: '#C4A4D4',
      text: '#FFFFFF',
      textLight: '#B8B8B8',
      border: '#2A3A5C',
      success: '#00C853',
      error: '#FF5252',
      warning: '#FFC107',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset Glow',
    description: 'Warm oranges, terracotta, and cream tones',
    colors: {
      background: '#FFF5F0',
      backgroundSecondary: '#FFE8E0',
      surface: '#FFFFFF',
      primary: '#E86A5F',
      secondary: '#F4A261',
      accent: '#E9C46A',
      text: '#4A3525',
      textLight: '#8B7355',
      border: '#FFD4C4',
      success: '#2E7D32',
      error: '#D32F2F',
      warning: '#ED6C02',
    },
  },
  {
    id: 'forest',
    name: 'Forest Calm',
    description: 'Earthy greens, natural, peaceful ambiance',
    colors: {
      background: '#F0F4ED',
      backgroundSecondary: '#E8EFE4',
      surface: '#FFFFFF',
      primary: '#5E8B7E',
      secondary: '#D4A373',
      accent: '#B8C4A8',
      text: '#3A4D41',
      textLight: '#7A8C7E',
      border: '#D4DFCC',
      success: '#388E3C',
      error: '#E53935',
      warning: '#F57C00',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean Breeze',
    description: 'Cool blues, serene, fresh and clean',
    colors: {
      background: '#E8F4F8',
      backgroundSecondary: '#DCF2F9',
      surface: '#FFFFFF',
      primary: '#4A90E2',
      secondary: '#7BDFF2',
      accent: '#B2EBF2',
      text: '#2C3E50',
      textLight: '#6C86A3',
      border: '#C5E0EB',
      success: '#00ACC1',
      error: '#EF5350',
      warning: '#FFA726',
    },
  },
  {
    id: 'royal',
    name: 'Royal Purple',
    description: 'Rich purples, gold, majestic and bold',
    colors: {
      background: '#F8F4FC',
      backgroundSecondary: '#F0E8F8',
      surface: '#FFFFFF',
      primary: '#7B2D8E',
      secondary: '#FFD700',
      accent: '#9B59B6',
      text: '#2C1A3A',
      textLight: '#6B4C7A',
      border: '#E0CCF0',
      success: '#27AE60',
      error: '#E74C3C',
      warning: '#F39C12',
    },
  },
];

export interface StoreConfig {
  // Basic Info
  companyName: string;
  companyLogo?: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  description: string;
  
  // Sections Visibility
  sections: {
    hero: boolean;
    videoCarousel: boolean;
    categories: boolean;
    bestSellers: boolean;
    bestSellers3D: boolean;
    newArrivals: boolean;
    footer: boolean;
  };

    theme: {
    defaultMode: 'light' | 'dark' | 'system';
    allowUserToggle: boolean;
    preset: string; // 'pearl', 'midnight', 'sunset', 'forest', 'ocean', 'royal'
    customColors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
      background?: string;
      text?: string;
    };
  };
  // Available Presets
  themePresets: Theme[];
  
  // Content Sections
  heroContent: HeroContent;
  featureVideos: FeatureVideo[];
  categories: Category[];
  bestSellers: Product[];
  newArrivals: Product[];
  featuredProducts: FeaturedProduct[];
  
  // Footer
  footerLinks: FooterLink[];
  socialLinks: SocialLink[];
  
  // UI Settings
  ui: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    textColor: string;
    headerAutoHide: boolean;
    carouselAutoplaySpeed: number;
    productsPerRow: {
      mobile: number;
      tablet: number;
      desktop: number;
    };
  };

  // SEO & Browser Settings
  seo: {
    title: string;           // Browser tab title
    description: string;     // Meta description for SEO
    favicon: string;         // Favicon URL or path
    ogImage: string;         // Open Graph image for social sharing
    keywords: string[];      // SEO keywords
  };
  
  // Animation Settings
  animations: {
    enableHoverEffects: boolean;
    enableScrollAnimations: boolean;
    animationDuration: number;
    hoverScale: number;
  };
}

export const storeConfig: StoreConfig = {
  // Theme Settings
  theme: {
    defaultMode: 'light', // 'light', 'dark', or 'system'
    allowUserToggle: true,
    preset: 'pearl', // 'pearl', 'midnight', 'sunset', 'forest', 'ocean', 'royal'
    customColors: {
      // Uncomment to override preset colors
      // primary: '#FF6B6B',
      // secondary: '#4ECDC4',
      // accent: '#FFE66D',
    },
  },

  themePresets: themePresets,

  // Basic Info
  companyName: "Bowdeluxe",
  companyLogo: "",
  companyEmail: "hello@pearlco.com",
  companyPhone: "+1 (555) 123-4567",
  companyAddress: "123 Luxury Avenue, New York, NY 10001",
  description: "Discover timeless elegance with our curated collection of premium goods. Each piece tells a story of craftsmanship and sophistication.",

  
  seo: {
    title: "Pearl & Co. | Luxury E-commerce",
    description: "Discover timeless elegance with our curated collection of premium jewelry, handbags, watches, and accessories. Experience luxury redefined.",
    favicon: "https://cdn-icons-png.flaticon.com/512/1040/1040257.png", // Pearl icon
    ogImage: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&q=80",
    keywords: ["luxury", "e-commerce", "jewelry", "handbags", "watches", "fashion", "pearl", "elegance"],
  },
  
  // Animation Settings
  animations: {
    enableHoverEffects: true,
    enableScrollAnimations: true,
    animationDuration: 300,
    hoverScale: 1.05,
  },
  
  // Sections Visibility
  sections: {
    hero: true,
    videoCarousel: true,
    categories: true,
    bestSellers: true,
    bestSellers3D: true,
    newArrivals: true,
    footer: true,
  },

  // Hero Section Content
  heroContent: {
    title: "Elegance Redefined",
    subtitle: "Discover curated collections that blend timeless design with modern sophistication. Each piece tells a story of exceptional craftsmanship.",
    ctaText: "Explore Collection",
    ctaLink: "/products",
    secondaryCtaText: "Learn More",
    secondaryCtaLink: "/about",
    backgroundImage: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&q=80",
    enabled: true,
  },

  // Feature Videos (for the video carousel section)
  featureVideos: [
    {
      id: "1",
      title: "Behind the Craftsmanship",
      description: "Watch how our artisans create each piece with love and precision",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      thumbnail: "https://images.unsplash.com/photo-1536922246289-88c42f957773?w=1200&q=80",
      enabled: true,
    },
    {
      id: "2",
      title: "Pearl Collection Launch",
      description: "Introducing our latest pearl jewelry collection - timeless elegance reimagined",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      thumbnail: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1200&q=80",
      enabled: true,
    },
    {
      id: "3",
      title: "Spring/Summer Lookbook",
      description: "Get inspired by our seasonal styles and latest trends",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFunflies.mp4",
      thumbnail: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&q=80",
      enabled: true,
    },
  ],

  // Categories
  categories: [
    {
      id: "1",
      name: "Jewelry",
      slug: "jewelry",
      image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80",
      description: "Exquisite pieces for every occasion",
      enabled: true,
    },
    {
      id: "2",
      name: "Handbags",
      slug: "handbags",
      image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80",
      description: "Luxury meets functionality",
      enabled: true,
    },
    {
      id: "3",
      name: "Watches",
      slug: "watches",
      image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&q=80",
      description: "Timeless precision",
      enabled: true,
    },
    {
      id: "4",
      name: "Accessories",
      slug: "accessories",
      image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80",
      description: "Complete your look",
      enabled: true,
    },
  ],

  // Best Sellers (displayed in 3D carousel in hero section)
  bestSellers: [
    {
      id: "b1",
      name: "Pearl Drop Earrings",
      price: 299,
      originalPrice: 399,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80",
      description: "Elegant pearl drop earrings crafted with freshwater pearls and 14k gold.",
      isBestSeller: true,
      enabled: true,
    },
    {
      id: "b2",
      name: "Leather Tote Bag",
      price: 599,
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80",
      description: "Spacious genuine leather tote perfect for daily use.",
      isBestSeller: true,
      enabled: true,
    },
    {
      id: "b3",
      name: "Minimalist Watch",
      price: 449,
      originalPrice: 549,
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400&q=80",
      description: "Swiss movement watch with sapphire crystal.",
      isBestSeller: true,
      enabled: true,
    },
    {
      id: "b4",
      name: "Silk Scarf",
      price: 89,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&q=80",
      description: "Luxurious silk scarf handcrafted in Italy.",
      isBestSeller: true,
      enabled: true,
    },
  ],

  // New Arrivals (displayed in grid section)
  newArrivals: [
    {
      id: "n1",
      name: "Gold Chain Necklace",
      price: 349,
      rating: 5.0,
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80",
      description: "14k gold chain necklace with adjustable length.",
      isNew: true,
      enabled: true,
    },
    {
      id: "n2",
      name: "Canvas Weekend Bag",
      price: 279,
      originalPrice: 329,
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80",
      description: "Durable canvas bag perfect for weekend getaways.",
      isNew: true,
      enabled: true,
    },
    {
      id: "n3",
      name: "Aviator Sunglasses",
      price: 199,
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80",
      description: "Classic aviator style with UV protection.",
      isNew: true,
      enabled: true,
    },
    {
      id: "n4",
      name: "Leather Card Holder",
      price: 79,
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400&q=80",
      description: "Slim genuine leather card holder with RFID blocking.",
      isNew: true,
      enabled: true,
    },
  ],

  // Featured Products (each with its own video - displayed in cinematic section)
  featuredProducts: [
    {
      id: "fp1",
      name: "Luxury Pearl Necklace",
      price: 899,
      originalPrice: 1299,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80",
      description: "Handcrafted with genuine South Sea pearls and 18k gold clasp. Each pearl is carefully selected for its unique luster and shape.",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      videoThumbnail: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&q=80",
      videoTitle: "The Art of Pearl Making",
      videoDescription: "Watch master artisans carefully craft each pearl necklace with precision and care.",
      isBestSeller: true,
      enabled: true,
    },
    {
      id: "fp2",
      name: "Signature Leather Tote",
      price: 649,
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&q=80",
      description: "Italian full-grain leather tote bag with spacious interior and elegant design. Perfect for daily use or travel.",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      videoThumbnail: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200&q=80",
      videoTitle: "Craftsmanship Behind the Tote",
      videoDescription: "See how our artisans transform raw leather into a timeless accessory.",
      isNew: true,
      enabled: true,
    },
    {
      id: "fp3",
      name: "Minimalist Chronograph",
      price: 449,
      originalPrice: 599,
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&q=80",
      description: "Swiss-made automatic movement watch with sapphire crystal and genuine leather strap.",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFunflies.mp4",
      videoThumbnail: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1200&q=80",
      videoTitle: "Precision in Timekeeping",
      videoDescription: "Discover the intricate mechanics behind our signature timepieces.",
      isOnSale: true,
      enabled: true,
    },
  ],

  // Footer Links
  footerLinks: [
    {
      title: "Shop",
      enabled: true,
      links: [
        { label: "All Products", href: "/products", enabled: true },
        { label: "New Arrivals", href: "/new-arrivals", enabled: true },
        { label: "Best Sellers", href: "/best-sellers", enabled: true },
        { label: "Sale", href: "/sale", enabled: true },
      ],
    },
    {
      title: "Support",
      enabled: true,
      links: [
        { label: "FAQ", href: "/faq", enabled: true },
        { label: "Shipping", href: "/shipping", enabled: true },
        { label: "Returns", href: "/returns", enabled: true },
        { label: "Contact", href: "/contact", enabled: true },
      ],
    },
    {
      title: "Company",
      enabled: true,
      links: [
        { label: "About Us", href: "/about", enabled: true },
        { label: "Sustainability", href: "/sustainability", enabled: true },
        { label: "Careers", href: "/careers", enabled: true },
        { label: "Press", href: "/press", enabled: true },
      ],
    },
  ],

  // Social Links
  socialLinks: [
    { platform: "Instagram", url: "https://instagram.com", icon: "instagram", enabled: true },
    { platform: "Facebook", url: "https://facebook.com", icon: "facebook", enabled: true },
    { platform: "Twitter", url: "https://twitter.com", icon: "twitter", enabled: true },
    { platform: "Pinterest", url: "https://pinterest.com", icon: "pinterest", enabled: true },
  ],

  // UI Settings
  ui: {
    primaryColor: "#AF9AC9",
    secondaryColor: "#E3C49B",
    accentColor: "#666161",
    textColor: "#666161",
    headerAutoHide: true,
    carouselAutoplaySpeed: 5000,
    productsPerRow: {
      mobile: 1,
      tablet: 2,
      desktop: 4,
    },
  },
};