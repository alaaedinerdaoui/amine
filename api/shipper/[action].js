// Vercel serverless route: /api/shipper/sync | /api/shipper/status | /api/shipper/orders
// Replaces api/shipper.js (delete that file).
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

export default async function handler(req, res) {
  const { action } = req.query;

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
          // Shipper matches delegations by their Latin name. Arabic names may not
          // match, so the delegation is also written into the address text below
          // to make sure the courier always sees it.
          division_2: null,
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
      return res.status(200).json({
        connected: true,
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
