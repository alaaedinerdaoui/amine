// Shared Shipper proxy logic, used by api/shipper/sync.js, status.js and orders.js.
// Files starting with "_" are not deployed as routes by Vercel. Plain file names
// are used on purpose: a dynamic route like api/shipper/[action].js loses to the
// catch-all rewrite in vercel.json and never runs.
//
// Optional Vercel env vars: SHIPPER_API_KEY, SHIPPER_PRODUCT_UUID.
// Without SHIPPER_PRODUCT_UUID the first product in the Shipper account is used
// (or its first variant, since products with variants must be ordered by variant).

const SHIPPER_API_KEY = process.env.SHIPPER_API_KEY || '558795|zBHJkI2s2t1H8mtM7hK2heBtn35LQB3Yrs0LnyFF';
const SHIPPER_BASE_URL = 'https://server.shipper.network/api/v1';

const GOV_MAP = {
  'تونس': 'Tunis', 'أريانة': 'Ariana', 'بن عروس': 'Ben Arous', 'منوبة': 'La Manouba',
  'نابل': 'Nabeul', 'بنزرت': 'Bizerte', 'باجة': 'Béja', 'جندوبة': 'Jendouba',
  'زغوان': 'Zaghouan', 'سليانة': 'Siliana', 'الكاف': 'Le Kef', 'سوسة': 'Sousse',
  'المنستير': 'Monastir', 'المهدية': 'Mahdia', 'صفاقس': 'Sfax', 'القيروان': 'Kairouan',
  'القصرين': 'Kasserine', 'سيدي بوزيد': 'Sidi Bouzid', 'قابس': 'Gabès', 'مدنين': 'Médenine',
  'تطاوين': 'Tataouine', 'قفصة': 'Gafsa', 'توزر': 'Tozeur', 'قبلي': 'Kébili'
};

