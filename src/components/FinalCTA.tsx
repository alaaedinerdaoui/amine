import { ArrowLeft, BookOpen } from 'lucide-react';
import { BOOK_DETAILS } from '../data/tunisiaData';

interface FinalCTAProps {
  onOrderClick: () => void;
}

export function FinalCTA({ onOrderClick }: FinalCTAProps) {
  return (
    <section className="py-16 md:py-24 bg-[#EFE8DA] border-b border-[#D8CABE] relative overflow-hidden">
      
      {/* Vintage decorative border styling */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative">
        <div className="bg-[#FCFAF6] vintage-double-border rounded-sm p-8 sm:p-12 text-center shadow-md relative">
          
          {/* Subtle Vintage Emblem */}
          <div className="w-12 h-12 rounded-full border border-[#C09540] mx-auto mb-5 flex items-center justify-center text-[#7C2529] bg-[#FAF5E8]">
            <BookOpen className="w-6 h-6" />
          </div>

          <div className="text-xs font-semibold text-[#7C2529] tracking-wider mb-2">
            باكالوريا اقتصاد وتصرف · تونس
          </div>

          <h2 className="font-serif-book text-2xl sm:text-3xl md:text-4xl font-bold text-[#2A1F18] mb-3 text-balance">
            المراجعة تبدأ بتنظيم واضح.
          </h2>

          <p className="font-serif-book text-lg sm:text-xl text-[#6B5A4B] max-w-xl mx-auto mb-8">
            حضّر روحك للباك بطريقة أبسط.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onOrderClick}
              className="vintage-button px-8 py-3.5 rounded-sm text-base font-bold flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-xl"
            >
              <span>اطلب الكتاب توّا</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#705F51]">
            <span>الدفع عند الاستلام</span>
            <span aria-hidden="true">·</span>
            <span>توصيل لكامل تراب الجمهورية</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono font-bold text-[#7C2529]">41 د.ت للكتاب (49 د.ت مع التوصيل · 89 د.ت لنسختين)</span>
          </div>

        </div>
      </div>
    </section>
  );
}
