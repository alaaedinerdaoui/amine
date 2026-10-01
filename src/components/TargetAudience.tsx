import { GraduationCap, BookOpen, FileCheck, Hourglass, Check } from 'lucide-react';

export function TargetAudience() {
  const audiencePoints = [
    {
      icon: GraduationCap,
      title: "تلامذة باك اقتصاد وتصرف",
      desc: "مخصص حصرياً لتلامذة المعاهد التونسية والمترشحين بصفة فردية لشعبة Économie & Gestion.",
      highlight: "تخصص تام"
    },
    {
      icon: BookOpen,
      title: "اللي يحبوا يسهّلوا المراجعة",
      desc: "لتجاوز رهبة الكتب المدرسية السميكة ومئات صفحات الكراسات، والتركيز على المفيد مباشرة.",
      highlight: "تبسيط ذكي"
    },
    {
      icon: FileCheck,
      title: "اللي يحبوا ملخّص مرتب وواضح",
      desc: "محتوى مكتوب بلغة واضحة، مهيكل بفقرات قصيرة وجداول دقيقة تسهل الاستحضار يوم الامتحان.",
      highlight: "تنظيم متقن"
    },
    {
      icon: Hourglass,
      title: "اللي يحبوا يربحوا وقت في المراجعة",
      desc: "لتوفير ساعات طويلة من التلخيص اليدوي واستغلال الوقت المتبقي في التدرب على التمارين والمواضيع.",
      highlight: "استثمار الوقت"
    }
  ];

  return (
    <section id="audience" className="py-16 md:py-24 bg-[#F5EFE3] border-b border-[#E3D6C2]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="text-xs font-semibold text-[#7C2529] tracking-wider mb-2">
            الجمهور المستهدف
          </div>
          <h2 className="font-serif-book text-2xl sm:text-3xl md:text-4xl font-bold text-[#2A1F18] text-balance">
            الكتاب هذا لي شكون؟
          </h2>
          <div className="w-16 h-0.5 bg-[#C09540] mx-auto mt-4" />
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {audiencePoints.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-[#FCFAF6] border border-[#DACFBD] rounded-sm p-6 shadow-sm flex flex-col justify-between hover:border-[#C09540] transition-colors"
              >
                <div>
                  <div className="w-12 h-12 rounded bg-[#EFE4D2] text-[#7C2529] flex items-center justify-center mb-5 border border-[#DFCBB2]">
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Clean unboxed tag */}
                  <div className="text-[11px] font-semibold text-[#8C7355] mb-1">
                    {item.highlight}
                  </div>

                  <h3 className="font-serif-book text-lg font-bold text-[#2A1F18] mb-2 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#5C4B3D] leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-[#EFE5D4] flex items-center gap-1.5 text-xs text-[#7C2529] font-medium">
                  <Check className="w-3.5 h-3.5" />
                  <span>مناسب ليك 100%</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
