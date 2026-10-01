import { useState } from 'react';
import { Menu, X, ShoppingBag } from 'lucide-react';

interface NavbarProps {
  onOrderClick: () => void;
}

export function Navbar({ onOrderClick }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'شنوة في الكتاب', href: '#content' },
    { label: 'علاش الكتاب هذا', href: '#why' },
    { label: 'معاينة الصفحات', href: '#preview' },
    { label: 'شكون معني', href: '#audience' },
    { label: 'الأسئلة الشائعة', href: '#faq' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#FBF8F1]/95 backdrop-blur-md border-b border-[#E3D7C5] transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <a 
          href="#" 
          className="font-serif-book text-xl sm:text-2xl font-bold tracking-tight text-[#2A1F18] hover:text-[#7C2529] transition-colors whitespace-nowrap"
        >
          ملخصات الباكالوريا
        </a>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-[#5A493C]">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-[#7C2529] hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Primary action button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOrderClick}
            className="vintage-button px-4 sm:px-5 py-2.5 rounded-sm text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>اطلب نسختك</span>
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#4A3B32] hover:text-[#2A1F18] hover:bg-[#EFE5D4] rounded-sm transition-colors cursor-pointer"
            aria-label="القائمة"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E3D7C5] bg-[#F7F2E7] px-5 py-4 space-y-3 shadow-md animate-in fade-in duration-200">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-2 text-sm font-medium text-[#4A3B32] hover:text-[#7C2529] hover:bg-[#EDE1CC] rounded-sm transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
