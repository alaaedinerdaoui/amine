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

  return {
    name: 'orders-api-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
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
