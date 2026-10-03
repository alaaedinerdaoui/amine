import { Order } from './orderStorage';

export const SHIPPER_DASHBOARD_URL = 'https://app.shipper.market/';

export const GOV_TO_SHIPPER_MAP: Record<string, string> = {
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

export function getShipperGovernorate(name: string): string {
  if (!name) return 'Tunis';
  const clean = name.trim();
  return GOV_TO_SHIPPER_MAP[clean] || clean;
}

export interface ShipperStatusResponse {
  connected: boolean;
  totalOrders: number;
  productsCount: number;
  message: string;
  dashboardUrl?: string;
  error?: string;
}

/**
 * Check connection to Shipper Network API via server proxy
 */
export async function checkShipperStatus(): Promise<ShipperStatusResponse> {
  try {
    const res = await fetch('/api/shipper/status');
    if (!res.ok) {
      return {
        connected: false,
        totalOrders: 0,
        productsCount: 0,
        dashboardUrl: SHIPPER_DASHBOARD_URL,
        message: 'تعذر الاتصال بـ Shipper',
        error: `HTTP ${res.status}`
      };
    }
    const data = await res.json();
    return {
      ...data,
      dashboardUrl: SHIPPER_DASHBOARD_URL
    };
  } catch (err: any) {
    return {
      connected: false,
      totalOrders: 0,
      productsCount: 0,
      dashboardUrl: SHIPPER_DASHBOARD_URL,
      message: 'خادم Shipper غير متاح حالياً',
      error: err.message
    };
  }
}

/**
 * Fetch orders list from Shipper
 */
export async function fetchShipperOrders(): Promise<any[]> {
  try {
    const res = await fetch('/api/shipper/orders');
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Automatically send order to Shipper via API
 */
export async function autoSendOrderToShipper(order: Order): Promise<{
  success: boolean;
  shipperOrderId?: number;
  message?: string;
  error?: string;
}> {
  try {
    const res = await fetch('/api/shipper/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error during Shipper API dispatch'
    };
  }
}

// Backward compatibility alias
export const syncOrderToShipper = autoSendOrderToShipper;
