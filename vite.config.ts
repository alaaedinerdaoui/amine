import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, Plugin} from 'vite';

function ordersApiPlugin(): Plugin {
  const ordersFile = path.resolve(process.cwd(), 'data', 'orders.json');
  
  const readOrders = () => {
    try {
      if (!fs.existsSync(ordersFile)) {
        fs.mkdirSync(path.dirname(ordersFile), { recursive: true });
        fs.writeFileSync(ordersFile, JSON.stringify([], null, 2), 'utf8');
      }
      return JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
    } catch {
      return [];
    }
  };

  const writeOrders = (orders: any[]) => {
    try {
      fs.mkdirSync(path.dirname(ordersFile), { recursive: true });
      fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2), 'utf8');
    } catch (e) {
      console.error('Failed to write orders in dev server:', e);
    }
  };

  const SHIPPER_API_KEY = process.env.SHIPPER_API_KEY || '558795|zBHJkI2s2t1H8mtM7hK2heBtn35LQB3Yrs0LnyFF';
  const SHIPPER_BASE_URL = 'https://server.shipper.network/api/v1';
  const SHIPPER_DASHBOARD_URL = 'https://app.shipper.market/';

  const GOV_MAP: Record<string, string> = {
    'تونس': 'Tunis', 'أريانة': 'Ariana', 'بن عروس': 'Ben Arous', 'منوبة': 'La Manouba',
    'نابل': 'Nabeul', 'بنزرت': 'Bizerte', 'باجة': 'Béja', 'جندوبة': 'Jendouba',
    'زغوان': 'Zaghouan', 'سليانة': 'Siliana', 'الكاف': 'Le Kef', 'سوسة': 'Sousse',
    'المنستير': 'Monastir', 'المهدية': 'Mahdia', 'صفاقس': 'Sfax', 'القيروان': 'Kairouan',
    'القصرين': 'Kasserine', 'سيدي بوزيد': 'Sidi Bouzid', 'قابس': 'Gabès', 'مدنين': 'Médenine',
    'تطاوين': 'Tataouine', 'قفصة': 'Gafsa', 'توزر': 'Tozeur', 'قبلي': 'Kébili'
  };

  return {
    name: 'orders-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Shipper Status
        if (req.url === '/api/shipper/status') {
          res.setHeader('Content-Type', 'application/json');
          try {
            const apiRes = await fetch(`${SHIPPER_BASE_URL}/orders?per_page=1`, {
              headers: { 'Authorization': `Bearer ${SHIPPER_API_KEY}`, 'Accept': 'application/json' }
            });
            if (!apiRes.ok) {
              res.statusCode = apiRes.status;
              res.end(JSON.stringify({ connected: false, message: 'تعذر الاتصال بـ Shipper', status: apiRes.status }));
              return;
            }
            const data = await apiRes.json();

            let productsList = [];
            try {
              const pRes = await fetch(`${SHIPPER_BASE_URL}/products?per_page=50`, {
                headers: { 'Authorization': `Bearer ${SHIPPER_API_KEY}`, 'Accept': 'application/json' }
              });
              if (pRes.ok) {
                const pData = await pRes.json();
                productsList = Array.isArray(pData.data) ? pData.data : [];
              }
            } catch {}

            res.end(JSON.stringify({
              connected: true,
              totalOrders: data.pagination?.total ?? (Array.isArray(data.data) ? data.data.length : 0),
              productsCount: productsList.length,
              products: productsList,
              isReadyToSync: productsList.length > 0,
              message: productsList.length > 0
                ? 'متصل بنجاح مع منصة Shipper وجاهز لنقل الطلبيات'
                : 'حسابك في Shipper لا يحتوي على منتجات حالياً. أضف المنتج في app.shipper.market/products'
            }));
          } catch (e: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ connected: false, error: e.message }));
          }
          return;
        }

        // Shipper Orders
        if (req.url?.startsWith('/api/shipper/orders')) {
          res.setHeader('Content-Type', 'application/json');
          try {
            const apiRes = await fetch(`${SHIPPER_BASE_URL}/orders?per_page=50`, {
              headers: { 'Authorization': `Bearer ${SHIPPER_API_KEY}`, 'Accept': 'application/json' }
            });
            const data = await apiRes.json();
            res.statusCode = apiRes.status;
            res.end(JSON.stringify(data));
          } catch (e: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
          return;
        }

        // Shipper Products
        if (req.url?.startsWith('/api/shipper/products')) {
          res.setHeader('Content-Type', 'application/json');
          try {
            const apiRes = await fetch(`${SHIPPER_BASE_URL}/products?per_page=50`, {
              headers: { 'Authorization': `Bearer ${SHIPPER_API_KEY}`, 'Accept': 'application/json' }
            });
            const data = await apiRes.json();
            res.statusCode = apiRes.status;
            res.end(JSON.stringify(data));
          } catch (e: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
          return;
        }

        // Shipper Sync
        if (req.url === '/api/shipper/sync' && req.method === 'POST') {
          res.setHeader('Content-Type', 'application/json');
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const order = body ? JSON.parse(body) : {};
              if (!order.orderId || !order.fullName) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Missing order fields' }));
                return;
              }

              // Check existing product
              let productUuid = null;
              try {
                const prodRes = await fetch(`${SHIPPER_BASE_URL}/products?per_page=1`, {
                  headers: { 'Authorization': `Bearer ${SHIPPER_API_KEY}`, 'Accept': 'application/json' }
                });
                if (prodRes.ok) {
                  const pData = await prodRes.json();
                  if (Array.isArray(pData.data) && pData.data.length > 0) {
                    productUuid = pData.data[0].id || pData.data[0].uuid;
                  }
                }
              } catch {}

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
                    total_price: (order.bookPrice || 41) * (order.quantity || 1),
                    ...(productUuid ? { id: productUuid } : {})
                  }
                ],
                shipping_total: order.shippingCost ?? 8,
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

              const sData = await shipperRes.json();
              if (shipperRes.ok && (sData.id || sData.order?.id)) {
                const sId = sData.id || sData.order?.id;
                // Mark locally in orders.json
                const allOrders = readOrders();
                const updated = allOrders.map((o: any) => o.orderId === order.orderId ? { ...o, shipperStatus: 'synced', shipperOrderId: sId, shipperSyncedAt: Date.now() } : o);
                writeOrders(updated);

                res.end(JSON.stringify({ success: true, shipperOrderId: sId, message: 'تم إرسال الطلبية إلى منصة Shipper' }));
              } else {
                const errMsg = sData.message || (sData.errors ? JSON.stringify(sData.errors) : `HTTP ${shipperRes.status}`);
                const allOrders = readOrders();
                const updated = allOrders.map((o: any) => o.orderId === order.orderId ? { ...o, shipperStatus: 'failed', shipperError: errMsg } : o);
                writeOrders(updated);

                res.statusCode = shipperRes.status;
                res.end(JSON.stringify({ success: false, error: errMsg, details: sData }));
              }
            } catch (err: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        if (!req.url?.startsWith('/api/orders')) {
          return next();
        }

        res.setHeader('Content-Type', 'application/json');

        if (req.method === 'GET') {
          const orders = readOrders();
          res.end(JSON.stringify(orders));
          return;
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const data = body ? JSON.parse(body) : {};
            const orders = readOrders();

            if (req.method === 'POST') {
              if (!data.orderId || !data.fullName) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Missing required fields' }));
                return;
              }
              const updated = [data, ...orders.filter((o: any) => o.orderId !== data.orderId)];
              writeOrders(updated);
              res.statusCode = 201;
              res.end(JSON.stringify({ success: true, order: data }));
              return;
            }

            if (req.method === 'PATCH') {
              const urlParts = req.url!.split('/');
              const id = urlParts[3] || data.orderId;
              let target: any = null;
              const updated = orders.map((o: any) => {
                if (o.orderId === id) {
                  target = { ...o, ...(data.status ? { status: data.status } : {}), ...(data.notes !== undefined ? { notes: data.notes } : {}) };
                  return target;
                }
                return o;
              });
              if (!target) {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'Not found' }));
                return;
              }
              writeOrders(updated);
              res.end(JSON.stringify({ success: true, order: target }));
              return;
            }

            if (req.method === 'DELETE') {
              const urlParts = req.url!.split('/');
              const id = urlParts[3];
              if (id) {
                const updated = orders.filter((o: any) => o.orderId !== id);
                writeOrders(updated);
              } else {
                writeOrders([]);
              }
              res.end(JSON.stringify({ success: true }));
              return;
            }
          } catch (err: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
            return;
          }

          next();
        });
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), ordersApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
