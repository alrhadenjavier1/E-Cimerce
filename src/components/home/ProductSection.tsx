import type { Product } from '../../utils/storeConfig';
import { ProductCard } from '../ui/ProductCard';

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllLink?: string;
}

export const ProductSection = ({ title, subtitle, products, viewAllLink }: ProductSectionProps) => {
  return (
    <section className="py-16 bg-theme-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif text-theme mb-2">{title}</h2>
            {subtitle && <p className="text-theme-light">{subtitle}</p>}
          </div>
          {viewAllLink && (
            <a href={viewAllLink} className="text-theme-primary hover:text-theme transition-colors text-sm mt-4 sm:mt-0">
              View All →
            </a>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};