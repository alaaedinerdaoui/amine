// Serverless API route for Shipper on Vercel

const SHIPPER_API_KEY = process.env.SHIPPER_API_KEY || '558795|zBHJkI2s2t1H8mtM7hK2heBtn35LQB3Yrs0LnyFF';
const SHIPPER_BASE_URL = process.env.SHIPPER_API_URL || 'https://app.shipper.market/api';
const SHIPPER_DASHBOARD_URL = process.env.SHIPPER_DASHBOARD_URL || 'https://app.shipper.market/';

const GOV_MAP = {
  'تونس': 'Tunis', 'أريانة': 'Ariana', 'بن عروس': 'Ben Arous', 'منوبة': 'La Manouba',
  'نابل': 'Nabeul', 'بنزرت': 'Bizerte', 'باجة': 'Béja', 'جندوبة': 'Jendouba',
  'زغوان': 'Zaghouan', 'سليانة': 'Siliana', 'الكاف': 'Le Kef', 'سوسة': 'Sousse',
  'المنستير': 'Monastir', 'المهدية': 'Mahdia', 'صفاقس': 'Sfax', 'القيروان': 'Kairouan',
  'القصرين': 'Kasserine', 'سيدي بوزيد': 'Sidi Bouzid', 'قابس': 'Gabès', 'مدنين': 'Médenine',
  'تطاوين': 'Tataouine', 'قفصة': 'Gafsa', 'توزر': 'Tozeur', 'قبلي': 'Kébili'
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  // Check connection status
  if (req.method === 'GET' && (!action || action === 'status')) {
    try {
      const apiRes = await fetch(`${SHIPPER_BASE_URL}/orders?per_page=1`, {
        headers: { 'Authorization': `Bearer ${SHIPPER_API_KEY}`, 'Accept': 'application/json' }
      });
      if (!apiRes.ok) {
        return res.status(apiRes.status).json({ connected: false, message: 'تعذر الاتصال بـ Shipper' });
      }
      const data = await apiRes.json();
      return res.status(200).json({
        connected: true,
        totalOrders: data.pagination?.total ?? 0,
        message: 'متصل بنجاح مع منصة Shipper'
      });
    } catch (e) {
      return res.status(500).json({ connected: false, error: e.message });
    }
  }

  // Fetch Shipper orders
  if (req.method === 'GET' && action === 'orders') {
    try {
      const apiRes = await fetch(`${SHIPPER_BASE_URL}/orders?per_page=50`, {
        headers: { 'Authorization': `Bearer ${SHIPPER_API_KEY}`, 'Accept': 'application/json' }
      });
      const data = await apiRes.json();
      return res.status(apiRes.status).json(data);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // Sync / create order on Shipper
  if (req.method === 'POST') {
    try {
      const order = req.body;
      if (!order || !order.orderId || !order.fullName) {
        return res.status(400).json({ error: 'Missing order details' });
      }

      const cleanGov = (order.governorateName || '').trim();
      const shipperDivision1 = GOV_MAP[cleanGov] || cleanGov || 'Tunis';
      const cleanPhone = (order.phoneNumber || '').replace(/[^0-9]/g, '');
      const cleanPhone2 = order.secondPhoneNumber ? (order.secondPhoneNumber || '').replace(/[^0-9]/g, '') : null;

      const payload = {
        address: {
          name: order.fullName,
          division_1: shipperDivision1,
          division_2: order.delegation || null,
          phone1: cleanPhone,
          phone2: cleanPhone2 || null,
          address1: order.address,
          address2: null,
          country: 'TN'
        },
        items: [
          {
            quantity: order.quantity || 1,
            total_price: Number(((order.bookPrice || 39.9) * (order.quantity || 1)).toFixed(1))
          }
        ],
        shipping_total: order.shippingCost ?? 9,
        is_cod: true,
        auto_fulfill: false,
        with_confirmation: true,
        store_name: 'كتاب ملخصات التاريخ والجغرافيا',
        external_order_id: order.orderId
      };

      const shipperRes = await fetch(`${SHIPPER_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SHIPPER_API_KEY}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await shipperRes.json();
      if (shipperRes.ok && (data.id || data.order?.id)) {
        return res.status(200).json({ success: true, shipperOrderId: data.id || data.order?.id });
      } else {
        return res.status(shipperRes.status).json({ success: false, error: data.message || 'Shipper API error', details: data });
      }
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
