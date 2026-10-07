import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Persistent orders file storage
const DATA_DIR = path.join(__dirname, 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(ORDERS_FILE)) {
      fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2), 'utf8');
    }
    if (!fs.existsSync(SETTINGS_FILE)) {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify({}, null, 2), 'utf8');
    }
  } catch (err) {
    console.error('Failed to initialize data files:', err);
  }
}
ensureDataFile();

function getShipperProductUuid() {
  try {
    ensureDataFile();
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
      if (data && data.shipperProductUuid) return data.shipperProductUuid;
    }
  } catch {}
  return process.env.SHIPPER_PRODUCT_UUID || null;
}

function setShipperProductUuid(uuid) {
  try {
    ensureDataFile();
    let data = {};
    if (fs.existsSync(SETTINGS_FILE)) {
      try { data = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8')); } catch {}
    }
    data.shipperProductUuid = uuid;
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch {
    return false;
  }
}

function readOrdersFromFile() {
  try {
    ensureDataFile();
    const raw = fs.readFileSync(ORDERS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading orders file:', err);
    return [];
  }
}

function writeOrdersToFile(orders) {
  try {
    ensureDataFile();
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing orders file:', err);
    return false;
  }
}

// API Routes for Orders
app.get('/api/orders', (req, res) => {
  const orders = readOrdersFromFile();
  res.json(orders);
});

app.post('/api/orders', (req, res) => {
  const newOrder = req.body;
  if (!newOrder || !newOrder.orderId || !newOrder.fullName || !newOrder.phoneNumber) {
    return res.status(400).json({ error: 'Missing required order fields' });
  }

  const orders = readOrdersFromFile();
  // Filter out any duplicate if same orderId exists
  const filtered = orders.filter(o => o.orderId !== newOrder.orderId);
  const updated = [newOrder, ...filtered];
  writeOrdersToFile(updated);

  // Automatically dispatch to Shipper API in background without blocking response
  autoDispatchToShipper(newOrder).catch(err => {
    console.warn('Shipper background dispatch error:', err.message);
  });

  res.status(201).json({ success: true, order: newOrder });
});

app.patch('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const orders = readOrdersFromFile();

  let targetOrder = null;
  const updated = orders.map(order => {
    if (order.orderId === id) {
      targetOrder = {
        ...order,
        ...(status ? { status } : {}),
        ...(notes !== undefined ? { notes } : {})
      };
      return targetOrder;
    }
    return order;
  });

  if (!targetOrder) {
    return res.status(404).json({ error: 'Order not found' });
  }

  writeOrdersToFile(updated);
  res.json({ success: true, order: targetOrder });
});

app.delete('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const orders = readOrdersFromFile();
  const updated = orders.filter(order => order.orderId !== id);
  writeOrdersToFile(updated);
  res.json({ success: true, message: 'Order deleted' });
});

app.delete('/api/orders', (req, res) => {
  writeOrdersToFile([]);
  res.json({ success: true, message: 'All orders cleared' });
});

// Shipper Network API Configuration
const SHIPPER_API_KEY = process.env.SHIPPER_API_KEY || '558795|zBHJkI2s2t1H8mtM7hK2heBtn35LQB3Yrs0LnyFF';
const SHIPPER_BASE_URL = process.env.SHIPPER_API_URL || 'https://server.shipper.network/api/v1';
const SHIPPER_DASHBOARD_URL = process.env.SHIPPER_DASHBOARD_URL || 'https://app.shipper.market/';

const GOV_MAP = {
  'تونس': 'Tunis',
  'أريانة': 'Ariana',
  'بن عروس': 'Ben Arous',
  'منوبة': 'La Manouba',
  'نابل': 'Nabeul',
  'بنزرت': 'Bizerte',
  'باجة': 'Béja',
  'جندوبة': 'Jendouba',
  'زغوان': 'Zaghouan',
  'سليانة': 'Siliana',
  'الكاف': 'Le Kef',
  'سوسة': 'Sousse',
  'المنستير': 'Monastir',
  'المهدية': 'Mahdia',
  'صفاقس': 'Sfax',
  'القيروان': 'Kairouan',
  'القصرين': 'Kasserine',
  'سيدي بوزيد': 'Sidi Bouzid',
  'قابس': 'Gabès',
  'مدنين': 'Médenine',
  'تطاوين': 'Tataouine',
  'قفصة': 'Gafsa',
  'توزر': 'Tozeur',
  'قبلي': 'Kébili'
};

/**
 * Automatically dispatch an order to Shipper via API key
 */
async function autoDispatchToShipper(order) {
  if (!order || !order.orderId || !order.fullName || !order.phoneNumber) {
    return { success: false, error: 'Missing required order fields' };
  }

  try {
    // 1. Get or detect Product UUID
    let productUuid = getShipperProductUuid();
    if (!productUuid) {
      try {
        const prodRes = await fetch(`${SHIPPER_BASE_URL}/products?per_page=10`, {
          headers: {
            'Authorization': `Bearer ${SHIPPER_API_KEY}`,
            'Accept': 'application/json'
          }
        });
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          if (Array.isArray(prodData.data) && prodData.data.length > 0) {
            productUuid = prodData.data[0].id || prodData.data[0].uuid;
            setShipperProductUuid(productUuid);
          }
        }
      } catch {}
    }

    if (!productUuid) {
      // Shipper API strictly requires an existing product UUID, otherwise it returns HTTP 500
      const orders = readOrdersFromFile();
      const updated = orders.map(o => o.orderId === order.orderId ? {
        ...o,
        shipperStatus: 'pending_product',
        shipperError: 'En attente d\'un produit dans votre compte Shipper (https://app.shipper.market/products)'
      } : o);
      writeOrdersToFile(updated);

      return {
        success: false,
        pendingProduct: true,
        error: 'Veuillez créer le produit dans https://app.shipper.market/products pour permettre à Shipper d\'enregistrer vos commandes.'
      };
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
          id: productUuid,
          quantity: order.quantity || 1,
          total_price: (order.bookPrice || 41) * (order.quantity || 1)
        }
      ],
      shipping_total: order.shippingCost ?? 8,
      is_cod: true,
      auto_fulfill: false,
      with_confirmation: true,
      store_name: 'كتاب ملخصات التاريخ والجغرافيا',
      external_order_id: order.orderId,
      external_order_url: SHIPPER_DASHBOARD_URL
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

    const shipperData = await shipperRes.json();

    if (shipperRes.ok && (shipperData.id || shipperData.order?.id)) {
      const shipperId = shipperData.id || shipperData.order?.id;
      const orders = readOrdersFromFile();
      const updated = orders.map(o => {
        if (o.orderId === order.orderId) {
          return {
            ...o,
            shipperStatus: 'synced',
            shipperOrderId: shipperId,
            shipperSyncedAt: Date.now()
          };
        }
        return o;
      });
      writeOrdersToFile(updated);

      return {
        success: true,
        shipperOrderId: shipperId,
        message: 'تم إرسال الطلبية تلقائياً إلى منصة Shipper'
      };
    } else {
      const errMsg = shipperData.message || (shipperData.errors ? JSON.stringify(shipperData.errors) : `HTTP ${shipperRes.status}`);
      const orders = readOrdersFromFile();
      const updated = orders.map(o => {
        if (o.orderId === order.orderId) {
          return {
            ...o,
            shipperStatus: 'failed',
            shipperError: errMsg
          };
        }
        return o;
      });
      writeOrdersToFile(updated);

      return {
        success: false,
        error: errMsg,
        details: shipperData
      };
    }
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

// Sync an order endpoint (can be called automatically or by system)
app.post('/api/shipper/sync', async (req, res) => {
  const result = await autoDispatchToShipper(req.body);
  return res.status(200).json(result);
});

// Configure Shipper Product UUID
app.post('/api/shipper/product-uuid', (req, res) => {
  const { uuid } = req.body;
  if (!uuid) return res.status(400).json({ error: 'UUID is required' });
  setShipperProductUuid(uuid.trim());

  // Automatically trigger dispatch on all pending orders
  const allOrders = readOrdersFromFile();
  const pendingOrders = allOrders.filter(o => o.shipperStatus !== 'synced');
  for (const pOrder of pendingOrders) {
    autoDispatchToShipper(pOrder).catch(() => {});
  }

  res.json({ success: true, productUuid: uuid.trim() });
});

// Check Shipper connection & statistics
app.get('/api/shipper/status', async (req, res) => {
  try {
    const ordersRes = await fetch(`${SHIPPER_BASE_URL}/orders?per_page=1`, {
      headers: {
        'Authorization': `Bearer ${SHIPPER_API_KEY}`,
        'Accept': 'application/json'
      }
    });

    if (!ordersRes.ok) {
      return res.status(ordersRes.status).json({
        connected: false,
        message: 'فشل الاتصال بـ Shipper',
        status: ordersRes.status
      });
    }

    const ordersData = await ordersRes.json();
    
    // Check products in account
    let productsList = [];
    let configuredUuid = getShipperProductUuid();
    try {
      const prodRes = await fetch(`${SHIPPER_BASE_URL}/products?per_page=50`, {
        headers: {
          'Authorization': `Bearer ${SHIPPER_API_KEY}`,
          'Accept': 'application/json'
        }
      });
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        productsList = Array.isArray(prodData.data) ? prodData.data : [];
        if (!configuredUuid && productsList.length > 0) {
          configuredUuid = productsList[0].id || productsList[0].uuid;
          setShipperProductUuid(configuredUuid);
        }
      }
    } catch {}

    // If we have a product UUID now, auto-dispatch any pending orders in background!
    if (configuredUuid) {
      const allOrders = readOrdersFromFile();
      const pendingOrders = allOrders.filter(o => o.shipperStatus !== 'synced');
      for (const pOrder of pendingOrders) {
        autoDispatchToShipper(pOrder).catch(() => {});
      }
    }

    res.json({
      connected: true,
      totalOrders: ordersData.pagination?.total ?? (Array.isArray(ordersData.data) ? ordersData.data.length : 0),
      productsCount: productsList.length,
      products: productsList,
      configuredProductUuid: configuredUuid,
      isReadyToSync: !!configuredUuid,
      message: productsList.length > 0
        ? 'متصل بنجاح مع منصة Shipper وجاهز لنقل الطلبيات'
        : 'حسابك في Shipper لا يحتوي على منتجات حالياً. أضف المنتج في app.shipper.market/products'
    });
  } catch (err) {
    res.status(500).json({
      connected: false,
      message: 'خطأ في الاتصال بسيرفر Shipper',
      error: err.message
    });
  }
});

// Fetch orders directly from Shipper
app.get('/api/shipper/orders', async (req, res) => {
  try {
    const apiRes = await fetch(`${SHIPPER_BASE_URL}/orders?per_page=50`, {
      headers: {
        'Authorization': `Bearer ${SHIPPER_API_KEY}`,
        'Accept': 'application/json'
      }
    });
    const data = await apiRes.json();
    res.status(apiRes.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch products from Shipper
app.get('/api/shipper/products', async (req, res) => {
  try {
    const apiRes = await fetch(`${SHIPPER_BASE_URL}/products?per_page=50`, {
      headers: {
        'Authorization': `Bearer ${SHIPPER_API_KEY}`,
        'Accept': 'application/json'
      }
    });
    const data = await apiRes.json();
    res.status(apiRes.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve static files from the built frontend dist folder
app.use(express.static(path.join(__dirname, 'dist')));

// Health check endpoint for Cloud Run / deployment liveness probes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Single Page Application (SPA) fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running with orders API at http://0.0.0.0:${PORT}`);
});
