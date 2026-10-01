import { BookMarked, Compass, CalendarCheck, Sparkles, Layers } from 'lucide-react';

export function BookPresentation() {
  const cards = [
    {
      title: "ملخّصات مركّزة",
      description: "أهم الأفكار والنقاط الأساسية في كل درس، خالية من الحشو الزائد اللي يضيّع وقتك.",
      icon: BookMarked,
      tag: "المحتوى الجوهري"
    },
    {
      title: "تنظيم واضح",
      description: "الدروس مرتبة بطريقة بيداغوجية منطقية تسهّل عليك الحفظ والربط بين المحاور.",
      icon: Layers,
      tag: "هيكلة بيداغوجية"
    },
    {
      title: "تاريخ وجغرافيا",
      description: "محتوى شامل يغطي محاور التاريخ ومحاور الجغرافيا حسب البرنامج الرسمي لباك اقتصاد وتصرف.",
      icon: Compass,
      tag: "برنامج رسمي"
    },
    {
      title: "مراجعة أسهل",
      description: "يساعدك تراجع أهم المعلومات والتواريخ والخرائط الإحصائية في وقت أقل وبجهد أقل.",
      icon: Sparkles,
      tag: "ربح الوقت"
    }
  ];

  return (
    <section id="content" className="py-16 md:py-24 bg-[#FAF7F0] border-b border-[#E3D6C2]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="text-xs font-semibold text-[#7C2529] tracking-wider mb-2">
            محتوى مصمّم للباكالوريا
          </div>
          <h2 className="font-serif-book text-2xl sm:text-3xl md:text-4xl font-bold text-[#2A1F18] text-balance">
            شنوة تلقى في الكتاب؟
          </h2>
          <div className="w-16 h-0.5 bg-[#C09540] mx-auto mt-4" />
        </div>

        {/* 4 Elegant Vintage Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="relative bg-[#FCFAF5] p-6 sm:p-7 rounded-sm border border-[#DACFBD] shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between"
              >
                {/* Vintage Corner Accent */}
                <div 
                  className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#C09540]/60 pointer-events-none"
                  aria-hidden="true"
                />
                
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded bg-[#F2E8D7] border border-[#DFCBB2] flex items-center justify-center text-[#7C2529]">
                      <Icon className="w-5 h-5" />
                    </div>
                    {/* Unboxed metadata text adhering to Zero-Pill rule */}
                    <span className="text-xs text-[#826F5E] font-medium">
                      {card.tag}
                    </span>
                  </div>

                  <h3 className="font-serif-book text-xl font-bold text-[#2A1F18] mb-2 group-hover:text-[#7C2529] transition-colors">
                    {card.title}
                  </h3>

                  <p className="text-sm text-[#5C4D40] leading-relaxed">
                    {card.description}
                  </p>
                </div>

                {/* Subtle footnote divider */}
                <div className="mt-5 pt-3 border-t border-[#EFE5D4] flex items-center justify-between text-[11px] text-[#8C7A6B]">
                  <span>باك اقتصاد وتصرف</span>
                  <span className="font-mono text-[#7C2529]">0{index + 1}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary note below cards */}
        <div className="mt-10 p-4 sm:p-5 rounded bg-[#F2EBDE] border border-[#DDD0BC] text-center max-w-3xl mx-auto">
          <p className="text-xs sm:text-sm text-[#4E3E32] leading-relaxed">
            الكتاب مصمم خصيصاً باش يعطيك الخلاصة المفيدة لكل درس، من غير ما تغرق في تفاصيل الكتب المدرسية الطويلة اللي تشتت التركيز.
          </p>
        </div>

      </div>
    </section>
  );
}
