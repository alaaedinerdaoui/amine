import { useState } from 'react';
import { Eye, ArrowLeft, ZoomIn, X, BookOpen } from 'lucide-react';
import { BOOK_DETAILS } from '../data/tunisiaData';

interface BookPreviewProps {
  onOrderClick: () => void;
}

interface PreviewPage {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  label: string;
  isPlaceholder?: boolean;
  sampleContent?: string[];
}

export function BookPreview({ onOrderClick }: BookPreviewProps) {
  const [activeModalItem, setActiveModalItem] = useState<{
    title: string;
    description: string;
    image?: string;
    isPlaceholder?: boolean;
    sampleContent?: string[];
    label?: string;
  } | null>(null);

  const previewPages: PreviewPage[] = [
    {
      id: 1,
      title: "ملخصات محور التاريخ",
      subtitle: "أزمات الحرب الباردة ومسار العلاقات الدولية",
      description: "صفحة حقيقية من الكتاب تعرض تسلسل الحرب الباردة، أزمة برلين (1948-1949)، وحرب الكوريتين عبر مخطط تسلسلي مع المصطلحات والنتائج.",
      image: BOOK_DETAILS.historyPreviewImage,
      label: "صفحة أصلية من الكتاب"
    },
    {
      id: 2,
      title: "ملخصات محور الجغرافيا",
      subtitle: "الأطراف المتدخلة في الأدفاق التجارية العالمية",
      description: "صفحة حقيقية من الكتاب توضح دور الشركات عبر القطرية والأطراف المتدخلة في الأدفاق التجارية العالمية مع مخطط نواس العوامل الاقتصادية المؤثرة.",
      image: BOOK_DETAILS.geographyPreviewImage,
      label: "صفحة أصلية من الكتاب"
    }
  ];

  return (
    <section id="preview" className="py-16 md:py-24 bg-[#FAF7F0] border-b border-[#E3D6C2]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="text-xs font-semibold text-[#7C2529] tracking-wider mb-2">
            شفافية كاملة
          </div>
          <h2 className="font-serif-book text-2xl sm:text-3xl md:text-4xl font-bold text-[#2A1F18] text-balance">
            شوف الكتاب من الداخل
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#5C4D40]">
            اكتشف نماذج من صفحات الكتاب وطريقة تقسيم الدروس والمحتوى البيداغوجي.
          </p>
          <div className="w-16 h-0.5 bg-[#C09540] mx-auto mt-4" />
        </div>

        {/* 2 Preview Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {previewPages.map((page) => (
            <div
              key={page.id}
              className="bg-[#FCFAF5] rounded-sm border border-[#DACFBD] overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col group"
            >
              {/* Image / Preview Frame */}
              <div 
                onClick={() => setActiveModalItem(page)}
                className="relative aspect-[3/4] bg-[#EFE6D6] overflow-hidden cursor-pointer border-b border-[#E5DAC8]"
              >
                {page.image && !page.isPlaceholder ? (
                  <img
                    src={page.image}
                    alt={page.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  /* Standardized Vintage Educational Placeholder as requested */
                  <div className="w-full h-full p-5 flex flex-col justify-between bg-gradient-to-b from-[#F7F2E7] to-[#EDE3D0] border-2 border-dashed border-[#D2C3AB] m-2 rounded text-center">
                    <div className="flex items-center justify-between text-[10px] text-[#7C2529] font-mono">
                      <span>نموذج داخلي</span>
                      <span>باك 2026</span>
                    </div>

                    <div className="py-4 space-y-2">
                      <BookOpen className="w-8 h-8 mx-auto text-[#7C2529]/70" />
                      <div className="font-serif-book font-bold text-sm text-[#2A1F18]">
                        {page.title}
                      </div>
                      <div className="text-[11px] text-[#705C4D] leading-tight">
                        صورة من صفحات الكتاب
                      </div>
                    </div>

                    <div className="space-y-1 text-right text-[10px] text-[#5C4B3D] border-t border-[#D5C6AF] pt-2">
                      {page.sampleContent?.map((item, idx) => (
                        <div key={idx} className="truncate">· {item}</div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-[#2A1F18]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <span className="bg-[#2A1F18]/80 text-xs px-3 py-1.5 rounded-sm flex items-center gap-1.5 backdrop-blur-sm">
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>انقر للمعاينة</span>
                  </span>
                </div>

                {/* Subtle caption tag */}
                <div className="absolute bottom-2 right-2 bg-[#FCFAF5]/90 border border-[#D5C7B0] text-[10px] text-[#5A4839] px-2 py-0.5 rounded-sm">
                  {page.label}
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif-book text-base font-bold text-[#2A1F18] mb-1">
                    {page.title}
                  </h3>
                  <p className="text-xs text-[#6B5A4B] leading-relaxed">
                    {page.subtitle}
                  </p>
                </div>

                <button
                  onClick={() => setActiveModalItem(page)}
                  className="mt-3 text-xs font-semibold text-[#7C2529] hover:underline flex items-center gap-1 text-right cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>معاينة التفاصيل</span>
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Action Button CTA */}
        <div className="mt-12 text-center">
          <button
            onClick={onOrderClick}
            className="vintage-button px-8 py-3.5 rounded-sm text-sm sm:text-base font-semibold inline-flex items-center gap-2 cursor-pointer shadow-md"
          >
            <span>نحب نطلب نسختي</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="mt-2 text-xs text-[#705F51]">
            التوصيل متوفر في كامل تراب الجمهورية التونسية
          </div>
        </div>

      </div>

      {/* Lightbox / Modal for page inspect */}
      {activeModalItem && (
        <div 
          className="fixed inset-0 z-50 bg-[#1A120D]/80 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in duration-200"
          onClick={() => setActiveModalItem(null)}
        >
          <div 
            className="bg-[#FCFAF6] border-2 border-[#D8CABE] rounded-md max-w-xl w-full p-6 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveModalItem(null)}
              className="absolute top-4 left-4 p-1.5 text-[#5C4A3C] hover:text-[#2A1F18] hover:bg-[#EFE5D4] rounded-sm transition-colors cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-right">
              <span className="text-xs font-semibold text-[#7C2529]">{activeModalItem.label}</span>
              <h3 className="font-serif-book text-xl font-bold text-[#2A1F18] mt-1 mb-3">
                {activeModalItem.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#5C4B3D] leading-relaxed mb-4">
                {activeModalItem.description}
              </p>

              {activeModalItem.image && !activeModalItem.isPlaceholder ? (
                <div className="border border-[#D8CABE] rounded overflow-hidden aspect-[3/4] max-h-[380px] mx-auto bg-[#2A1F18]">
                  <img
                    src={activeModalItem.image}
                    alt={activeModalItem.title}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="p-6 bg-[#F7F2E7] border border-dashed border-[#D2C3AB] rounded text-center space-y-4">
                  <div className="font-serif-book font-bold text-[#2A1F18]">
                    نموذج من صفحات الكتاب
                  </div>
                  <p className="text-xs text-[#786554] max-w-sm mx-auto">
                    هذا النموذج يوضح طريقة العرض والتلخيص المتبعة داخل الكتاب لتسهيل الفهم والمراجعة.
                  </p>
                  {activeModalItem.sampleContent && (
                    <ul className="text-right text-xs text-[#4A3B32] space-y-2 max-w-xs mx-auto list-disc pr-4">
                      {activeModalItem.sampleContent.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-[#E8DEC9] flex justify-between items-center">
                <span className="text-xs text-[#705F51]">
                  طبعة باكالوريا اقتصاد وتصرف
                </span>
                <button
                  onClick={() => {
                    setActiveModalItem(null);
                    onOrderClick();
                  }}
                  className="vintage-button px-5 py-2 rounded-sm text-xs font-semibold cursor-pointer"
                >
                  اطلب نسختك توّا
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </section>
  );
}
