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

function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(ORDERS_FILE)) {
      fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2), 'utf8');
    }
  } catch (err) {
    console.error('Failed to initialize orders file:', err);
  }
}
ensureDataFile();

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
