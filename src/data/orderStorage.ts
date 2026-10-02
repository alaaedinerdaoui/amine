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

export const INITIAL_SAMPLE_ORDERS: Order[] = [
  {
    orderId: 'BAC-741290',
    fullName: 'ياسين الماجري',
    phoneNumber: '98452103',
    governorateName: 'سوسة',
    delegation: 'حمام سوسة',
    address: 'نهج الهادي نويرة، قرب معهد حمام سوسة',
    quantity: 1,
    bookPrice: 41,
    shippingCost: 8,
    totalAmount: 49,
    date: '1 أكتوبر 2026',
    status: 'confirmed',
    notes: 'تم التأكيد هاتفياً - طلب التوصيل بعد العصر',
    createdAt: Date.now() - 1000 * 60 * 60 * 3
  },
  {
    orderId: 'BAC-892144',
    fullName: 'مريم بن سالم',
    phoneNumber: '22874112',
    governorateName: 'صفاقس',
    delegation: 'ساقية الزيت',
    address: 'طريق المهدية كم 4.5، عمارة الأمل شقة 3',
    quantity: 2,
    bookPrice: 41,
    shippingCost: 7,
    totalAmount: 89,
    date: '1 أكتوبر 2026',
    status: 'new',
    notes: 'طلبت نسختين (لها ولصديقتها)',
    createdAt: Date.now() - 1000 * 60 * 45
  },
  {
    orderId: 'BAC-632018',
    fullName: 'أحمد التونسي',
    phoneNumber: '55632190',
    governorateName: 'تونس',
    delegation: 'باردو',
    address: 'نهج الحبيب بورقيبة، إقامة الياسمين باردو',
    quantity: 1,
    bookPrice: 41,
    shippingCost: 8,
    totalAmount: 49,
    date: '30 سبتمبر 2026',
    status: 'delivered',
    notes: 'تم التسليم والدفع نقداً بنجاح',
    createdAt: Date.now() - 1000 * 60 * 60 * 26
  }
];

export function getStoredOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed initial realistic sample orders so the admin page is functional immediately
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_ORDERS));
      return INITIAL_SAMPLE_ORDERS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    console.error('Error reading orders from localStorage', err);
    return [];
  }
}

export function saveOrder(order: Omit<Order, 'createdAt' | 'status'>): Order {
  const fullOrder: Order = {
    ...order,
    status: 'new',
    createdAt: Date.now()
  };

  const current = getStoredOrders();
  const updated = [fullOrder, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return fullOrder;
}

export function updateOrderStatus(orderId: string, status: Order['status'], notes?: string): void {
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
}

export function deleteOrder(orderId: string): void {
  const current = getStoredOrders();
  const updated = current.filter(item => item.orderId !== orderId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

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
    `"${o.fullName.replace(/"/g, '""')}"`,
    `"${o.phoneNumber}"`,
    `"${o.governorateName}"`,
    `"${o.delegation}"`,
    `"${o.address.replace(/"/g, '""')}"`,
    o.quantity,
    o.totalAmount,
    `"${statusMap[o.status] || o.status}"`,
    `"${o.date}"`,
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
