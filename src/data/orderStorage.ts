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
  // Shipper Network integration fields
  shipperStatus?: 'synced' | 'pending' | 'failed' | 'not_synced' | 'pending_product';
  shipperOrderId?: number | string;
  shipperSyncedAt?: number;
  shipperError?: string;
}

const STORAGE_KEY = 'bac_book_orders';

// In-memory fallback cache for environments where localStorage is blocked (iframes, Safari ITP, etc.)
let memoryOrdersCache: Order[] = [];

// Specific mock IDs from initial prototyping to exclude if still present in old caches
const LEGACY_SAMPLE_IDS = new Set(['BAC-741290', 'BAC-892144', 'BAC-632018']);

function cleanSampleOrders(orders: Order[]): Order[] {
  if (!Array.isArray(orders)) return [];
  return orders.filter(o => o && o.orderId && !LEGACY_SAMPLE_IDS.has(o.orderId));
}

/**
 * Retrieve current orders from localStorage with in-memory fallback
 */
export function getStoredOrders(): Order[] {
  if (typeof window === 'undefined') return memoryOrdersCache;
  
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const cleaned = cleanSampleOrders(parsed);
        memoryOrdersCache = cleaned;
        return cleaned;
      }
    }
  } catch (err) {
    console.warn('LocalStorage not accessible in this context, using in-memory cache:', err);
  }

  return memoryOrdersCache;
}

/**
 * Fetch orders from server API (with localStorage merge and fallback)
 */
export async function syncOrdersFromAPI(): Promise<Order[]> {
  const localOrders = getStoredOrders();
  
  try {
    const res = await fetch('/api/orders', { 
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    });
    
    if (res.ok) {
      const serverOrders: Order[] = await res.json();
      if (Array.isArray(serverOrders)) {
        const cleanedServer = cleanSampleOrders(serverOrders);
        
        // Merge server and local orders (deduplicated by orderId)
        const ordersMap = new Map<string, Order>();
        
        // Server orders are the primary source of truth
        cleanedServer.forEach(o => {
          if (o && o.orderId) {
            ordersMap.set(o.orderId, o);
          }
        });

        // If local/memory has orders not yet on server, preserve them and push to server
        [...localOrders, ...memoryOrdersCache].forEach(o => {
          if (o && o.orderId && !ordersMap.has(o.orderId)) {
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

        // Update in-memory cache
        memoryOrdersCache = merged;

        // Try persisting to localStorage safely (will not throw or break return)
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          } catch (e) {
            console.warn('LocalStorage save failed (iframe or quota):', e);
          }
        }

        return merged;
      }
    }
  } catch (err) {
    console.warn('Backend /api/orders sync warning, falling back to local cache:', err);
  }

  return localOrders.length > 0 ? localOrders : memoryOrdersCache;
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

  // 1. Immediately update memory cache
  memoryOrdersCache = [fullOrder, ...memoryOrdersCache.filter(o => o.orderId !== fullOrder.orderId)];

  if (typeof window !== 'undefined') {
    // 2. Save to localStorage safely
    try {
      const current = getStoredOrders();
      const updated = [fullOrder, ...current.filter(o => o.orderId !== fullOrder.orderId)];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }

    // 3. Dispatch cross-component and cross-tab update events
    try {
      window.dispatchEvent(new CustomEvent('bac_order_added', { detail: fullOrder }));
      window.dispatchEvent(new Event('storage'));
    } catch {}

    try {
      const channel = new BroadcastChannel('bac_orders_sync_channel');
      channel.postMessage({ type: 'ORDER_CREATED', order: fullOrder });
      channel.close();
    } catch {}

    // 4. Post to backend API
    try {
      const apiRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullOrder)
      });
      if (!apiRes.ok) {
        console.warn('Failed to save order to server API:', apiRes.status);
      }
    } catch (err) {
      console.warn('Network error saving order to /api/orders:', err);
    }

    // 5. Trigger auto-dispatch to Shipper Network API in background
    try {
      fetch('/api/shipper/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullOrder)
      }).then(async res => {
        if (res.ok) {
          const resData = await res.json();
          if (resData.success && resData.shipperOrderId) {
            updateOrderShipperStatus(fullOrder.orderId, {
              shipperStatus: 'synced',
              shipperOrderId: resData.shipperOrderId,
              shipperSyncedAt: Date.now()
            });
          }
        }
      }).catch(() => {});
    } catch {}
  }

  return fullOrder;
}

