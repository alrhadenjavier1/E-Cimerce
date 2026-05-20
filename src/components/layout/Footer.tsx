// src/components/layout/Footer.tsx
import { Heart } from 'lucide-react';
import type { FooterLink, SocialLink } from '../../utils/storeConfig';

interface FooterProps {
  footerLinks: FooterLink[];
  socialLinks: SocialLink[];
  companyName: string;
}

export const Footer = ({ footerLinks, socialLinks, companyName }: FooterProps) => {
  const currentYear = new Date().getFullYear();
  const enabledFooterLinks = footerLinks.filter(link => link.enabled);

  return (
    <footer className="bg-theme border-t border-theme">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-serif text-theme mb-4">{companyName}</h3>
            <p className="text-theme-light text-sm leading-relaxed">
              Timeless elegance curated for the modern connoisseur.
            </p>
          </div>
          {enabledFooterLinks.map((column) => (
            <div key={column.title}>
              <h4 className="font-semibold text-theme mb-4">{column.title}</h4>
              <ul className="space-y-2">
                {column.links.filter(link => link.enabled).map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-theme-light hover:text-theme-primary transition-colors text-sm">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 border-t border-theme text-center">
          <p className="text-theme-light text-sm flex items-center justify-center gap-1">
            Made with <Heart className="w-3 h-3 text-theme-secondary" /> by {companyName}
          </p>
        </div>
      </div>
    </footer>
  );
};