import { CheckCircle2, BookmarkCheck, Clock, FileText, Compass } from 'lucide-react';

export function WhyThisBook() {
  const notebookPoints = [
    {
      title: "التخلّص من فوضى الأوراق والكراسات المبعثرة",
      detail: "برشة تلامذة يلقاو رواحهم ضايعين بين كراسات القسم، كتب البرامج، وأوراق الفوتوكوبي غير المنظمة. الكتاب هذا يجمعلك كل شيء في مرجع واحد واضح ومرتب."
    },
    {
      title: "الحفاظ على المصطلحات والتواريخ الرسمية",
      detail: "التلخيص ما يعنيش نقص المعلومة، بل انتقاء أهم التواريخ، المفاهيم، والبيانات الاقتصادية والجغرافية اللي تتطلبها لجان الإصلاح في مناظرة الباكالوريا."
    },
    {
      title: "منهجية تحليل الوثائق والمقال التاريخي والجغرافي",
      detail: "مساعدة عملية باش تفهم كيفاش تصيغ الإجابة، كيفاش تقرأ الخرائط والرسوم البيانية وتوظف الإحصائيات في تحليلك."
    },
    {
      title: "مراجعة سريعة قبل الدوفوارات والباك الأبيض",
      detail: "في فترات الامتحانات، ما عندكش وقت باش تعاود تقرأ مئات الصفحات. هذا الكتاب يخليك تعمل دورة كاملة على المحور في وقت قياسي."
    }
  ];

  return (
    <section id="why" className="py-16 md:py-24 bg-[#F5EFE3] border-b border-[#E3D6C2] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="text-xs font-semibold text-[#7C2529] tracking-wider mb-2">
            رؤية تعليمية تونسية
          </div>
          <h2 className="font-serif-book text-2xl sm:text-3xl md:text-4xl font-bold text-[#2A1F18] text-balance">
            علاش الكتاب هذا؟
          </h2>
          <div className="w-16 h-0.5 bg-[#C09540] mx-auto mt-4" />
        </div>

        {/* Vintage Notebook Layout */}
        <div className="relative bg-[#FCFAF6] border-2 border-[#D8CABE] rounded-md shadow-lg overflow-hidden">
          
          {/* Notebook top spiral / header bar */}
          <div className="bg-[#EAE0D0] border-b border-[#D8CABE] px-6 py-3.5 flex items-center justify-between text-xs text-[#5C4A3C]">
            <div className="flex items-center gap-2 font-serif-book font-bold text-sm text-[#2A1F18]">
              <FileText className="w-4 h-4 text-[#7C2529]" />
              <span>مذكرة التلميذ · مراجعة التاريخ والجغرافيا</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-[#786554]">
              <span>شعبة: اقتصاد وتصرف</span>
              <span aria-hidden="true">/</span>
              <span>تونس 2026</span>
            </div>
          </div>

          {/* Notebook body with red margin line simulation on the right in RTL */}
          <div className="relative p-6 sm:p-10 vintage-ruled-notebook">
            
            {/* Vintage vertical margin line */}
            <div 
              className="absolute top-0 bottom-0 right-14 sm:right-20 w-[1.5px] bg-[#E38B88]/60 pointer-events-none hidden sm:block" 
              aria-hidden="true"
            />

            <div className="space-y-8 sm:pr-12 relative">
              
              <div className="text-sm sm:text-base text-[#46362B] leading-relaxed font-serif-book text-lg">
                مادتي التاريخ والجغرافيا في شعبة الاقتصاد والتصرف تتطلب برشة حفظ وتفاصيل. الصعوبة ماهيش في فهم الدرس، لكن في <span className="text-[#7C2529] font-bold">كيفاش تتفكر المعطيات الأساسية</span> وتوظفها نهار الامتحان من غير تشتت.
              </div>

              <div className="grid grid-cols-1 gap-6 pt-2">
                {notebookPoints.map((point, index) => (
                  <div key={index} className="flex items-start gap-3 sm:gap-4">
                    <div className="mt-1 w-6 h-6 rounded-full bg-[#7C2529]/10 text-[#7C2529] flex items-center justify-center shrink-0">
                      <BookmarkCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-serif-book text-base sm:text-lg font-bold text-[#2A1F18]">
                        {point.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#5A493C] mt-1 leading-relaxed">
                        {point.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Notebook footer quote */}
              <div className="mt-8 pt-4 border-t border-[#DFD4C2] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#705F50]">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#7C2529]" />
                  <span>الوقت في عام الباك هو أثمن رأس مال عندك.</span>
                </div>
                <div className="font-serif-book font-bold text-[#7C2529]">
                  هدفنا: مراجعة ذكية ومردود أعلى.
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
