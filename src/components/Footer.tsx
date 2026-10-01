import { useState } from 'react';
import { Phone, MessageCircle, Instagram, Facebook, ShieldCheck, FileText, X, Lock } from 'lucide-react';
import { BOOK_DETAILS } from '../data/tunisiaData';

interface FooterProps {
  onAdminClick?: () => void;
}

export function Footer({ onAdminClick }: FooterProps) {
  const [modalType, setModalType] = useState<'privacy' | 'terms' | null>(null);

  return (
    <footer className="bg-[#241A14] text-[#D8CFBF] pt-14 pb-10 border-t border-[#3A2D23]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-[#3A2E24]">
          
          {/* Brand info */}
          <div className="md:col-span-6 space-y-4">
            <h3 className="font-serif-book text-2xl font-bold text-[#F5EFE3]">
              كتاب الملخصات في التاريخ والجغرافيا
            </h3>
            <p className="text-xs sm:text-sm text-[#A89A89] leading-relaxed max-w-md">
              مشروع تربوي مستقل مخصص لتلامذة باكالوريا اقتصاد وتصرف في تونس. نهدف إلى تبسيط مراجعة المواد الأدبية والاجتماعية وتزويد التلميذ بملخصات منهجية ومركّزة للنجاح بتميز.
            </p>
            <div className="flex items-center gap-3 text-xs text-[#8A7969]">
              <span>الجمهورية التونسية</span>
              <span aria-hidden="true">·</span>
              <span>Économie & Gestion</span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-serif-book text-base font-bold text-[#F5EFE3]">
              تواصل معنا
            </h4>
            <div className="space-y-2 text-xs">
              <a
                href={`tel:+216${BOOK_DETAILS.supportPhone.replace(/\s+/g, '')}`}
                className="flex items-center gap-2 hover:text-[#C09540] transition-colors dir-ltr justify-end"
              >
                <span>+216 {BOOK_DETAILS.supportPhone}</span>
                <Phone className="w-3.5 h-3.5 text-[#C09540]" />
              </a>

              <a
                href={`https://wa.me/${BOOK_DETAILS.whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-[#25D366] transition-colors dir-ltr justify-end"
              >
                <span>واتساب: {BOOK_DETAILS.supportPhone}</span>
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
              </a>

              <p className="text-[11px] text-[#7C6C5E] pt-1">
                خدمة الزبائن متوفرة كامل أيام الأسبوع للإجابة على استفساراتكم.
              </p>
            </div>
          </div>

          {/* Social Links & Legal */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-serif-book text-base font-bold text-[#F5EFE3]">
              حسابات التواصل
            </h4>
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded bg-[#33241B] border border-[#483528] flex items-center justify-center text-[#D8CFBF] hover:text-[#1877F2] hover:border-[#1877F2] transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded bg-[#33241B] border border-[#483528] flex items-center justify-center text-[#D8CFBF] hover:text-[#E4405F] hover:border-[#E4405F] transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/${BOOK_DETAILS.whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded bg-[#33241B] border border-[#483528] flex items-center justify-center text-[#D8CFBF] hover:text-[#25D366] hover:border-[#25D366] transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>

            <div className="pt-2 flex flex-col space-y-1.5 text-xs text-[#8A7969]">
              <button
                onClick={() => setModalType('privacy')}
                className="text-right hover:text-[#C09540] transition-colors cursor-pointer"
              >
                سياسة الخصوصية
              </button>
              <button
                onClick={() => setModalType('terms')}
                className="text-right hover:text-[#C09540] transition-colors cursor-pointer"
              >
                شروط الطلب والتوصيل
              </button>
              {onAdminClick && (
                <button
                  onClick={onAdminClick}
                  className="text-right text-[#A89886]/60 hover:text-[#C09540] transition-colors cursor-pointer flex items-center gap-1 pt-1"
                  title="الولوج للوحة الإدارة"
                >
                  <Lock className="w-3 h-3" />
                  <span>لوحة الإدارة (/admin)</span>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7A6A5A]">
          <p>© {new Date().getFullYear()} كتاب الملخصات في التاريخ والجغرافيا. جميع الحقوق محفوظة لتلامذة تونس.</p>
          <p className="font-serif-book text-[#A39281]">طبعة خاصة بباكالوريا اقتصاد وتصرف</p>
        </div>

      </div>

      {/* Modal for Privacy Policy / Order Terms */}
      {modalType && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in duration-200"
          onClick={() => setModalType(null)}
        >
          <div 
            className="bg-[#FCFAF6] text-[#2A1F18] border-2 border-[#D8CABE] rounded-md max-w-lg w-full p-6 relative max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalType(null)}
              className="absolute top-4 left-4 p-1.5 text-[#5C4A3C] hover:text-[#2A1F18] hover:bg-[#EFE5D4] rounded-sm transition-colors cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>

            {modalType === 'privacy' ? (
              <div className="text-right space-y-3">
                <div className="flex items-center gap-2 text-[#7C2529]">
                  <ShieldCheck className="w-5 h-5" />
                  <h3 className="font-serif-book text-xl font-bold">سياسة الخصوصية وحماية المعطيات</h3>
                </div>
                <p className="text-xs sm:text-sm text-[#5C4D40] leading-relaxed">
                  نحن نلتزم بحماية خصوصيتك ومعلوماتك الشخصية. البيانات التي تقوم بتقديمها في استمارة الطلب (الاسم، رقم الهاتف، العنوان) تُستخدم حصرياً للأغراض التالية:
                </p>
                <ul className="text-xs text-[#5C4D40] list-disc pr-5 space-y-1.5">
                  <li>الاتصال بك هاتفياً لتأكيد صحة الطلب وموعد التسليم.</li>
                  <li>تزويد شركة التوصيل أو عون التوزيع بالعنوان الدقيق لتسليم الكتاب.</li>
                  <li>لا يتم بيع أو مشاركة بياناتك مع أي طرف ثالث لأغراض إعلانية.</li>
                </ul>
              </div>
            ) : (
              <div className="text-right space-y-3">
                <div className="flex items-center gap-2 text-[#7C2529]">
                  <FileText className="w-5 h-5" />
                  <h3 className="font-serif-book text-xl font-bold">شروط الطلب والتوصيل</h3>
                </div>
                <p className="text-xs sm:text-sm text-[#5C4D40] leading-relaxed">
                  حرصاً منا على تقديم خدمة موثوقة وشفافة لتلامذة الباكالوريا وأوليائهم:
                </p>
                <ul className="text-xs text-[#5C4D40] list-disc pr-5 space-y-1.5">
                  <li><strong>طريقة الدفع:</strong> الدفع يكون نقداً عند استلام الطرد وتفقده مباشرة من عون التوزيع.</li>
                  <li><strong>مصاريف التوصيل:</strong> معلوم التوصيل قار محدد في الاستمارة (7 د.ت) ويغطي جميع معتمديات وولايات تونس.</li>
                  <li><strong>مدة التوصيل:</strong> يتم تسليم الطرد عادة خلال 24 إلى 72 ساعة من وقت تأكيد المكالمة الهاتفية.</li>
                  <li><strong>حق التثبت:</strong> يحق للتلميذ التثبت من سلامة الكتاب عند الاستلام.</li>
                </ul>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-[#E8DEC9] text-left">
              <button
                onClick={() => setModalType(null)}
                className="vintage-button-secondary px-4 py-1.5 rounded-sm text-xs font-semibold cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