// Arabic delegation (as shown in the order form) -> Shipper delegation name, per governorate.
// Delegations not listed here are sent without division_2 (still written in the address text).
const DELEGATION_MAP = {
  "تونس": {"تونس المدينة": "La Medina", "المرسى": "La Marsa", "حلق الوادي": "La Goulette", "الكرم": "El Kram", "باردو": "Le Bardo", "المنزه": "El Menzah", "حي الخضراء": "Cite El Khadra", "باب سويقة": "Bab Souika", "سيدي البشير": "Sidi El Bechir", "سيدي حسين": "Sidi Hassine", "الوردية": "El Ouerdia", "الكبارية": "El Kabbaria", "العمران": "El Omrane", "العمرan الأعلى": "El Omrane Superieur"},
  "أريانة": {"أريانة المدينة": "Ariana Ville", "سكرة": "La Soukra", "رواد": "Raoued", "قلعة الأندلس": "Kalaat Landlous", "سيدي ثابت": "Sidi Thabet", "المنيهلة": "Mnihla", "التضامن": "Ettadhamen"},
  "بن عروس": {"بن عروس": "Ben Arous", "رادس": "Rades", "مقرين": "Megrine", "المروج": "El Mourouj", "حمام الأنف": "Hammam Lif", "حمام الشط": "Hammam Chatt", "الزهراء": "Ezzahra", "بومهل": "Bou Mhel El Bassatine", "فوشانة": "Fouchana", "المحمدية": "Mohamadia", "مرناق": "Mornag"},
  "منوبة": {"منوبة": "Mannouba", "دوار هيشر": "Douar Hicher", "وادي الليل": "Oued Ellil", "طبربة": "Tebourba", "المرناقية": "Mornaguia", "الجديدة": "Jedaida", "البطان": "El Battan", "برج العامري": "Borj El Amri"},
  "نابل": {"نابل": "Nabeul", "الحمامات": "Hammamet", "قليبية": "Kelibia", "منزل تميم": "Menzel Temime", "قرمبالية": "Grombalia", "سليمان": "Soliman", "دار شعبان الفهري": "Dar Chaabane Elfehri", "الهوارية": "El Haouaria", "بني خيار": "Beni Khiar", "قربة": "Korba", "تاكلسة": "Takelsa", "بوعرقوب": "Bou Argoub"},
  "زغوان": {"زغوان": "Zaghouan", "الفحص": "El Fahs", "الناظور": "Ennadhour", "بئر مشارقة": "Bir Mcherga", "الزريبة": "Hammam Zriba", "صواف": "Saouef"},
  "بنزرت": {"بنزرت الشمالية": "Bizerte Nord", "بنزرت الجنوبية": "Bizerte Sud", "منزل بورقيبة": "Menzel Bourguiba", "ماطر": "Mateur", "رأس الجبل": "Ras Jebel", "منزل جميل": "Menzel Jemil", "غار الملح": "Ghar El Melh", "تينجة": "Tinja", "العالية": "El Alia", "سجنان": "Sejnane", "جومين": "Joumine", "غزالة": "Ghezala"},
  "باجة": {"باجة الشمالية": "Beja Nord", "باجة الجنوبية": "Beja Sud", "مجاز الباب": "Mejez El Bab", "تستور": "Testour", "تبرسق": "Teboursouk", "نفزة": "Nefza", "عمدون": "Amdoun", "قبلاط": "Goubellat", "تيبار": "Thibar"},
  "جندوبة": {"جندوبة": "Jendouba", "جندوبة الشمالية": "Jendouba Nord", "طبرقة": "Tabarka", "بوسالم": "Bou Salem", "عين دراهم": "Ain Draham", "غار الدماء": "Ghardimaou", "فرنانة": "Fernana", "بلطة بوعوان": "Balta Bou Aouene", "وادي مليز": "Oued Mliz"},
  "الكاف": {"الكاف الغربية": "Le Kef Ouest", "الكاف الشرقية": "Le Kef Est", "تاجروين": "Tajerouine", "الدهماني": "Dahmani", "ساقية سيدي يوسف": "Sakiet Sidi Youssef", "القلعة الخصباء": "Kalaa El Khasba", "الجريصة": "Jerissa", "نبر": "Nebeur", "السرس": "Le Sers", "القصور": "El Ksour"},
  "سليانة": {"سليانة الشمالية": "Siliana Nord", "سليانة الجنوبية": "Siliana Sud", "مكثر": "Makthar", "قعفور": "Gaafour", "الكريب": "Le Krib", "بورويس": "Sidi Bou Rouis", "بوعرادة": "Bou Arada", "العروسة": "El Aroussa", "كسرى": "Kesra", "برقو": "Bargou"},
  "سوسة": {"سوسة المدينة": "Sousse Ville", "حمام سوسة": "Hammam Sousse", "سوسة جوهرة": "Sousse Jaouhara", "سوسة الرياض": "Sousse Riadh", "القلعة الكبرى": "Kalaa El Kebira", "القلعة الصغرى": "Kalaa Essghira", "مساكن": "Msaken", "أكودة": "Akouda", "النفيضة": "Enfidha", "بوفيشة": "Bou Ficha", "سيدي بوعلي": "Sidi Bou Ali", "كندار": "Kondar"},
  "المنستير": {"المنستير": "Monastir", "الساحلين": "Sahline", "الوردانين": "Ouerdanine", "طبلبة": "Teboulba", "قصر هلال": "Ksar Helal", "المكنين": "Moknine", "صيادة لمطة بوحجر": "Sayada Lamta Bou Hajar", "بنبلة": "Bembla", "جمال": "Jemmal", "زرمدين": "Zeramdine", "بني حسان": "Beni Hassen", "البقالطة": "Bekalta"},
  "المهدية": {"المهدية": "Mahdia", "قصور الساف": "Ksour Essaf", "الجم": "El Jem", "الشابة": "La Chebba", "سيدي علوان": "Sidi Alouene", "بومرداس": "Bou Merdes", "أولاد الشامخ": "Ouled Chamakh", "شربان": "Chorbane", "هبيرة": "Hbira", "ملولش": "Melloulech"},
  "صفاقس": {"صفاقس المدينة": "Sfax Ville", "صفاقس الجنوبية": "Sfax Sud", "عقارب": "Agareb", "المحرس": "Mahras", "جبنيانة": "Jebeniana", "الحنشة": "El Hencha", "منزل شاكر": "Menzel Chaker", "قرقنة": "Kerkenah", "الصخيرة": "Esskhira", "ساقية الزيت": "Sakiet Ezzit", "ساقية الدائر": "Sakiet Eddaier"},
  "القيروان": {"القيروان الشمالية": "Kairouan Nord", "القيروان الجنوبية": "Kairouan Sud", "بوحجلة": "Bou Hajla", "السبيخة": "Sbikha", "الوسلاتية": "Oueslatia", "حفوز": "Haffouz", "الشبيكة": "Chebika", "العلا": "El Ala", "حاجب العيون": "Hajeb El Ayoun", "نصر الله": "Nasrallah"},
  "القصرين": {"القصرين الشمالية": "Kasserine Nord", "القصرين الجنوبية": "Kasserine Sud", "سبيطلة": "Sbeitla", "فوسانة": "Foussana", "فريانة": "Feriana", "تالة": "Thala", "سبيبة": "Sbiba", "ماجل بلعباس": "Mejel Bel Abbes", "حيدرة": "Haidra", "حاسي الفريد": "Hassi El Frid", "العيون": "El Ayoun"},
  "سيدي بوزيد": {"سيدي بوزيد الغربية": "Sidi Bouzid Ouest", "سيدي بوزيد الشرقية": "Sidi Bouzid Est", "الرقاب": "Regueb", "سيدي علي بن عون": "Ben Oun", "بئر الحفي": "Bir El Haffey", "المكناسي": "Maknassy", "جلمة": "Jilma", "السبالة": "Cebbala", "أولاد حفوز": "Ouled Haffouz", "منزل بوزيان": "Menzel Bouzaiene"},
  "قابس": {"قابس المدينة": "Gabes Medina", "قابس الغربية": "Gabes Ouest", "قابس الجنوبية": "Gabes Sud", "الحامة": "El Hamma", "مارث": "Mareth", "غنوش": "Ghannouche", "المطوية": "El Metouia", "مطماطة": "Matmata", "مطماطة الجديدة": "Nouvelle Matmata", "منزل الحبيب": "Menzel Habib"},
  "مدنين": {"مدنين الشمالية": "Medenine Nord", "مدنين الجنوبية": "Medenine Sud", "جربة حومة السوق": "Houmet Essouk", "جربة ميدون": "Midoun", "جربة أجيم": "Ajim", "جرجيس": "Zarzis", "بنقردان": "Ben Guerdane", "بني خداش": "Beni Khedache", "سيدي مخلوف": "Sidi Makhlouf"},
  "تطاوين": {"تطاوين الشمالية": "Tataouine Nord", "تطاوين الجنوبية": "Tataouine Sud", "غمراسن": "Ghomrassen", "رمادة": "Remada", "البئر الأحمر": "Bir Lahmar", "الصمار": "Smar", "ذهيبة": "Dhehiba"},
  "قفصة": {"قفصة الجنوبية": "Gafsa Sud", "المتلوي": "Metlaoui", "الرديف": "Redeyef", "أم العرائس": "Moulares", "السند": "Sned", "القطار": "El Guettar", "بلخير": "Belkhir", "المظيلة": "El Mdhilla", "سيدي عيش": "Sidi Aich"},
  "توزر": {"توزر": "Tozeur", "نفطة": "Nefta", "دقاش": "Degueche", "تمغزة": "Tameghza"},
  "قبلي": {"قبلي الشمالية": "Kebili Nord", "قبلي الجنوبية": "Kebili Sud", "دوز الشمالية": "Douz", "دوز الجنوبية": "Douz", "سوق الأحد": "Souk El Ahad", "الفوار": "El Faouar"}
};

