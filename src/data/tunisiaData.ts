import bookCoverImg from '../assets/images/book_cover.jpg';
import historyPreviewSvg from '../assets/images/preview_history_real.svg';
import geographyPreviewSvg from '../assets/images/preview_geography_real.svg';

export interface Governorate {
  id: string;
  nameAr: string;
  nameFr: string;
  delegations: string[];
}

export const TUNISIAN_GOVERNORATES: Governorate[] = [
  {
    id: "tunis",
    nameAr: "تونس",
    nameFr: "Tunis",
    delegations: ["تونس المدينة", "المرسى", "حلق الوادي", "الكرم", "باردو", "المنزه", "حي الخضراء", "باب سويقة", "سيدي البشير", "سيدي حسين", "الوردية", "الكبارية", "العمران", "العمرan الأعلى"]
  },
  {
    id: "ariana",
    nameAr: "أريانة",
    nameFr: "Ariana",
    delegations: ["أريانة المدينة", "سكرة", "رواد", "قلعة الأندلس", "سيدي ثابت", "المنيهلة", "التضامن"]
  },
  {
    id: "ben_arous",
    nameAr: "بن عروس",
    nameFr: "Ben Arous",
    delegations: ["بن عروس", "رادس", "مقرين", "المروج", "حمام الأنف", "حمام الشط", "الزهراء", "بومهل", "فوشانة", "المحمدية", "مرناق"]
  },
  {
    id: "manouba",
    nameAr: "منوبة",
    nameFr: "Manouba",
    delegations: ["منوبة", "دوار هيشر", "وادي الليل", "طبربة", "المرناقية", "الجديدة", "البطان", "برج العامري"]
  },
  {
    id: "nabeul",
    nameAr: "نابل",
    nameFr: "Nabeul",
    delegations: ["نابل", "الحمامات", "قليبية", "منزل تميم", "قرمبالية", "سليمان", "دار شعبان الفهري", "الهوارية", "بني خيار", "قربة", "تاكلسة", "بوعرقوب"]
  },
  {
    id: "zaghouan",
    nameAr: "زغوان",
    nameFr: "Zaghouan",
    delegations: ["زغوان", "الفحص", "الناظور", "بئر مشارقة", "الزريبة", "صواف"]
  },
  {
    id: "bizerte",
    nameAr: "بنزرت",
    nameFr: "Bizerte",
    delegations: ["بنزرت الشمالية", "بنزرت الجنوبية", "منزل بورقيبة", "ماطر", "رأس الجبل", "منزل جميل", "غار الملح", "تينجة", "العالية", "سجنان", "جومين", "غزالة"]
  },
  {
    id: "beja",
    nameAr: "باجة",
    nameFr: "Béja",
    delegations: ["باجة الشمالية", "باجة الجنوبية", "مجاز الباب", "تستور", "تبرسق", "نفزة", "عمدون", "قبلاط", "تيبار"]
  },
  {
    id: "jendouba",
    nameAr: "جندوبة",
    nameFr: "Jendouba",
    delegations: ["جندوبة", "جندوبة الشمالية", "طبرقة", "بوسالم", "عين دراهم", "غار الدماء", "فرنانة", "بلطة بوعوان", "وادي مليز"]
  },
  {
    id: "le_kef",
    nameAr: "الكاف",
    nameFr: "Le Kef",
    delegations: ["الكاف الغربية", "الكاف الشرقية", "تاجروين", "الدهماني", "ساقية سيدي يوسف", "القلعة الخصباء", "الجريصة", "نبر", "السرس", "القصور"]
  },
  {
    id: "siliana",
    nameAr: "سليانة",
    nameFr: "Siliana",
    delegations: ["سليانة الشمالية", "سليانة الجنوبية", "مكثر", "قعفور", "الكريب", "بورويس", "بوعرادة", "العروسة", "كسرى", "برقو"]
  },
  {
    id: "sousse",
    nameAr: "سوسة",
    nameFr: "Sousse",
    delegations: ["سوسة المدينة", "حمام سوسة", "سوسة جوهرة", "سوسة الرياض", "القلعة الكبرى", "القلعة الصغرى", "مساكن", "أكودة", "النفيضة", "بوفيشة", "سيدي بوعلي", "كندار"]
  },
  {
    id: "monastir",
    nameAr: "المنستير",
    nameFr: "Monastir",
    delegations: ["المنستير", "الساحلين", "الوردانين", "طبلبة", "قصر هلال", "المكنين", "صيادة لمطة بوحجر", "بنبلة", "جمال", "زرمدين", "بني حسان", "البقالطة"]
  },
  {
    id: "mahdia",
    nameAr: "المهدية",
    nameFr: "Mahdia",
    delegations: ["المهدية", "قصور الساف", "الجم", "الشابة", "سيدي علوان", "بومرداس", "أولاد الشامخ", "شربان", "هبيرة", "ملولش"]
  },
  {
    id: "sfax",
    nameAr: "صفاقس",
    nameFr: "Sfax",
    delegations: ["صفاقس المدينة", "صفاقس الغربية", "صفاقس الجنوبية", "ساقية الزيت", "ساقية الدائر", "طينة", "عقارب", "المحرس", "جبنيانة", "الحنشة", "منزل شاكر", "قرقنة", "الصخيرة"]
  },
  {
    id: "kairouan",
    nameAr: "القيروان",
    nameFr: "Kairouan",
    delegations: ["القيروان الشمالية", "القيروان الجنوبية", "بوحجلة", "السبيخة", "الوسلاتية", "حفوز", "الشبيكة", "العلا", "حاجب العيون", "نصر الله", "عين جلولة"]
  },
  {
    id: "kasserine",
    nameAr: "القصرين",
    nameFr: "Kasserine",
    delegations: ["القصرين الشمالية", "القصرين الجنوبية", "سبيطلة", "فوسانة", "فريانة", "تالة", "سبيبة", "ماجل بلعباس", "حيدرة", "حاسي الفريد", "العيون"]
  },
  {
    id: "sidi_bouzid",
    nameAr: "سيدي بوزيد",
    nameFr: "Sidi Bouzid",
    delegations: ["سيدي بوزيد الغربية", "سيدي بوزيد الشرقية", "الرقاب", "سيدي علي بن عون", "بئر الحفي", "المكناسي", "جلمة", "السبالة", "أولاد حفوز", "منزل بوزيان"]
  },
  {
    id: "gabes",
    nameAr: "قابس",
    nameFr: "Gabès",
    delegations: ["قابس المدينة", "قابس الغربية", "قابس الجنوبية", "الحامة", "مارث", "غنوش", "المطوية", "مطماطة", "مطماطة الجديدة", "منزل الحبيب"]
  },
  {
    id: "medenine",
    nameAr: "مدنين",
    nameFr: "Médenine",
    delegations: ["مدنين الشمالية", "مدنين الجنوبية", "جربة حومة السوق", "جربة ميدون", "جربة أجيم", "جرجيس", "بنقردان", "بني خداش", "سيدي مخلوف"]
  },
  {
    id: "tataouine",
    nameAr: "تطاوين",
    nameFr: "Tataouine",
    delegations: ["تطاوين الشمالية", "تطاوين الجنوبية", "غمراسن", "رمادة", "البئر الأحمر", "الصمار", "ذهيبة"]
  },
  {
    id: "gafsa",
    nameAr: "قفصة",
    nameFr: "Gafsa",
    delegations: ["قفصة المدينة", "قفصة الجنوبية", "المتلوي", "الرديف", "أم العرائس", "السند", "القطار", "بلخير", "المظيلة", "سيدي عيش"]
  },
  {
    id: "tozeur",
    nameAr: "توزر",
    nameFr: "Tozeur",
    delegations: ["توزر", "نفطة", "دقاش", "حامة الجريد", "تمغزة"]
  },
  {
    id: "kebili",
    nameAr: "قبلي",
    nameFr: "Kébili",
    delegations: ["قبلي الشمالية", "قبلي الجنوبية", "دوز الشمالية", "دوز الجنوبية", "سوق الأحد", "الفوار"]
  }
];