/**
 * Update Shipper specific status on an order
 */
export async function updateOrderShipperStatus(
  orderId: string,
  shipperInfo: {
    shipperStatus: 'synced' | 'pending' | 'failed' | 'not_synced' | 'pending_product';
    shipperOrderId?: number | string;
    shipperError?: string;
    shipperSyncedAt?: number;
  }
): Promise<void> {
  // Update memory cache
  memoryOrdersCache = memoryOrdersCache.map(item => {
    if (item.orderId === orderId) {
      return { ...item, ...shipperInfo };
    }
    return item;
  });

  if (typeof window !== 'undefined') {
    try {
      const current = getStoredOrders();
      const updated = current.map(item => {
        if (item.orderId === orderId) {
          return { ...item, ...shipperInfo };
        }
        return item;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    try {
      window.dispatchEvent(new CustomEvent('bac_orders_changed'));
      window.dispatchEvent(new Event('storage'));
    } catch {}

    try {
      const channel = new BroadcastChannel('bac_orders_sync_channel');
      channel.postMessage({ type: 'SHIPPER_STATUS_UPDATED', orderId, shipperInfo });
      channel.close();
    } catch {}

    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shipperInfo)
      });
    } catch {}
  }
}

/**
 * Update order status and notes
 */
export async function updateOrderStatus(orderId: string, status: Order['status'], notes?: string): Promise<void> {
  memoryOrdersCache = memoryOrdersCache.map(item => {
    if (item.orderId === orderId) {
      return {
        ...item,
        status,
        ...(notes !== undefined ? { notes } : {})
      };
    }
    return item;
  });

  if (typeof window !== 'undefined') {
    try {
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
    } catch {}

    try {
      window.dispatchEvent(new CustomEvent('bac_orders_changed'));
      window.dispatchEvent(new Event('storage'));
    } catch {}

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
}

/**
 * Delete an order
 */
export async function deleteOrder(orderId: string): Promise<void> {
  memoryOrdersCache = memoryOrdersCache.filter(item => item.orderId !== orderId);

  if (typeof window !== 'undefined') {
    try {
      const current = getStoredOrders();
      const updated = current.filter(item => item.orderId !== orderId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    try {
      window.dispatchEvent(new CustomEvent('bac_orders_changed'));
      window.dispatchEvent(new Event('storage'));
    } catch {}

    try {
      const channel = new BroadcastChannel('bac_orders_sync_channel');
      channel.postMessage({ type: 'ORDER_DELETED', orderId });
      channel.close();
    } catch {}

    try {
      await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
    } catch {}
  }
}

/**
 * Clear all orders
 */
export async function clearAllOrders(): Promise<void> {
  memoryOrdersCache = [];

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    } catch {}

    try {
      window.dispatchEvent(new CustomEvent('bac_orders_changed'));
      window.dispatchEvent(new Event('storage'));
    } catch {}

    try {
      const channel = new BroadcastChannel('bac_orders_sync_channel');
      channel.postMessage({ type: 'ALL_CLEARED' });
      channel.close();
    } catch {}

    try {
      await fetch('/api/orders', { method: 'DELETE' });
    } catch {}
  }
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
    o.orderId || '',
    `"${(o.fullName || '').replace(/"/g, '""')}"`,
    `"${o.phoneNumber || ''}"`,
    `"${o.governorateName || ''}"`,
    `"${o.delegation || ''}"`,
    `"${(o.address || '').replace(/"/g, '""')}"`,
    o.quantity || 1,
    o.totalAmount || 0,
    `"${statusMap[o.status] || o.status || ''}"`,
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
