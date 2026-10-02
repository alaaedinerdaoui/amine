export interface Order {
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
  status: 'new' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
  notes?: string;
  createdAt: number;
}

const STORAGE_KEY = 'bac_book_orders';

// Legacy sample IDs that must be completely purged from browser caches
const LEGACY_SAMPLE_IDS = new Set(['BAC-741290', 'BAC-892144', 'BAC-632018']);
const LEGACY_SAMPLE_NAMES = new Set(['ياسين الماجري', 'مريم بن سالم', 'أحمد التونسي']);

/**
 * Filter out any mock/legacy sample orders from existing browser cache
 */
function cleanSampleOrders(orders: Order[]): Order[] {
  return orders.filter(o => 
    !LEGACY_SAMPLE_IDS.has(o.orderId) && 
    !LEGACY_SAMPLE_NAMES.has(o.fullName)
  );
}

/**
 * Retrieve current orders from localStorage (purging any legacy mock users)
 */
export function getStoredOrders(): Order[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    
    // Purge any legacy sample data
    const cleaned = cleanSampleOrders(parsed);
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch (err) {
    console.error('Error reading orders from localStorage', err);
    return [];
  }
}

/**
 * Fetch orders from server API (with localStorage merge and fallback)
 */
export async function syncOrdersFromAPI(): Promise<Order[]> {
  const localOrders = getStoredOrders();
  
  if (typeof window === 'undefined') return localOrders;

  try {
    const res = await fetch('/api/orders', { cache: 'no-store' });
    if (res.ok) {
      const serverOrders: Order[] = await res.json();
      if (Array.isArray(serverOrders)) {
        const cleanedServer = cleanSampleOrders(serverOrders);
        
        // Merge server and local orders (deduplicated by orderId)
        const ordersMap = new Map<string, Order>();
        cleanedServer.forEach(o => ordersMap.set(o.orderId, o));

        // If local has orders not yet on server, preserve them and push to server
        localOrders.forEach(o => {
          if (!ordersMap.has(o.orderId)) {
            ordersMap.set(o.orderId, o);
            fetch('/api/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(o)
            }).catch(() => {});
          }
        });

        const merged = Array.from(ordersMap.values()).sort(
          (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
        );

        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        return merged;
      }
    }
  } catch {
    // API unavailable or offline; return local orders
  }

  return localOrders;
}

/**
 * Save new order into localStorage and asynchronously sync with backend API
 */
export async function saveOrder(order: Omit<Order, 'createdAt' | 'status'>): Promise<Order> {
  const fullOrder: Order = {
    ...order,
    status: 'new',
    createdAt: Date.now()
  };

  if (typeof window !== 'undefined') {
    // 1. Save immediately to localStorage
    const current = getStoredOrders();
    const updated = [fullOrder, ...current.filter(o => o.orderId !== fullOrder.orderId)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // 2. Dispatch cross-component and cross-tab update events
    window.dispatchEvent(new CustomEvent('bac_order_added', { detail: fullOrder }));
    window.dispatchEvent(new Event('storage'));

    try {
      const channel = new BroadcastChannel('bac_orders_sync_channel');
      channel.postMessage({ type: 'ORDER_CREATED', order: fullOrder });
      channel.close();
    } catch {
      // BroadcastChannel optional
    }

    // 3. Post to API in background
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullOrder)
      });
    } catch (err) {
      console.warn('API sync warning: saved locally in browser storage', err);
    }
  }

  return fullOrder;
}

/**
 * Update order status and notes
 */
export async function updateOrderStatus(orderId: string, status: Order['status'], notes?: string): Promise<void> {
  if (typeof window === 'undefined') return;

  const current = getStoredOrders();
  const updated = current.map(item => {
    if (item.orderId === orderId) {
      return {
        ...item,
        status,
        ...(notes !== undefined ? { notes } : {})
      };
    }
    return item;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  window.dispatchEvent(new CustomEvent('bac_orders_changed'));
  window.dispatchEvent(new Event('storage'));

  try {
    const channel = new BroadcastChannel('bac_orders_sync_channel');
    channel.postMessage({ type: 'ORDER_UPDATED', orderId, status, notes });
    channel.close();
  } catch {}

  try {
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes })
    });
  } catch {}
}

/**
 * Delete an order
 */
export async function deleteOrder(orderId: string): Promise<void> {
  if (typeof window === 'undefined') return;

  const current = getStoredOrders();
  const updated = current.filter(item => item.orderId !== orderId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  window.dispatchEvent(new CustomEvent('bac_orders_changed'));
  window.dispatchEvent(new Event('storage'));

  try {
    const channel = new BroadcastChannel('bac_orders_sync_channel');
    channel.postMessage({ type: 'ORDER_DELETED', orderId });
    channel.close();
  } catch {}

  try {
    await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
  } catch {}
}

/**
 * Clear all orders
 */
export async function clearAllOrders(): Promise<void> {
  if (typeof window === 'undefined') return;

  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));

  window.dispatchEvent(new CustomEvent('bac_orders_changed'));
  window.dispatchEvent(new Event('storage'));

  try {
    const channel = new BroadcastChannel('bac_orders_sync_channel');
    channel.postMessage({ type: 'ALL_CLEARED' });
    channel.close();
  } catch {}

  try {
    await fetch('/api/orders', { method: 'DELETE' });
  } catch {}
}

/**
 * Export orders to Excel-compatible CSV with UTF-8 BOM
 */
export function exportOrdersToCSV(): void {
  const orders = getStoredOrders();
  if (orders.length === 0) return;

  const headers = ['رقم الطلب', 'الاسم واللقب', 'رقم الهاتف', 'الولاية', 'المعتمدية', 'العنوان', 'الكمية', 'المبلغ الجملي (د.ت)', 'الحالة', 'التاريخ', 'ملاحظات'];
  
  const statusMap: Record<Order['status'], string> = {
    new: 'جديد / قيد الانتظار',
    confirmed: 'مؤكد هاتفياً',
    shipping: 'في طريق التوصيل',
    delivered: 'تم التسليم والدفع',
    cancelled: 'ملغى'
  };

  const rows = orders.map(o => [
    o.orderId,
    `"${(o.fullName || '').replace(/"/g, '""')}"`,
    `"${o.phoneNumber || ''}"`,
    `"${o.governorateName || ''}"`,
    `"${o.delegation || ''}"`,
    `"${(o.address || '').replace(/"/g, '""')}"`,
    o.quantity,
    o.totalAmount,
    `"${statusMap[o.status] || o.status}"`,
    `"${o.date || ''}"`,
    `"${(o.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `commandes_bac_eco_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
