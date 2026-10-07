import { useState, useEffect, useCallback } from 'react';
import { 
  getStoredOrders, 
  updateOrderStatus, 
  deleteOrder, 
  exportOrdersToCSV, 
  syncOrdersFromAPI,
  clearAllOrders,
  updateOrderShipperStatus,
  Order 
} from '../../data/orderStorage';
import { BOOK_DETAILS, TUNISIAN_GOVERNORATES } from '../../data/tunisiaData';
import { checkShipperStatus, syncOrderToShipper, ShipperStatusResponse } from '../../data/shipperService';
import { 
  ShoppingBag, 
  Phone, 
  MessageCircle, 
  Search, 
  Download, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Truck, 
  XCircle, 
  Trash2, 
  Edit3, 
  MapPin, 
  Calendar, 
  User, 
  DollarSign, 
  Lock, 
  Unlock, 
  FileSpreadsheet,
  Printer,
  ChevronDown,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  PackageCheck
} from 'lucide-react';

interface AdminDashboardProps {
  onBackToSite: () => void;
}

export function AdminDashboard({ onBackToSite }: AdminDashboardProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  // Shipper integration state
  const [shipperStatus, setShipperStatus] = useState<ShipperStatusResponse | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Order['status']>('all');
  const [govFilter, setGovFilter] = useState<string>('all');

  // Active editing notes
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  // Selected Order for Parcel Slip / Printing
  const [printableOrder, setPrintableOrder] = useState<Order | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const loadOrders = useCallback(async (showLoading = false) => {
    if (showLoading) setIsRefreshing(true);
    // Instant local load first
    const local = getStoredOrders();
    setOrders(local);

    // Sync with backend API
    try {
      const synced = await syncOrdersFromAPI();
      setOrders(synced);
    } catch (err) {
      console.error('Failed to sync orders:', err);
    }

    // Check Shipper connection
    try {
      const sStatus = await checkShipperStatus();
      setShipperStatus(sStatus);
    } catch {
      // Ignore background shipper error
    } finally {
      if (showLoading) {
        setTimeout(() => setIsRefreshing(false), 400);
      }
    }
  }, []);

  // Load orders and listen for real-time order creation across tabs and components
  useEffect(() => {
    // Check if already authenticated in this session
    const authSession = sessionStorage.getItem('bac_admin_auth');
    if (authSession === 'true') {
      setIsAuthenticated(true);
    }
    loadOrders();

    const handleUpdate = () => {
      loadOrders();
    };

    window.addEventListener('bac_order_added', handleUpdate);
    window.addEventListener('bac_orders_changed', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('bac_orders_sync_channel');
      channel.onmessage = () => {
        loadOrders();
      };
    } catch {}

    // Auto-refresh every 5 seconds to catch orders from other devices/browsers
    const interval = setInterval(() => {
      loadOrders();
    }, 5000);

    return () => {
      window.removeEventListener('bac_order_added', handleUpdate);
      window.removeEventListener('bac_orders_changed', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      if (channel) channel.close();
      clearInterval(interval);
    };
  }, [loadOrders]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default PIN: 2026 or admin
    if (passwordInput.trim() === '2026' || passwordInput.trim().toLowerCase() === 'admin') {
      setIsAuthenticated(true);
      sessionStorage.setItem('bac_admin_auth', 'true');
      setPasswordError(false);
      loadOrders(true);
    } else {
      setPasswordError(true);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    await updateOrderStatus(orderId, newStatus);
    await loadOrders();
  };

  const handleDelete = async (orderId: string) => {
    await deleteOrder(orderId);
    setConfirmDeleteId(null);
    await loadOrders();
  };

  const handleClearAll = async () => {
    await clearAllOrders();
    setConfirmClearAll(false);
    await loadOrders();
  };

  const handleSaveNote = async (orderId: string) => {
    await updateOrderStatus(orderId, orders.find(o => o.orderId === orderId)?.status || 'new', noteText);
    setEditingNoteId(null);
    setNoteText('');
    await loadOrders();
  };

  // Filtered orders list (defensive against any undefined/null fields)
  const filteredOrders = orders.filter(order => {
    if (!order) return false;
    const query = (searchQuery || '').trim().toLowerCase();
    const fullName = (order.fullName || '').toLowerCase();
    const phone = (order.phoneNumber || '').toString();
    const phone2 = (order.secondPhoneNumber || '').toString();
    const id = (order.orderId || '').toLowerCase();
    const delegation = (order.delegation || '').toLowerCase();
    const address = (order.address || '').toLowerCase();

    const matchesSearch = !query || 
      fullName.includes(query) ||
      phone.includes(query) ||
      phone2.includes(query) ||
      id.includes(query) ||
      delegation.includes(query) ||
      address.includes(query);

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesGov = govFilter === 'all' || (order.governorateName || '').trim() === govFilter;

    return matchesSearch && matchesStatus && matchesGov;
  });

  // Calculate metrics
  const totalOrders = orders.length;
  const newOrdersCount = orders.filter(o => o.status === 'new').length;
  const confirmedOrdersCount = orders.filter(o => o.status === 'confirmed' || o.status === 'shipping').length;
  const deliveredOrdersCount = orders.filter(o => o.status === 'delivered').length;
  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Status badges & text
  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA] text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>جديد / قيد الانتظار</span>
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] text-xs font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>مؤكد هاتفياً</span>
          </span>
        );
      case 'shipping':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FAF5FF] text-[#7E22CE] border border-[#E9D5FF] text-xs font-semibold">
            <Truck className="w-3.5 h-3.5" />
            <span>في طريق التوصيل</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] text-xs font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>تم التسليم والدفع</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA] text-xs font-semibold">
            <XCircle className="w-3.5 h-3.5" />
            <span>ملغى</span>
          </span>
        );
    }
  };

  // Login view if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F4EFE6] flex items-center justify-center p-4">
        <div className="bg-[#FCFAF6] vintage-double-border max-w-md w-full p-8 rounded shadow-xl text-center space-y-6">
          <div className="w-14 h-14 bg-[#7C2529]/10 text-[#7C2529] rounded-full mx-auto flex items-center justify-center">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <span className="text-xs font-semibold text-[#7C2529] uppercase tracking-wider">
              فضاء المشرف · لوحة الإدارة
            </span>
            <h1 className="font-serif-book text-2xl font-bold text-[#2A1F18] mt-1">
              الدخول للوحة التحكم في الطلبيات
            </h1>
            <p className="text-xs text-[#705F51] mt-2">
              صفحة سرية مخصصة لمتابعة طلبيات تلامذة باك اقتصاد وتصرف.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="أدخل الرمز السري (الرمز الافتراضي: 2026)"
                className="w-full text-center tracking-widest text-lg font-mono bg-[#FAF7F0] border border-[#D5C6AF] rounded px-4 py-3 focus:outline-none focus:border-[#7C2529] focus:ring-1 focus:ring-[#7C2529]"
                autoFocus
              />
              {passwordError && (
                <p className="text-xs text-[#B73225] mt-2">
                  الرمز السري غير صحيح. جرب: <span className="font-mono font-bold">2026</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full vintage-button py-3 rounded text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>دخول للوحة التحكم</span>
            </button>
          </form>

          <div className="pt-4 border-t border-[#EAE0D0]">
            <button
              onClick={onBackToSite}
              className="text-xs text-[#7C2529] hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>العودة لصفحة الكتاب الرئيسية</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5EE] text-[#2A1F18] flex flex-col">
      
      {/* Top Bar for Admin */}
      <header className="bg-[#241A14] text-[#EFE8DA] border-b border-[#3A2D23] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToSite}
              className="bg-[#38281F] hover:bg-[#4E372A] text-xs px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
              title="الرجوع لصفحة الهبوط"
            >
              <ArrowRight className="w-4 h-4" />
              <span className="hidden sm:inline">العودة للموقع</span>
            </button>

            <div className="h-5 w-[1px] bg-[#4E3A2F]" />

            <div>
              <h1 className="font-serif-book font-bold text-base sm:text-lg leading-tight">
                لوحة إدارة الطلبيات (Commandes)
              </h1>
              <p className="text-[10px] text-[#A89886] hidden sm:block">
                كتاب ملخصات التاريخ والجغرافيا · باك اقتصاد وتصرف
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Refresh Button */}
            <button
              onClick={() => loadOrders(true)}
              disabled={isRefreshing}
              className="bg-[#38281F] hover:bg-[#4E372A] text-[#D8CFBF] text-xs px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
              title="تحديث فوري لقائمة الطلبيات"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#C09540]' : ''}`} />
              <span className="hidden sm:inline">{isRefreshing ? 'جارٍ التحديث...' : 'تحديث'}</span>
            </button>

            {orders.length > 0 && (
              <button
                onClick={() => setConfirmClearAll(true)}
                className="bg-[#38281F] hover:bg-[#5C2323] text-[#FCA5A5] text-xs px-2.5 py-1.5 rounded flex items-center gap-1 transition-colors cursor-pointer"
                title="مسح جميع الطلبيات المسجلة"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">إفراغ القائمة</span>
              </button>
            )}

            <button
              onClick={exportOrdersToCSV}
              disabled={orders.length === 0}
              className="bg-[#C09540] hover:bg-[#A98132] disabled:opacity-50 text-[#241A14] text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
              title="تصدير ملف إكسل لشركات التوصيل"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">تصدير CSV / Excel</span>
            </button>

            <button
              onClick={() => {
                sessionStorage.removeItem('bac_admin_auth');
                setIsAuthenticated(false);
              }}
              className="bg-[#38281F] hover:bg-[#4E372A] text-[#D8CFBF] text-xs px-3 py-1.5 rounded flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">قفل</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        
        {/* KPI Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#FCFAF6] border border-[#DACFBD] rounded p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#705F51] mb-1">
              <span>إجمالي الطلبيات</span>
              <ShoppingBag className="w-4 h-4 text-[#7C2529]" />
            </div>
            <div className="font-mono text-2xl font-bold text-[#2A1F18]">
              {totalOrders}
            </div>
            <div className="text-[11px] text-[#8C7A6B] mt-1">
              من مختلف الولايات
            </div>
          </div>

          <div className="bg-[#FCFAF6] border border-[#DACFBD] rounded p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#705F51] mb-1">
              <span>طلبيات جديدة (للاتصال)</span>
              <Clock className="w-4 h-4 text-[#C2410C]" />
            </div>
            <div className="font-mono text-2xl font-bold text-[#C2410C]">
              {newOrdersCount}
            </div>
            <div className="text-[11px] text-[#8C7A6B] mt-1">
              تتطلب تأكيداً هاتفياً
            </div>
          </div>

          <div className="bg-[#FCFAF6] border border-[#DACFBD] rounded p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#705F51] mb-1">
              <span>مؤكدة أو في التوصيل</span>
              <Truck className="w-4 h-4 text-[#1D4ED8]" />
            </div>
            <div className="font-mono text-2xl font-bold text-[#1D4ED8]">
              {confirmedOrdersCount}
            </div>
            <div className="text-[11px] text-[#8C7A6B] mt-1">
              في طريقها للزبائن
            </div>
          </div>

          <div className="bg-[#FCFAF6] border border-[#DACFBD] rounded p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#705F51] mb-1">
              <span>المداخيل المتوقعة</span>
              <DollarSign className="w-4 h-4 text-[#15803D]" />
            </div>
            <div className="font-mono text-2xl font-bold text-[#15803D]">
              {totalRevenue} <span className="text-xs font-sans text-[#705F51]">{BOOK_DETAILS.currency}</span>
            </div>
            <div className="text-[11px] text-[#8C7A6B] mt-1">
              {deliveredOrdersCount} طلبية مسلّمة بنجاح
            </div>
          </div>
        </div>

        {/* Shipper Network Integration Card */}
        <div className="bg-[#241A14] text-[#EFE8DA] rounded-lg p-4 sm:p-5 border border-[#3E2E23] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#7C2529]/40 border border-[#7C2529] flex items-center justify-center text-[#F2C054] shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-sm sm:text-base">الربط التلقائي مع منصة Shipper Market</span>
                <span className="inline-flex items-center gap-1.5 text-[11px] bg-[#166534]/60 text-[#4ADE80] border border-[#166534] px-2.5 py-0.5 rounded font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse"></span>
                  API مفعل وتلقائي
                </span>
                {shipperStatus?.totalOrders !== undefined && (
                  <span className="text-[11px] text-[#D8CFBF] bg-[#3A2D23] px-2 py-0.5 rounded">
                    {shipperStatus.totalOrders} طلبية في حساب Shipper
                  </span>
                )}
                {shipperStatus?.productsCount !== undefined && (
                  <span className={`text-[11px] px-2 py-0.5 rounded font-bold ${
                    shipperStatus.productsCount > 0 ? 'bg-[#166534]/40 text-[#4ADE80]' : 'bg-[#DC2626]/40 text-[#FCA5A5]'
                  }`}>
                    {shipperStatus.productsCount > 0 ? `${shipperStatus.productsCount} منتج متصل` : 'لا يوجد منتجات في Shipper'}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#B5A593] mt-1 leading-relaxed">
                يتم إرسال كافة الطلبيات آلياً وتلقائياً عبر مفتاح الـ API إلى حسابك على منصة Shipper دون الحاجة لأي مزامنة يدوية. يمكنك فتح لوحة التحكم لمتابعة الشحن والتسليم.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href="https://app.shipper.market/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#C09540] hover:bg-[#A98132] text-[#1F150E] text-xs font-bold px-3.5 py-2 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>عرض الطلبيات في Shipper Market</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Shipper Setup Alert if 0 products found */}
        {shipperStatus && shipperStatus.productsCount === 0 && (
          <div className="bg-[#FFFBEB] border-2 border-[#F59E0B] rounded-lg p-5 text-[#92400E] shadow-sm space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-[#FEF3C7] border border-[#F59E0B] flex items-center justify-center shrink-0 text-[#D97706] font-bold text-lg">
                ⚠️
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-bold text-sm sm:text-base text-[#78350F]">
                    خطوة هامة: أضف كتاب الملخصات في حساب Shipper لتظهر الطلبيات مباشرة هناك
                  </h3>
                  <span className="text-[11px] bg-[#FDE68A] text-[#92400E] px-2 py-0.5 rounded font-mono font-bold">
                    Action requise dans Shipper
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#78350F] leading-relaxed">
                  مفتاح الـ API متصل بنجاح، ولكن نظام <strong>Shipper Market</strong> يشترط وجود المنتج مسجلاً في متجرك (0 منتجات حالياً) ليتمكن من ربط الطلبيات به وإنشاء الكولي.
                </p>
                <div className="bg-white/90 border border-[#FDE68A] rounded p-3 text-xs text-[#78350F] space-y-1.5">
                  <p className="font-bold text-sm">الحل السريع (تستغرق 30 ثانية فقط):</p>
                  <ol className="list-decimal list-inside space-y-1 mr-1">
                    <li>
                      افتح حسابك في Shipper من الرابط:{' '}
                      <a
                        href="https://app.shipper.market/products"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#1D4ED8] underline font-bold"
                      >
                        https://app.shipper.market/products
                      </a>
                    </li>
                    <li>اضغط على زر <strong>"Ajouter un produit" (إضافة منتج)</strong></li>
                    <li>اكتب اسم المنتج: <strong>كتاب ملخصات التاريخ والجغرافيا</strong> والسعر: <strong>41</strong></li>
                    <li>اضغط <strong>Sauvegarder (حفظ)</strong></li>
                  </ol>
                  <p className="text-[11px] text-[#047857] font-semibold pt-1">
                    ✓ بمجرد حفظ المنتج، سيتعرف موقعنا عليه تلقائياً ويرسل كافة الطلبيات السابقة والجديدة مباشرة إلى منصة Shipper!
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href="https://app.shipper.market/products"
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold px-4 py-2 rounded flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <span>فتح صفحة المنتجات في Shipper الآن</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => loadOrders(true)}
                    className="border border-[#D97706] bg-white hover:bg-[#FEF3C7] text-[#92400E] text-xs font-bold px-3.5 py-2 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>التحقق من إضافة المنتج</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="bg-[#FCFAF6] border border-[#DACFBD] rounded p-4 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7A6B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم، رقم الهاتف، أو رقم الطلب..."
              className="w-full bg-[#FAF7F0] border border-[#D5C6AF] rounded pr-9 pl-4 py-2 text-xs sm:text-sm text-[#2A1F18] focus:outline-none focus:border-[#7C2529]"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#705F51] whitespace-nowrap">الحالة:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-[#FAF7F0] border border-[#D5C6AF] rounded px-3 py-2 text-xs text-[#2A1F18] focus:outline-none focus:border-[#7C2529]"
            >
              <option value="all">كل الحالات ({orders.length})</option>
              <option value="new">جديد / قيد الانتظار ({orders.filter(o => o.status === 'new').length})</option>
              <option value="confirmed">مؤكد هاتفياً ({orders.filter(o => o.status === 'confirmed').length})</option>
              <option value="shipping">في طريق التوصيل ({orders.filter(o => o.status === 'shipping').length})</option>
              <option value="delivered">تم التسليم ({orders.filter(o => o.status === 'delivered').length})</option>
              <option value="cancelled">ملغى ({orders.filter(o => o.status === 'cancelled').length})</option>
            </select>
          </div>

          {/* Governorate filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#705F51] whitespace-nowrap">الولاية:</span>
            <select
              value={govFilter}
              onChange={(e) => setGovFilter(e.target.value)}
              className="bg-[#FAF7F0] border border-[#D5C6AF] rounded px-3 py-2 text-xs text-[#2A1F18] focus:outline-none focus:border-[#7C2529]"
            >
              <option value="all">كل الولايات</option>
              {TUNISIAN_GOVERNORATES.map(g => (
                <option key={g.id} value={g.nameAr}>
                  {g.nameAr}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Orders List / Table */}
        <div className="bg-[#FCFAF6] border border-[#DACFBD] rounded shadow-sm overflow-hidden">
          
          <div className="p-4 border-b border-[#EADCC8] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-serif-book font-bold text-base text-[#2A1F18]">
                قائمة الطلبيات
              </h2>
              <span className="text-xs text-[#705F51]">
                ({filteredOrders.length} طلبية مطابقة)
              </span>
            </div>

            {filteredOrders.length > 0 && (
              <span className="text-[11px] text-[#7C2529] font-medium hidden sm:inline">
                انقر على رقم الهاتف للاتصال أو زر الواتساب للتواصل الفوري
              </span>
            )}
          </div>

          {orders.length === 0 ? (
            <div className="p-16 text-center text-[#705F51] space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#F3EAD9] flex items-center justify-center text-[#7C2529]">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-bold text-[#2A1F18]">لا توجد طلبيات مسجلة بعد</p>
                <p className="text-xs text-[#8C7A6B] max-w-md mx-auto leading-relaxed">
                  تم إفراغ الطلبيات الافتراضية بنجاح. أي طلبية جديدة يسجلها التلميذ أو الزائر في الموقع ستظهر هنا فوراً وتلقائياً دون الحاجة لتحديث الصفحة.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => loadOrders(true)}
                  disabled={isRefreshing}
                  className="bg-[#7C2529] hover:bg-[#631D21] text-white px-4 py-2 text-xs rounded font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>تحديث وجلب الطلبيات من السيرفر</span>
                </button>
                <button
                  onClick={onBackToSite}
                  className="vintage-button px-4 py-2 text-xs rounded font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow"
                >
                  <span>العودة للموقع وتجربة تسجيل طلب</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-[#705F51] space-y-3">
              <ShoppingBag className="w-10 h-10 mx-auto text-[#D5C6AF]" />
              <p className="text-sm font-semibold">لا توجد طلبيات تطابق هذا البحث أو الفلتر</p>
              <p className="text-xs text-[#8C7A6B]">جرب تغيير فلاتر الحالة أو مسح نص البحث</p>
            </div>
          ) : (
            <div className="divide-y divide-[#EADCC8]">
              {filteredOrders.map((order) => {
                const whatsappMessage = encodeURIComponent(
                  `السلام عليكم يا ${order.fullName}، نتصلوا بيك من فريق كتاب ملخصات التاريخ والجغرافيا لباك اقتصاد وتصرف بخصوص طلبك رقم ${order.orderId}. نحبوا نأكدوا معاك موعد وعنوان التوصيل.`
                );

                return (
                  <div key={order.orderId} className="p-4 sm:p-5 hover:bg-[#FAF6EC] transition-colors">
                    
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      
                      {/* Left Block: Client Info & Address */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-mono text-xs font-bold text-[#7C2529] bg-[#7C2529]/10 px-2 py-0.5 rounded">
                            {order.orderId}
                          </span>
                          <span className="font-serif-book text-base font-bold text-[#2A1F18]">
                            {order.fullName}
                          </span>
                          {getStatusBadge(order.status)}
                          <span className="text-xs text-[#8C7A6B] mr-auto sm:mr-0">
                            {order.date}
                          </span>
                        </div>

                        {/* Contact & Location details */}
                        <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-[#524134]">
                          {/* Direct Phone Call Button */}
                          <a
                            href={`tel:+216${order.phoneNumber.replace(/\s+/g, '')}`}
                            className="inline-flex items-center gap-1.5 font-mono text-[#7C2529] font-bold hover:underline bg-[#F2E8D7] px-2 py-1 rounded"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span dir="ltr">{order.phoneNumber}</span>
                          </a>

                          {/* Quick WhatsApp Action Button */}
                          <a
                            href={`https://wa.me/216${order.phoneNumber.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-[#15803D] font-medium hover:underline bg-[#DCFCE7] px-2 py-1 rounded"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>واتساب</span>
                          </a>

                          {/* Optional Second Phone */}
                          {order.secondPhoneNumber && (
                            <a
                              href={`tel:+216${order.secondPhoneNumber.replace(/\s+/g, '')}`}
                              title="رقم هاتف ثانٍ"
                              className="inline-flex items-center gap-1.5 font-mono text-[#524134] font-medium hover:underline bg-[#EFE4D3] px-2 py-1 rounded"
                            >
                              <Phone className="w-3 h-3 text-[#7C2529]" />
                              <span dir="ltr">{order.secondPhoneNumber}</span>
                              <span className="text-[10px] text-[#8C7A6B]">(ثانٍ)</span>
                            </a>
                          )}

                          <div className="flex items-center gap-1 text-[#645244]">
                            <MapPin className="w-3.5 h-3.5 text-[#7C2529]" />
                            <span className="font-semibold">{order.governorateName}</span>
                            <span>·</span>
                            <span>{order.delegation}</span>
                          </div>

                          <div className="text-[#786656] max-w-md truncate" title={order.address}>
                            العنوان: {order.address}
                          </div>
                        </div>

                        {/* Order Quantities & Amounts */}
                        <div className="flex items-center gap-3 text-xs font-medium text-[#46362B] pt-1">
                          <span>الكمية: <strong className="font-mono text-sm">{order.quantity}</strong> نسخة</span>
                          <span aria-hidden="true">·</span>
                          <span>المبلغ الجملي: <strong className="font-mono text-sm text-[#7C2529]">{order.totalAmount} {BOOK_DETAILS.currency}</strong> (مع التوصيل)</span>
                        </div>

                        {/* Shipper Delivery Status */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                          {order.shipperStatus === 'synced' ? (
                            <div className="inline-flex items-center gap-1.5 bg-[#DCFCE7] text-[#166534] border border-[#86EFAC] px-2.5 py-0.5 rounded text-[11px] font-medium">
                              <CheckCircle className="w-3 h-3 text-[#166534]" />
                              <span>مسجل في Shipper {order.shipperOrderId ? `(رقم الطرد #${order.shipperOrderId})` : ''}</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 bg-[#F5EEDF] text-[#705F51] border border-[#E3D4BF] px-2.5 py-0.5 rounded text-[11px] font-medium">
                              <Truck className="w-3 h-3 text-[#7C2529]" />
                              <span>ربط API تلقائي (Shipper Market)</span>
                            </div>
                          )}
                        </div>

                        {/* Internal Note */}
                        {order.notes && (
                          <div className="text-xs bg-[#F5EEDF] p-2 rounded border border-[#E3D4BF] text-[#614F40]">
                            <strong>ملاحظة:</strong> {order.notes}
                          </div>
                        )}

                        {/* Editing Note Section */}
                        {editingNoteId === order.orderId ? (
                          <div className="flex items-center gap-2 pt-2">
                            <input
                              type="text"
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              placeholder="أضف ملاحظة للتوصيل أو مكالمة الزبون..."
                              className="text-xs bg-white border border-[#D5C6AF] rounded px-3 py-1.5 flex-1"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveNote(order.orderId)}
                              className="bg-[#7C2529] text-white text-xs px-3 py-1.5 rounded cursor-pointer font-medium"
                            >
                              حفظ
                            </button>
                            <button
                              onClick={() => setEditingNoteId(null)}
                              className="text-xs text-[#705F51] hover:underline cursor-pointer"
                            >
                              إلغاء
                            </button>
                          </div>
                        ) : null}

                      </div>

                      {/* Right Block: Status Select & Fast Actions */}
                      <div className="flex flex-wrap lg:flex-col items-end gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#EADCC8]">
                        
                        {/* Status Change Selector */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-[#705F51]">تغيير الحالة:</span>
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.orderId, e.target.value as any)}
                            className="bg-white border border-[#D5C6AF] rounded px-2.5 py-1 text-xs text-[#2A1F18] font-medium focus:outline-none focus:border-[#7C2529]"
                          >
                            <option value="new">جديد / قيد الانتظار</option>
                            <option value="confirmed">تم التأكيد هاتفياً</option>
                            <option value="shipping">في طريق التوصيل</option>
                            <option value="delivered">تم التسليم والدفع</option>
                            <option value="cancelled">إلغاء الطلبية</option>
                          </select>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingNoteId(order.orderId);
                              setNoteText(order.notes || '');
                            }}
                            className="p-1.5 text-[#5C4A3C] hover:text-[#2A1F18] hover:bg-[#EFE5D4] rounded transition-colors cursor-pointer"
                            title="إضافة أو تعديل ملاحظة"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setPrintableOrder(order)}
                            className="p-1.5 text-[#5C4A3C] hover:text-[#2A1F18] hover:bg-[#EFE5D4] rounded transition-colors cursor-pointer"
                            title="عرض وطباعة بطاقة الطرد / الوصل"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {confirmDeleteId === order.orderId ? (
                            <div className="flex items-center gap-1.5 bg-[#FEE2E2] px-2 py-1 rounded border border-[#FECACA] animate-in fade-in duration-150">
                              <span className="text-[11px] text-[#991B1B] font-semibold whitespace-nowrap">حذف؟</span>
                              <button
                                type="button"
                                onClick={() => handleDelete(order.orderId)}
                                className="text-xs bg-[#DC2626] text-white px-2 py-0.5 rounded hover:bg-[#B91C1C] transition-colors cursor-pointer font-bold"
                              >
                                نعم
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="text-xs text-[#705F51] hover:text-[#2A1F18] px-1 py-0.5 rounded hover:bg-white/60 transition-colors cursor-pointer"
                              >
                                لا
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(order.orderId)}
                              className="p-1.5 text-[#B91C1C] hover:bg-[#FEE2E2] rounded transition-colors cursor-pointer"
                              title="حذف الطلبية"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                      </div>

                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </main>

      {/* Printable Parcel Slip Modal */}
      {printableOrder && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in"
          onClick={() => setPrintableOrder(null)}
        >
          <div 
            className="bg-white text-black border-2 border-black max-w-md w-full p-6 rounded shadow-2xl relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start border-b-2 border-black pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider">سلسلة ملخصات الباكالوريا</span>
                <h3 className="font-serif font-bold text-lg leading-tight">وصل إرسال طرد · كتاب التاريخ والجغرافيا</h3>
                <span className="text-xs text-gray-600">باك اقتصاد وتصرف</span>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-sm block">{printableOrder.orderId}</span>
                <span className="text-[11px] text-gray-500">{printableOrder.date}</span>
              </div>
            </div>

            <div className="space-y-2 text-sm bg-gray-50 p-3 border border-gray-300 rounded">
              <div><strong>المستلم:</strong> {printableOrder.fullName}</div>
              <div><strong>الهاتف:</strong> <span className="font-mono font-bold" dir="ltr">{printableOrder.phoneNumber}</span></div>
              <div><strong>الولاية والمعتمدية:</strong> {printableOrder.governorateName} - {printableOrder.delegation}</div>
              <div><strong>العنوان:</strong> {printableOrder.address}</div>
            </div>

            <div className="border border-black p-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>المنتج:</span>
                <span>كتاب الملخصات ({printableOrder.quantity} نسخة)</span>
              </div>
              <div className="flex justify-between">
                <span>سعر الكتاب:</span>
                <span>{printableOrder.bookPrice * printableOrder.quantity} د.ت</span>
              </div>
              <div className="flex justify-between">
                <span>مصاريف التوصيل:</span>
                <span>{printableOrder.shippingCost} د.ت</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t border-black pt-1 mt-1">
                <span>المبلغ المطلوب استخلاصه نقداً:</span>
                <span className="text-red-700 font-mono">{printableOrder.totalAmount} د.ت</span>
              </div>
            </div>

            {printableOrder.notes && (
              <div className="text-xs border-r-2 border-black pr-2 text-gray-700">
                <strong>ملاحظة للتوصيل:</strong> {printableOrder.notes}
              </div>
            )}

            <div className="flex justify-between pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setPrintableOrder(null)}
                className="px-4 py-1.5 text-xs border border-gray-400 rounded hover:bg-gray-100 cursor-pointer"
              >
                إغلاق
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-1.5 text-xs bg-black text-white font-bold rounded flex items-center gap-1.5 hover:bg-gray-800 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة الوصل</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {confirmClearAll && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in"
          onClick={() => setConfirmClearAll(false)}
        >
          <div 
            className="bg-[#FCFAF6] border border-[#D5C6AF] max-w-sm w-full p-6 rounded shadow-2xl relative space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-[#FEE2E2] text-[#B91C1C] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif-book font-bold text-base text-[#2A1F18]">
                هل أنت متأكد من مسح جميع الطلبيات؟
              </h3>
              <p className="text-xs text-[#786656]">
                سيتم حذف كافة الطلبيات الحالية من الذاكرة والسيرفر نهائياً وتصفير القائمة.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmClearAll(false)}
                className="px-4 py-2 text-xs border border-[#D5C6AF] rounded text-[#5C4A3C] hover:bg-[#F2E8D7] cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-4 py-2 text-xs bg-[#B91C1C] text-white font-bold rounded hover:bg-[#991B1B] cursor-pointer"
              >
                تأكيد المسح
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