function shipper(path, options = {}) {
  return fetch(`${SHIPPER_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${SHIPPER_API_KEY}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
}

function orderableUuid(product) {
  if (!product) return null;
  const variants = product.variants || [];
  return variants.length > 0 ? variants[0].uuid : product.uuid;
}

// The book "كتاب ملخصات التاريخ والجغرافيا" in the Shipper account
let cachedProductUuid = process.env.SHIPPER_PRODUCT_UUID || '698815a9-9a80-46ae-8eca-231ce87cff8d';
async function getProductUuid() {
  if (cachedProductUuid) return cachedProductUuid;
  const r = await shipper('/products?per_page=1');
  if (!r.ok) return null;
  const data = await r.json().catch(() => ({}));
  cachedProductUuid = orderableUuid(Array.isArray(data.data) ? data.data[0] : null);
  return cachedProductUuid;
}

export async function handleShipper(action, req, res) {

  try {
    // Create the order on Shipper (called by the public checkout)
    if (action === 'sync' && req.method === 'POST') {
      const order = req.body || {};
      if (!order.orderId || !order.fullName || !order.phoneNumber || !order.address) {
        return res.status(400).json({ success: false, error: 'Missing order fields' });
      }
      const productUuid = await getProductUuid();
      if (!productUuid) {
        return res.status(500).json({ success: false, error: 'No product found in the Shipper account' });
      }

      const governorate = (order.governorateName || '').trim();
      const delegation = (order.delegation || '').trim();
      const quantity = Number(order.quantity) || 1;
      const digits = (v) => (v || '').replace(/[^0-9]/g, '');

      const payload = {
        address: {
          name: order.fullName,
          country: 'TN',
          division_1: GOV_MAP[governorate] || governorate || null,
          // Shipper matches delegations by their Latin name; the delegation is also
          // kept in the address text so the courier always sees it.
          division_2: DELEGATION_MAP[governorate]?.[delegation] || null,
          phone1: digits(order.phoneNumber),
          phone2: digits(order.secondPhoneNumber) || null,
          address1: delegation ? `${delegation} - ${order.address}` : order.address,
          address2: null
        },
        items: [{
          id: productUuid,
          quantity,
          total_price: Number((Number(order.bookPrice) * quantity).toFixed(3))
        }],
        shipping_total: Number(order.shippingCost) || 0,
        is_cod: true,
        auto_fulfill: false,
        with_confirmation: true,
        store_name: 'كتاب ملخصات التاريخ والجغرافيا',
        external_order_id: String(order.orderId)
      };

      const r = await shipper('/orders', { method: 'POST', body: JSON.stringify(payload) });
      const data = await r.json().catch(() => ({}));
      if (r.ok && data.id) {
        return res.status(200).json({ success: true, shipperOrderId: data.id });
      }
      console.error('Shipper order rejected', r.status, data);
      return res.status(r.status || 502).json({
        success: false,
        error: data.message || data.error || `Shipper HTTP ${r.status}`,
        details: data.errors || data
      });
    }

    // Connection check + product list (used by the admin dashboard)
    if (action === 'status' && req.method === 'GET') {
      const r = await shipper('/products?per_page=50');
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        return res.status(r.status).json({ connected: false, status: r.status, error: data.message });
      }
      const products = Array.isArray(data.data) ? data.data : [];
      const ordersRes = await shipper('/orders?per_page=1');
      const ordersData = ordersRes.ok ? await ordersRes.json().catch(() => ({})) : {};
      return res.status(200).json({
        connected: true,
        totalOrders: ordersData.pagination?.total,
        productsCount: products.length,
        products: products.map((p) => ({
          uuid: p.uuid,
          name: p.name,
          variants: (p.variants || []).map((v) => ({ uuid: v.uuid, name: v.name }))
        })),
        configuredProductUuid: cachedProductUuid || orderableUuid(products[0]),
        isReadyToSync: products.length > 0,
        message: products.length > 0
          ? 'متصل بنجاح مع منصة Shipper وجاهز لنقل الطلبيات'
          : 'حسابك في Shipper لا يحتوي على منتجات حالياً. أضف المنتج في app.shipper.market/products'
      });
    }

    // Latest orders on Shipper (used by the admin dashboard)
    if (action === 'orders' && req.method === 'GET') {
      const r = await shipper('/orders?per_page=50');
      const data = await r.json().catch(() => ({}));
      return res.status(r.status).json(data);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('Shipper proxy error', e);
    return res.status(500).json({ success: false, error: e.message });
  }
}