export const BOOK_DETAILS = {
  title: "كتاب الملخصات في التاريخ والجغرافيا",
  subtitle: "لباكالوريا اقتصاد وتصرف",
  stream: "باكالوريا اقتصاد وتصرف (Économie & Gestion)",
  subjects: "التاريخ والجغرافيا (Histoire & Géographie)",
  edition: "طبعة تحضيرية خاصة بالباكالوريا التونسية 2026",
  basePrice: 41,
  shippingCost: 8,
  singleShippingCost: 8,
  multiShippingCost: 7,
  currency: "د.ت",
  author: "محمد أمين حسايني",
  coverImage: bookCoverImg,
  historyPreviewImage: historyPreviewSvg,
  geographyPreviewImage: geographyPreviewSvg,
  featuresCount: 4,
  totalPagesApprox: "140 صفحة منظمة ومطبوعة بجودة ممتازة",
  deliveryNote: "الدفع عند الاستلام - سعر الكتاب 41 د.ت (49 د.ت مع التوصيل، وعند طلب نسختين 89 د.ت فقط)",
  supportPhone: "98 123 456",
  whatsappNumber: "+21698123456",
  instagramUrl: "https://www.instagram.com/talakhis_amin/",
  facebookUrl: "https://www.facebook.com/friends/requests/?profile_id=61594593909694"
};
