import { useState, useId } from 'react';
import { ShoppingBag, Truck, ShieldCheck, CheckCircle2, Phone, MapPin, User, Hash, AlertCircle, RefreshCw, Printer } from 'lucide-react';
import { TUNISIAN_GOVERNORATES, BOOK_DETAILS } from '../data/tunisiaData';
import { saveOrder } from '../data/orderStorage';

export function OrderSection() {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [secondPhoneNumber, setSecondPhoneNumber] = useState('');
  const [governorate, setGovernorate] = useState('tunis');
  const [delegation, setDelegation] = useState('');
  const [address, setAddress] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<{
    orderId: string;
    fullName: string;
    phoneNumber: string;
    secondPhoneNumber?: string;
    governorateName: string;
    delegation: string;
    address: string;
    quantity: number;
    bookPrice: number;
    shippingCost: number;
    totalAmount: number;
    date: string;
  } | null>(null);

  const selectedGov = TUNISIAN_GOVERNORATES.find(g => g.id === governorate) || TUNISIAN_GOVERNORATES[0];

  const bookUnitPrice = BOOK_DETAILS.basePrice;
  // Delivery is 9 DT, Book is 39.9 DT -> 48.9 DT total for 1 copy
  const shippingFee = BOOK_DETAILS.shippingCost ?? 9;
  const itemsTotal = Number((bookUnitPrice * quantity).toFixed(1));
  const orderTotal = Number((itemsTotal + shippingFee).toFixed(1));

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 3) {
      errs.fullName = 'الرجاء إدخال الاسم واللقب الثلاثي أو الثنائي بوضوح';
    }

    // Tunisian phone numbers: 8 digits, typically starting with 2, 4, 5, 9, 3
    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    const phoneRegex = /^[23459][0-9]{7}$/;
    if (!cleanPhone) {
      errs.phoneNumber = 'رقم الهاتف إجباري للاتصال بك وتأكيد التوصيل';
    } else if (!phoneRegex.test(cleanPhone)) {
      errs.phoneNumber = 'الرجاء إدخال رقم هاتف تونسي صالح متكون من 8 أرقام (مثال: 98123456 أو 22123456)';
    }

    // Optional second phone validation
    if (secondPhoneNumber.trim()) {
      const cleanSecondPhone = secondPhoneNumber.replace(/\s+/g, '');
      if (!phoneRegex.test(cleanSecondPhone)) {
        errs.secondPhoneNumber = 'الرجاء إدخال رقم هاتف تونسي صالح متكون من 8 أرقام أو ترك الحقل فارغاً';
      }
    }

    if (!governorate) {
      errs.governorate = 'الرجاء اختيار الولاية';
    }

    if (!delegation.trim()) {
      errs.delegation = 'الرجاء تحديد المعتمدية أو المنطقة';
    }

    if (!address.trim() || address.trim().length < 5) {
      errs.address = 'الرجاء كتابة العنوان الدقيق (الشارع، الحي، أو أقرب نقطة معروفة)';
    }

    if (quantity < 1) {
      errs.quantity = 'الكمية يجب أن تكون 1 على الأقل';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    setTimeout(async () => {
      const orderId = `BAC-${Math.floor(100000 + Math.random() * 900000)}`;
      const orderData = {
        orderId,
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        secondPhoneNumber: secondPhoneNumber.trim() || undefined,
        governorateName: selectedGov.nameAr,
        delegation: delegation.trim(),
        address: address.trim(),
        quantity,
        bookPrice: bookUnitPrice,
        shippingCost: shippingFee,
        totalAmount: orderTotal,
        notes: notes.trim() || undefined,
        date: new Date().toLocaleDateString('ar-TN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      };

      // Save via centralized storage helper
      try {
        await saveOrder(orderData);
      } catch (e) {
        console.error('Error saving order', e);
      }

      setIsSubmitting(false);
      setSubmittedOrder(orderData);
    }, 600);
  };

  const handleReset = () => {
    setSubmittedOrder(null);
    setFullName('');
    setPhoneNumber('');
    setSecondPhoneNumber('');
    setAddress('');
    setDelegation('');
    setQuantity(1);
    setNotes('');
    setErrors({});
  };

  return (
    <section id="order-section" className="py-16 md:py-24 bg-[#FAF7F0] border-b border-[#E3D6C2] relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="text-xs font-semibold text-[#7C2529] tracking-wider mb-2">
            خطوة واحدة نحو المراجعة المنظمة
          </div>
          <h2 className="font-serif-book text-3xl sm:text-4xl md:text-5xl font-bold text-[#2A1F18] text-balance">
            اطلب كتابك توّا
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#5C4D40]">
            عمّر معلوماتك في الاستمارة أدناه، والتوصيل يتم لكامل تراب الجمهورية التونسية مع الدفع عند الاستلام.
          </p>
          <div className="w-16 h-0.5 bg-[#C09540] mx-auto mt-4" />
        </div>

        {/* If Order is already placed successfully, show authentic receipt */}
        {submittedOrder ? (
          <div className="bg-[#FCFAF6] border-2 border-[#D8CABE] rounded-md p-6 sm:p-10 shadow-lg max-w-2xl mx-auto text-right space-y-6 animate-in zoom-in-95 duration-200">
            <div className="text-center pb-4 border-b border-[#EADCC8] space-y-2">
              <div className="w-14 h-14 bg-[#2D4A3E]/10 text-[#2D4A3E] rounded-full mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-serif-book text-2xl font-bold text-[#2A1F18]">
                يعطيك الصحة! تم تسجيل طلبك بنجاح
              </h3>
              <p className="text-xs sm:text-sm text-[#5C4D40]">
                رقم التوصيل الخاص بيك: <span className="font-mono font-bold text-[#7C2529]">{submittedOrder.orderId}</span>
              </p>
            </div>

            {/* Receipt Details Box */}
            <div className="bg-[#F6EFE3] p-5 rounded border border-[#DFD3C0] space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between py-1 border-b border-[#E8DEC9]">
                <span className="text-[#6E5D4F]">المستلم:</span>
                <span className="font-bold text-[#2A1F18]">{submittedOrder.fullName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E8DEC9]">
                <span className="text-[#6E5D4F]">رقم الهاتف الأساسي:</span>
                <span className="font-mono font-bold text-[#2A1F18] dir-ltr text-right">{submittedOrder.phoneNumber}</span>
              </div>
              {submittedOrder.secondPhoneNumber && (
                <div className="flex justify-between py-1 border-b border-[#E8DEC9]">
                  <span className="text-[#6E5D4F]">رقم هاتف ثانٍ:</span>
                  <span className="font-mono font-bold text-[#2A1F18] dir-ltr text-right">{submittedOrder.secondPhoneNumber}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-[#E8DEC9]">
                <span className="text-[#6E5D4F]">العنوان:</span>
                <span className="font-medium text-[#2A1F18]">{submittedOrder.address}، {submittedOrder.delegation}، {submittedOrder.governorateName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E8DEC9]">
                <span className="text-[#6E5D4F]">المنتج:</span>
                <span className="font-medium text-[#2A1F18]">{BOOK_DETAILS.title} ({submittedOrder.quantity} نسخة)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E8DEC9]">
                <span className="text-[#6E5D4F]">مصاريف التوصيل:</span>
                <span className="font-mono text-[#15803D] font-bold">
                  {submittedOrder.shippingCost === 0 ? 'مجاني (مشمول في السعر)' : `${submittedOrder.shippingCost} ${BOOK_DETAILS.currency}`}
                </span>
              </div>
              <div className="flex justify-between py-2 text-base font-bold text-[#7C2529]">
                <span>المبلغ الجملي عند الاستلام:</span>
                <span className="font-mono text-lg">{submittedOrder.totalAmount} {BOOK_DETAILS.currency}</span>
              </div>
            </div>

            {/* Next steps notice */}
            <div className="p-4 bg-[#FAF7F0] border-r-4 border-[#7C2529] text-xs text-[#524134] leading-relaxed">
              <strong>شنوة يصير توّا؟</strong>
              <p className="mt-1">
                سنتصل بك هاتفياً على الرقم <span className="font-mono font-semibold">{submittedOrder.phoneNumber}</span> لتأكيد العنوان وموعد التسليم. يرجى إبقاء هاتفك قريباً منك.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#EADCC8]">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full sm:w-auto vintage-button-secondary px-5 py-2.5 rounded-sm text-xs font-medium flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الوصل</span>
              </button>
              
              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto text-xs font-semibold text-[#7C2529] hover:underline flex items-center justify-center gap-1 cursor-pointer py-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>طلب نسخة أخرى</span>
              </button>
            </div>

          </div>
        ) : (
          /* Order Form and Product Summary Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Right: Product & Price Recap Card */}
            <div className="lg:col-span-5 bg-[#FCFAF6] border border-[#DACFBD] rounded-sm p-6 shadow-sm space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-20 h-24 rounded border border-[#D5C6AF] overflow-hidden bg-[#2C1914] shrink-0">
                  <img
                    src={BOOK_DETAILS.coverImage}
                    alt="غلاف الكتاب"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-[#7C2529]">باك اقتصاد وتصرف</div>
                  <h3 className="font-serif-book font-bold text-base text-[#2A1F18] leading-tight">
                    {BOOK_DETAILS.title}
                  </h3>
                  <p className="text-xs text-[#6C5B4E]">
                    ملخصات التاريخ والجغرافيا كاملة
                  </p>
                  <div className="pt-1 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold font-mono text-[#7C2529]">
                        {bookUnitPrice} {BOOK_DETAILS.currency}
                      </span>
                      <span className="text-xs text-[#6C5B4E]">سعر النسخة بمفردها</span>
                    </div>
                    <div className="text-[11px] text-[#1D7438] font-medium bg-[#EBF5EE] px-2 py-0.5 rounded border border-[#CDE5D4] inline-block w-fit">
                      48.9 د.ت مع التوصيل لكامل تراب الجمهورية
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Calculation Box */}
              <div className="border-t border-b border-[#EAE0D0] py-3 space-y-2 text-xs">
                <div className="flex justify-between text-[#5C4A3C]">
                  <span>سعر الكتاب ({quantity} {quantity > 1 ? 'نسخ' : 'نسخة'} × {bookUnitPrice} د.ت):</span>
                  <span className="font-mono tabular-nums font-semibold">{itemsTotal} {BOOK_DETAILS.currency}</span>
                </div>
                <div className="flex justify-between text-[#5C4A3C]">
                  <span>الكمية المطلوبة:</span>
                  <span className="font-mono tabular-nums">{quantity} {quantity > 1 ? 'نسخ' : 'نسخة'}</span>
                </div>
                <div className="flex justify-between text-[#5C4A3C]">
                  <div className="flex items-center gap-1.5">
                    <span>مصاريف التوصيل:</span>
                  </div>
                  <span className="font-mono tabular-nums font-bold text-[#2A1F18]">
                    {shippingFee} {BOOK_DETAILS.currency}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#2A1F18] pt-2 border-t border-[#EAE0D0]">
                  <span>المبلغ الجملي عند الاستلام:</span>
                  <span className="font-mono text-lg text-[#7C2529] tabular-nums font-black">{orderTotal} {BOOK_DETAILS.currency}</span>
                </div>
              </div>

              {/* Guarantees */}
              <div className="space-y-2.5 text-xs text-[#524134]">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#7C2529] shrink-0" />
                  <span>توصيل سريع لكافة المعتمديات التونسية</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#7C2529] shrink-0" />
                  <span>الدفع نقداً عند استلام الطرد بين يديك</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#7C2529] shrink-0" />
                  <span>تأكيد هاتفي مباشر قبل إرسال الشحنة</span>
                </div>
              </div>
            </div>

            {/* Left: The Order Form */}
            <div className="lg:col-span-7 bg-[#FCFAF6] border border-[#DACFBD] rounded-sm p-6 sm:p-8 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-[#35251B] mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#7C2529]" />
                    <span>الاسم واللقب *</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="مثال: محمد بن علي أو مريم الطرابلسي"
                    className={`w-full bg-[#FAF7F0] border ${errors.fullName ? 'border-[#B73225] bg-[#FFF5F5]' : 'border-[#D0C2AC]'} rounded-sm px-3.5 py-2.5 text-sm text-[#2A1F18] placeholder:text-[#A49483] focus:outline-none focus:border-[#7C2529] focus:ring-1 focus:ring-[#7C2529] transition-all`}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-[#B73225] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.fullName}</span>
                    </p>
                  )}
                </div>

                {/* Phone Numbers Grid (Primary + Optional Second Phone) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Primary Phone */}
                  <div>
                    <label className="block text-xs font-bold text-[#35251B] mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#7C2529]" />
                      <span>رقم الهاتف الأساسي *</span>
                    </label>
                    <input
                      type="tel"
                      dir="ltr"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="2X XXX XXX أو 9X XXX XXX"
                      className={`w-full text-right bg-[#FAF7F0] border ${errors.phoneNumber ? 'border-[#B73225] bg-[#FFF5F5]' : 'border-[#D0C2AC]'} rounded-sm px-3.5 py-2.5 text-sm text-[#2A1F18] placeholder:text-[#A49483] focus:outline-none focus:border-[#7C2529] focus:ring-1 focus:ring-[#7C2529] font-mono transition-all`}
                    />
                    {errors.phoneNumber ? (
                      <p className="mt-1 text-xs text-[#B73225] flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{errors.phoneNumber}</span>
                      </p>
                    ) : (
                      <p className="mt-1 text-[11px] text-[#7A6A5C]">
                        للاتصال بك وتأكيد التوصيل
                      </p>
                    )}
                  </div>

                  {/* Second Phone (Optional) */}
                  <div>
                    <label className="block text-xs font-bold text-[#35251B] mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#7C2529]" />
                        <span>رقم هاتف ثانٍ</span>
                      </span>
                      <span className="text-[10px] text-[#8C7A6B] font-normal bg-[#EAE0D0] px-1.5 py-0.5 rounded">اختياري</span>
                    </label>
                    <input
                      type="tel"
                      dir="ltr"
                      value={secondPhoneNumber}
                      onChange={(e) => setSecondPhoneNumber(e.target.value)}
                      placeholder="رقم الولي أو رقم ثانٍ"
                      className={`w-full text-right bg-[#FAF7F0] border ${errors.secondPhoneNumber ? 'border-[#B73225] bg-[#FFF5F5]' : 'border-[#D0C2AC]'} rounded-sm px-3.5 py-2.5 text-sm text-[#2A1F18] placeholder:text-[#A49483] focus:outline-none focus:border-[#7C2529] focus:ring-1 focus:ring-[#7C2529] font-mono transition-all`}
                    />
                    {errors.secondPhoneNumber ? (
                      <p className="mt-1 text-xs text-[#B73225] flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{errors.secondPhoneNumber}</span>
                      </p>
                    ) : (
                      <p className="mt-1 text-[11px] text-[#7A6A5C]">
                        في حال تعذّر الوصول للرقم الأول
                      </p>
                    )}
                  </div>
                </div>

                {/* Governorate and Delegation Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Governorate */}
                  <div>
                    <label className="block text-xs font-bold text-[#35251B] mb-1.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#7C2529]" />
                      <span>الولاية *</span>
                    </label>
                    <select
                      value={governorate}
                      onChange={(e) => {
                        setGovernorate(e.target.value);
                        setDelegation('');
                      }}
                      className="w-full bg-[#FAF7F0] border border-[#D0C2AC] rounded-sm px-3 py-2.5 text-sm text-[#2A1F18] focus:outline-none focus:border-[#7C2529] focus:ring-1 focus:ring-[#7C2529]"
                    >
                      {TUNISIAN_GOVERNORATES.map((gov) => (
                        <option key={gov.id} value={gov.id}>
                          {gov.nameAr} ({gov.nameFr})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Delegation / Area */}
                  <div>
                    <label className="block text-xs font-bold text-[#35251B] mb-1.5">
                      المعتمدية / المنطقة *
                    </label>
                    <input
                      type="text"
                      list="delegations-list"
                      value={delegation}
                      onChange={(e) => setDelegation(e.target.value)}
                      placeholder="مثال: المرسى، ساقية الزيت، حمام سوسة..."
                      className={`w-full bg-[#FAF7F0] border ${errors.delegation ? 'border-[#B73225] bg-[#FFF5F5]' : 'border-[#D0C2AC]'} rounded-sm px-3.5 py-2.5 text-sm text-[#2A1F18] placeholder:text-[#A49483] focus:outline-none focus:border-[#7C2529] focus:ring-1 focus:ring-[#7C2529]`}
                    />
                    <datalist id="delegations-list">
                      {selectedGov.delegations.map((del, i) => (
                        <option key={i} value={del} />
                      ))}
                    </datalist>
                    {errors.delegation && (
                      <p className="mt-1 text-xs text-[#B73225] flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{errors.delegation}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Full Address */}
                <div>
                  <label className="block text-xs font-bold text-[#35251B] mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#7C2529]" />
                    <span>العنوان الدقيق *</span>
                  </label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="النهج، رقم المنزل، الحي، أو أقرب مؤسسة معروفة (معهد، بلدية، جامع...)"
                    className={`w-full bg-[#FAF7F0] border ${errors.address ? 'border-[#B73225] bg-[#FFF5F5]' : 'border-[#D0C2AC]'} rounded-sm px-3.5 py-2 text-sm text-[#2A1F18] placeholder:text-[#A49483] focus:outline-none focus:border-[#7C2529] focus:ring-1 focus:ring-[#7C2529] resize-none`}
                  />
                  {errors.address && (
                    <p className="mt-1 text-xs text-[#B73225] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.address}</span>
                    </p>
                  )}
                </div>

                {/* Quantity & Extra Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-xs font-bold text-[#35251B] mb-1.5 flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-[#7C2529]" />
                      <span>الكمية (عدد النسخ) *</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 bg-[#EFE5D4] border border-[#D5C6AF] rounded-sm text-lg font-bold text-[#2A1F18] hover:bg-[#E3D5C0] flex items-center justify-center cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-mono text-base font-bold w-10 text-center text-[#2A1F18]">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 bg-[#EFE5D4] border border-[#D5C6AF] rounded-sm text-lg font-bold text-[#2A1F18] hover:bg-[#E3D5C0] flex items-center justify-center cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#35251B] mb-1.5">
                      ملاحظة إضافية (اختياري)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="أوقات تفضيل الاتصال، إلخ..."
                      className="w-full bg-[#FAF7F0] border border-[#D0C2AC] rounded-sm px-3 py-2 text-xs text-[#2A1F18] placeholder:text-[#A49483] focus:outline-none focus:border-[#7C2529]"
                    />
                  </div>
                </div>

                {/* Payment terms callout */}
                <div className="p-3 bg-[#F4EDE0] border border-[#DDD1BE] rounded-sm text-xs text-[#524134] flex items-center justify-between">
                  <span>طريقة الدفع:</span>
                  <span className="font-bold text-[#7C2529]">الدفع عند الاستلام</span>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full vintage-button py-3.5 rounded-sm text-base font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>جاري تسجيل طلبك...</span>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      <span>تأكيد الطلب ({orderTotal} {BOOK_DETAILS.currency})</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-[#7C6B5E] text-center">
                  بالضغط على "تأكيد الطلب"، سيتم الاتصال بك هاتفياً من طرف فريق التوزيع لتأكيد الإرسال.
                </p>

              </form>
            </div>

          </div>
        )}

      </div>
    </section>
  );
}
