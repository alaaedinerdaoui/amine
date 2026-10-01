import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqItems = [
    {
      q: "الكتاب موجه لأي شعبة؟",
      a: "موجه لتلامذة باك اقتصاد وتصرف في مادة التاريخ والجغرافيا."
    },
    {
      q: "كيفاش نطلب الكتاب؟",
      a: "عمّر معلوماتك في فورم الطلب، ونرجعولك لتأكيد الطلب."
    },
    {
      q: "كيفاش نخلص؟",
      a: "الدفع عند الاستلام إذا كانت الخدمة متوفرة."
    },
    {
      q: "وين يتم التوصيل؟",
      a: "توصيل لكامل تراب الجمهورية."
    }
  ];

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-16 md:py-24 bg-[#F5EFE3] border-b border-[#E3D6C2]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="text-xs font-semibold text-[#7C2529] tracking-wider mb-2">
            إجابات واضحة
          </div>
          <h2 className="font-serif-book text-2xl sm:text-3xl md:text-4xl font-bold text-[#2A1F18] text-balance">
            أسئلة تتعاود برشة
          </h2>
          <div className="w-16 h-0.5 bg-[#C09540] mx-auto mt-4" />
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-[#FCFAF6] border border-[#DACFBD] rounded-sm overflow-hidden shadow-sm transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="w-full px-5 sm:px-6 py-4 text-right flex items-center justify-between gap-4 cursor-pointer hover:bg-[#F8F3E9] transition-colors"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-[#7C2529] shrink-0" />
                    <span className="font-serif-book font-bold text-base sm:text-lg text-[#2A1F18]">
                      {item.q}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#7C2529] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-4 pt-1 text-xs sm:text-sm text-[#5C4D40] leading-relaxed border-t border-[#EFE5D4] bg-[#FAF6EC] animate-in fade-in duration-150">
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
