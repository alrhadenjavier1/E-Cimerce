// src/components/home/CategoryGrid.tsx
import type { Category } from '../../utils/storeConfig';

interface CategoryGridProps {
  categories: Category[];
}

export const CategoryGrid = ({ categories }: CategoryGridProps) => {
  const enabledCategories = categories.filter(c => c.enabled);

  if (enabledCategories.length === 0) return null;

  return (
    <section className="py-12 md:py-20 bg-theme-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-theme mb-2 md:mb-4">
            Shop by Category
          </h2>
          <p className="text-sm sm:text-base text-theme-light max-w-2xl mx-auto px-4">
            Explore our curated collections, each designed to elevate your everyday style
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {enabledCategories.map((category) => (
            <a
              key={category.id}
              href={`/category/${category.slug}`}
              className="group relative overflow-hidden rounded-xl md:rounded-2xl shadow-lg transition-all duration-500 hover:shadow-xl"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 text-white">
                <h3 className="text-sm sm:text-base md:text-xl font-serif mb-1 md:mb-2 transform transition-transform duration-300 group-hover:translate-y-[-4px]">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-xs md:text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block">
                    Shop Now →
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};