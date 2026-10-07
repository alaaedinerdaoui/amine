import { useState } from 'react';
import { ArrowLeft, BookOpen, Check, ShieldCheck } from 'lucide-react';
import { BOOK_DETAILS } from '../data/tunisiaData';

interface HeroProps {
  onOrderClick: () => void;
  onExploreClick: () => void;
}

export function Hero({ onOrderClick, onExploreClick }: HeroProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24 border-b border-[#E5DAC8] bg-[#F7F2E6]">
      {/* Background vintage map subtle grid decoration */}
      <div 
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#2A1F18 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Right column in RTL: Headline, Subtitle, CTAs, Trust marker */}
          <div className="lg:col-span-7 flex flex-col items-start text-right space-y-6">
            
            {/* Editorial clean metadata line (No pill boxes, using typographic separator) */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-[#705C4D]">
              <span className="font-semibold text-[#7C2529]">تونس</span>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-[#2A1F18]">باك اقتصاد وتصرف</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif-book text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#221711] leading-[1.25] text-balance">
              حضّر باك التاريخ والجغرافيا بطريقة أسهل
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#5A493C] leading-relaxed max-w-xl">
              ملخّصات مرتبة ومركّزة لتلامذة باك اقتصاد وتصرف، تجمع المفاهيم الأساسية، التواريخ الهامة، والخرائط والجداول لتبسيط المراجعة وربح الوقت.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto pt-2">
              <button
                onClick={onOrderClick}
                className="vintage-button px-7 py-3.5 rounded-sm text-sm sm:text-base font-semibold text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>نحب نطلب الكتاب</span>
                <ArrowLeft className="w-4 h-4" />
              </button>

              <button
                onClick={onExploreClick}
                className="vintage-button-secondary px-6 py-3.5 rounded-sm text-sm sm:text-base font-medium text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-[#7C2529]" />
                <span>نحب نعرف أكثر</span>
              </button>
            </div>

            {/* Trust message & Educational Highlights */}
            <div className="pt-4 border-t border-[#E3D6C2] w-full space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-[#2E2017]">
                <ShieldCheck className="w-4 h-4 text-[#7C2529] shrink-0" />
                <span>مخصّص لتلامذة باك اقتصاد وتصرف</span>
              </div>
              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-[#6B5A4B]">
                <span>التاريخ والجغرافيا كاملين</span>
                <span aria-hidden="true">·</span>
                <span>مطابق للبرنامج الرسمي التونسي</span>
                <span aria-hidden="true">·</span>
                <span>الدفع بعد الاستلام وتفقد الطرد</span>
              </div>
            </div>

          </div>

          {/* Left column in RTL: Large Realistic Book Mockup */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="relative w-full max-w-[340px] sm:max-w-[380px] group">
              
              {/* Vintage background shadow & glow */}
              <div 
                className="absolute -inset-4 bg-gradient-to-tr from-[#9B4B27]/10 via-[#C09540]/10 to-transparent rounded-2xl blur-xl"
                aria-hidden="true"
              />

              {/* Realistic Book Container */}
              <div className="relative bg-[#FBF8F1] rounded-lg p-2.5 vintage-double-border shadow-2xl transition-transform duration-300 hover:-translate-y-1">
                
                {/* Book Cover Photo / Mockup */}
                {!imageError ? (
                  <div className="relative aspect-[2/3] max-w-[340px] mx-auto w-full rounded overflow-hidden bg-[#2C1914]">
                    <img
                      src={BOOK_DETAILS.coverImage}
                      alt="غلاف كتاب تلخيص كل دروس التاريخ والجغرافيا لباكالوريا اقتصاد وتصرف"
                      referrerPolicy="no-referrer"
                      onError={() => setImageError(true)}
                      className="w-full h-full object-cover object-center shadow-inner"
                      loading="eager"
                    />
                    {/* Realistic book spine shadow overlay */}
                    <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/40 to-transparent pointer-events-none" />
                    <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/30 to-transparent pointer-events-none" />
                  </div>
                ) : (
                  /* Styled CSS/SVG Fallback Container adhering to Zero-Broken-Image Policy */
                  <div className="aspect-[2/3] max-w-[340px] mx-auto w-full rounded bg-gradient-to-br from-[#4A201C] via-[#331411] to-[#1C0908] text-[#F8F3E9] p-6 flex flex-col justify-between border-4 border-[#C09540]/40">
                    <div className="flex justify-between items-start">
                      <span className="text-xs uppercase font-serif tracking-widest text-[#E0C58A]">الجمهورية التونسية</span>
                      <span className="text-xs text-[#E0C58A]/80 font-mono">2026</span>
                    </div>
                    <div className="text-center space-y-3 py-4">
                      <p className="text-xs text-[#DFC99F]">سلسلة ملخصات الباكالوريا</p>
                      <h2 className="font-serif-book text-2xl font-bold leading-snug text-[#FFFFFF]">
                        كتاب الملخصات
                      </h2>
                      <p className="text-sm font-semibold text-[#D4AF37]">
                        في التاريخ والجغرافيا
                      </p>
                      <div className="w-16 h-0.5 bg-[#C09540] mx-auto opacity-70" />
                      <p className="text-xs text-[#F2EADB]">
                        باكالوريا اقتصاد وتصرف
                      </p>
                    </div>
                    <div className="text-center text-[11px] text-[#DFC99F]/70 border-t border-[#C09540]/30 pt-2">
                      محتوى مركّز ومنظم للمراجعة السريعة
                    </div>
                  </div>
                )}

                {/* Subtitle tag below book */}
                <div className="mt-3 px-2 flex items-center justify-between text-xs text-[#6B5A4B]">
                  <span className="font-serif-book font-semibold text-[#2A1F18]">
                    تأليف: محمد أمين حسايني
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[#7C2529] font-bold text-sm">
                      {BOOK_DETAILS.basePrice} {BOOK_DETAILS.currency}
                    </span>
                    <span className="text-[10px] text-[#1D7438] bg-[#EBF5EE] border border-[#CDE5D4] px-1.5 py-0.5 rounded font-medium">
                      48.9 د.ت مع التوصيل
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
