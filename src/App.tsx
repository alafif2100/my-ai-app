import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Sparkles, 
  Database, 
  BookOpen, 
  Award,
  AlertCircle,
  TrendingUp,
  Table,
  Settings,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  Edit2,
  ChevronDown,
  ChevronUp,
  Sliders,
  LogIn,
  LogOut,
  Lock,
  Unlock,
  Check,
  Building,
  Info
} from 'lucide-react';

import KPICards from './components/KPICards';
import FiltersBar from './components/FiltersBar';
import ChartsSection from './components/ChartsSection';
import DataTable from './components/DataTable';
import AIAssistant from './components/AIAssistant';
import SheikhsTable from './components/SheikhsTable';

import { ContentItem, DashboardStats, FilterOptions } from './types';

export default function App() {
  // Admin Login State
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('isAdminLoggedIn') === 'true';
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Brand Configuration & Editable Titles with Persistent localStorage
  const [siteTitle, setSiteTitle] = useState(() => {
    return localStorage.getItem('siteTitle') || 'لوحة مؤشرات وتحليل المواد الدعوية';
  });
  const [siteDescription, setSiteDescription] = useState(() => {
    return localStorage.getItem('siteDescription') || 'حل متطور ومميز لتصفح وتحليل أداء المواد الوعظية والمقاطع المرئية والدروس العلمية عبر مختلف المنصات الاجتماعية والدعاة، مع إتاحة خيارات الفلترة الكاملة والدراسات التحليلية الدقيقة المدعومة بالذكاء الاصطناعي.';
  });
  
  // Temporal values during edit mode
  const [tempTitle, setTempTitle] = useState(siteTitle);
  const [tempDescription, setTempDescription] = useState(siteDescription);
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  
  // Custom Section Visibility Toggles with Persistent localStorage
  const [showKPIs, setShowKPIs] = useState(() => {
    const val = localStorage.getItem('showKPIs');
    return val !== null ? val === 'true' : true;
  });
  const [showFilters, setShowFilters] = useState(() => {
    const val = localStorage.getItem('showFilters');
    return val !== null ? val === 'true' : true;
  });
  const [showCharts, setShowCharts] = useState(() => {
    const val = localStorage.getItem('showCharts');
    return val !== null ? val === 'true' : true;
  });
  const [showTabs, setShowTabs] = useState(() => {
    const val = localStorage.getItem('showTabs');
    return val !== null ? val === 'true' : true;
  });

  // Settings Panel Collapse State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Filters state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedSheikh, setSelectedSheikh] = useState('all');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedContentType, setSelectedContentType] = useState('all');

  // Table pagination & sort state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [sortBy, setSortBy] = useState('interactions');
  const [sortOrder, setSortOrder] = useState('desc');

  // App data state
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [dataList, setDataList] = useState<ContentItem[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // UI state
  const [activeTab, setActiveTab] = useState<'table' | 'sheikhs' | 'ai'>('table');
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isOptionsLoading, setIsOptionsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Save Title & Desc to localStorage when they change
  useEffect(() => {
    localStorage.setItem('siteTitle', siteTitle);
  }, [siteTitle]);

  useEffect(() => {
    localStorage.setItem('siteDescription', siteDescription);
  }, [siteDescription]);

  // Save Visibility settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('showKPIs', String(showKPIs));
  }, [showKPIs]);

  useEffect(() => {
    localStorage.setItem('showFilters', String(showFilters));
  }, [showFilters]);

  useEffect(() => {
    localStorage.setItem('showCharts', String(showCharts));
  }, [showCharts]);

  useEffect(() => {
    localStorage.setItem('showTabs', String(showTabs));
  }, [showTabs]);

  // Search debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset to page 1 on search change
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch filter options once on startup
  useEffect(() => {
    async function fetchOptions() {
      try {
        const res = await fetch('/api/filters-options');
        if (!res.ok) throw new Error('فشل تحميل خيارات التصفية من الخادم');
        const data = await res.json();
        setFilterOptions(data);
      } catch (err: any) {
        console.error(err);
        setError('تعذر الاتصال بالخادم الرئيسي لتغذية البيانات.');
      } finally {
        setIsOptionsLoading(false);
      }
    }
    fetchOptions();
  }, []);

  // Fetch paginated data list when filters, pagination, or sorting changes
  useEffect(() => {
    async function fetchTableData() {
      setIsDataLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          search: debouncedSearch,
          sheikh: selectedSheikh,
          platform: selectedPlatform,
          contentType: selectedContentType,
          sortBy,
          sortOrder
        });

        const res = await fetch(`/api/data?${queryParams.toString()}`);
        if (!res.ok) throw new Error('حدث خطأ أثناء جلب قائمة المواد');
        const result = await res.json();
        
        setDataList(result.data);
        setTotalItems(result.pagination.total);
        setTotalPages(result.pagination.totalPages);
      } catch (err: any) {
        console.error(err);
      } finally {
        setIsDataLoading(false);
      }
    }
    fetchTableData();
  }, [page, limit, debouncedSearch, selectedSheikh, selectedPlatform, selectedContentType, sortBy, sortOrder]);

  // Fetch stats & chart aggregations when filters change
  useEffect(() => {
    async function fetchStats() {
      setIsStatsLoading(true);
      try {
        const queryParams = new URLSearchParams({
          search: debouncedSearch,
          sheikh: selectedSheikh,
          platform: selectedPlatform,
          contentType: selectedContentType
        });

        const res = await fetch(`/api/stats?${queryParams.toString()}`);
        if (!res.ok) throw new Error('فشل تحميل المؤشرات والرسوم البيانية');
        const result = await res.json();
        setStats(result);
      } catch (err: any) {
        console.error(err);
      } finally {
        setIsStatsLoading(false);
      }
    }
    fetchStats();
  }, [debouncedSearch, selectedSheikh, selectedPlatform, selectedContentType]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedSheikh('all');
    setSelectedPlatform('all');
    setSelectedContentType('all');
    setPage(1);
    setSortBy('interactions');
    setSortOrder('desc');
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const saveHeaderChanges = () => {
    setSiteTitle(tempTitle);
    setSiteDescription(tempDescription);
    setIsEditingHeader(false);
  };

  const cancelHeaderChanges = () => {
    setTempTitle(siteTitle);
    setTempDescription(siteDescription);
    setIsEditingHeader(false);
  };

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUsername.trim() === 'admin' && loginPassword === 'admin123') {
      setIsAdmin(true);
      localStorage.setItem('isAdminLoggedIn', 'true');
      setIsLoginModalOpen(false);
      setLoginError(null);
      setLoginUsername('');
      setLoginPassword('');
    } else {
      setLoginError('اسم المستخدم أو كلمة المرور غير صحيحة! يرجى تجربة الحساب التجريبي.');
    }
  };

  // Logout handler
  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('isAdminLoggedIn');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12 font-sans" id="app-root-div">
      {/* Decorative Brand Top Line (Manarah Royal Blue & Gold) */}
      <div className="h-2.5 bg-gradient-to-r from-brand-600 via-brand-500 to-gold-500 w-full" />

      {/* Corporate Notification Bar / Welcome Message */}
      <div className="bg-brand-900 text-white text-[11px] font-bold py-2 px-4 border-b border-brand-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Building size={12} className="text-gold-500" />
            <span>نظام التقارير الرقمية المتكامل لشركة المنارة المتقدمة بالرياض</span>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>جلسة مدير النظام نشطة</span>
              </span>
            ) : (
              <span className="text-slate-300">نسخة تصفح البيانات العامة</span>
            )}
          </div>
        </div>
      </div>

      {/* Header Panel with Manarah Identity */}
      <header className="bg-white border-b border-slate-200/80 shadow-sm" id="main-header">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            
            {/* Title Block & Edit Form */}
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 bg-brand-500/10 text-brand-700 border border-brand-500/20 px-3 py-1 rounded-full text-xs font-bold">
                  <Award size={12} className="text-gold-500" />
                  <span>شركة المنارة المتقدمة - فرع الرياض</span>
                </span>
                <span className="inline-flex items-center gap-1 bg-gold-500/10 text-gold-700 border border-gold-500/20 px-3 py-1 rounded-full text-xs font-bold">
                  <Database size={12} />
                  <span>تحديث فوري للبيانات</span>
                </span>
                
                {/* Admin Status Tag */}
                {isAdmin ? (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold">
                    <Unlock size={12} />
                    <span>متاح التعديل (مسؤول)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 border border-slate-200 px-3 py-1 rounded-full text-xs font-medium">
                    <Lock size={11} />
                    <span>للقراءة فقط</span>
                  </span>
                )}
              </div>
              
              {isEditingHeader && isAdmin ? (
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 max-w-3xl" id="edit-header-inputs">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">تعديل العنوان الرئيسي للموقع</label>
                    <input 
                      type="text" 
                      value={tempTitle} 
                      onChange={(e) => setTempTitle(e.target.value)}
                      className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 focus:border-brand-500 outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">تعديل الوصف الفرعي</label>
                    <textarea 
                      value={tempDescription} 
                      onChange={(e) => setTempDescription(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 focus:border-brand-500 outline-none leading-relaxed h-20"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={saveHeaderChanges}
                      className="inline-flex items-center gap-1 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-3 py-2 rounded-lg transition-colors"
                    >
                      <Save size={12} />
                      <span>حفظ العناوين</span>
                    </button>
                    <button 
                      onClick={cancelHeaderChanges}
                      className="inline-flex items-center gap-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-3 py-2 rounded-lg transition-colors"
                    >
                      <span>إلغاء</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 group relative max-w-3xl">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
                    <LayoutDashboard className="text-brand-500" size={28} />
                    <span>{siteTitle}</span>
                    {isAdmin && (
                      <button 
                        onClick={() => {
                          setTempTitle(siteTitle);
                          setTempDescription(siteDescription);
                          setIsEditingHeader(true);
                        }}
                        className="p-1 text-slate-400 hover:text-brand-500 rounded-lg hover:bg-slate-50 transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                        title="تعديل العناوين"
                      >
                        <Edit2 size={14} />
                      </button>
                    )}
                  </h1>
                  
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    {siteDescription}
                  </p>
                </div>
              )}
            </div>

            {/* Premium Logo / Company Identity Block & Admin Action */}
            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 bg-gradient-to-br from-brand-50 to-white border border-brand-100/80 p-4 rounded-2xl shadow-sm" id="logo-block">
              {/* Official Manarah Logo */}
              <div className="bg-white p-1 rounded-xl shadow-inner border border-brand-100 flex items-center justify-center overflow-hidden h-14 w-28 shrink-0">
                <img 
                  src="https://mm.sa/web/image/website/1/logo/%D9%86%D8%B8%D8%A7%D9%85%20%D9%85%D9%86%D8%A7%D8%B1%D8%A9?unique=6548633" 
                  alt="شركة المنارة المتقدمة بالرياض" 
                  className="max-h-full max-w-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <div className="text-right sm:border-r sm:border-slate-200 sm:pr-4">
                <p className="text-[10px] font-black text-gold-600 tracking-widest uppercase">شركة المنارة المتقدمة</p>
                <p className="text-sm font-black text-brand-700 font-sans">فرع مدينة الرياض</p>
                
                {/* Admin Quick Action Button */}
                <div className="mt-2">
                  {isAdmin ? (
                    <button 
                      onClick={handleLogout}
                      className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors"
                    >
                      <LogOut size={11} />
                      <span>خروج المسؤول</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => setIsLoginModalOpen(true)}
                      className="inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors shadow-sm"
                    >
                      <LogIn size={11} />
                      <span>تسجيل دخول المسؤول</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Control & Customization Hub Panel - Locked for Guest, Active for Admin */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5" id="settings-collapsible-hub">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
          
          {isAdmin ? (
            // Admin customization bar
            <button 
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 hover:bg-slate-100/70 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="bg-gold-500 text-white p-1.5 rounded-lg shadow-sm">
                  <Sliders size={16} />
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-slate-800 block flex items-center gap-1.5">
                    <span>لوحة التحكم والتخصيص الفوري للتقرير</span>
                    <span className="bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded">مفعل</span>
                  </span>
                  <span className="text-[10px] text-slate-500">تحكم بظهور الأقسام والعناوين لتخصيص تقريرك ومشاركتها</span>
                </div>
              </div>
              <div className="text-slate-500 flex items-center gap-1">
                <span className="text-[10px] font-bold text-slate-400">
                  {isSettingsOpen ? "إغلاق لوحة التحكم" : "فتح لوحة التحكم والتخصيص"}
                </span>
                {isSettingsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>
          ) : (
            // Lock presentation bar inviting to login
            <div 
              className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-l from-slate-50 to-white"
            >
              <div className="flex items-center gap-2.5">
                <div className="bg-slate-200 text-slate-500 p-1.5 rounded-lg">
                  <Lock size={14} />
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-slate-600 block">هل ترغب في تخصيص اللوحة؟</span>
                  <span className="text-[10px] text-slate-400">سجل الدخول كمسؤول لتتمكن من تعديل كافة النصوص الفورية والتحكم بإخفاء وإظهار الأقسام المختلفة.</span>
                </div>
              </div>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="text-[10px] bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 font-bold px-3 py-1.5 rounded-lg transition-all"
              >
                تسجيل الدخول الآن
              </button>
            </div>
          )}

          <AnimatePresence>
            {isSettingsOpen && isAdmin && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="border-t border-slate-150 overflow-hidden"
              >
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
                  
                  {/* Column 1: Editable Site Meta */}
                  <div className="space-y-4 border-l border-slate-100 pl-0 md:pl-6">
                    <h3 className="text-xs font-black text-brand-700 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                      <Edit2 size={13} className="text-gold-500" />
                      <span>تخصيص المظهر والنصوص (مدير النظام)</span>
                    </h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">العنوان الرئيسي للموقع</label>
                        <input 
                          type="text" 
                          value={siteTitle} 
                          onChange={(e) => {
                            setSiteTitle(e.target.value);
                            setTempTitle(e.target.value);
                          }}
                          className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl px-3 py-2 outline-none font-bold text-slate-700"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">الوصف الفرعي للموقع</label>
                        <textarea 
                          value={siteDescription} 
                          onChange={(e) => {
                            setSiteDescription(e.target.value);
                            setTempDescription(e.target.value);
                          }}
                          className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl px-3 py-2 outline-none leading-relaxed h-16 text-slate-700"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Visibilities Checklist */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-brand-700 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                      <Eye size={13} className="text-gold-500" />
                      <span>التحكم بظهور الأقسام والمكونات الفورية</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      
                      {/* KPI Section Toggle */}
                      <label className="relative flex items-center gap-3 p-3 bg-slate-50 hover:bg-brand-50 rounded-xl cursor-pointer border border-slate-150 hover:border-brand-200 transition-all">
                        <input 
                          type="checkbox" 
                          checked={showKPIs}
                          onChange={(e) => setShowKPIs(e.target.checked)}
                          className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4 border-slate-300 cursor-pointer"
                        />
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-700 block">بطاقات المؤشرات (KPIs)</span>
                          <span className="text-[9px] text-slate-400">إجمالي المواد، التفاعلات، والمعدلات</span>
                        </div>
                        <span className="mr-auto">
                          {showKPIs ? <Eye size={14} className="text-brand-500" /> : <EyeOff size={14} className="text-slate-400" />}
                        </span>
                      </label>

                      {/* Filters Section Toggle */}
                      <label className="relative flex items-center gap-3 p-3 bg-slate-50 hover:bg-brand-50 rounded-xl cursor-pointer border border-slate-150 hover:border-brand-200 transition-all">
                        <input 
                          type="checkbox" 
                          checked={showFilters}
                          onChange={(e) => setShowFilters(e.target.checked)}
                          className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4 border-slate-300 cursor-pointer"
                        />
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-700 block">شريط البحث والتصفية</span>
                          <span className="text-[9px] text-slate-400">البحث بالاسم والشيخ والمنصات</span>
                        </div>
                        <span className="mr-auto">
                          {showFilters ? <Eye size={14} className="text-brand-500" /> : <EyeOff size={14} className="text-slate-400" />}
                        </span>
                      </label>

                      {/* Charts Section Toggle */}
                      <label className="relative flex items-center gap-3 p-3 bg-slate-50 hover:bg-brand-50 rounded-xl cursor-pointer border border-slate-150 hover:border-brand-200 transition-all">
                        <input 
                          type="checkbox" 
                          checked={showCharts}
                          onChange={(e) => setShowCharts(e.target.checked)}
                          className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4 border-slate-300 cursor-pointer"
                        />
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-700 block">الرسوم البيانية والتحليل</span>
                          <span className="text-[9px] text-slate-400">منحنى النشر، المنصات والمحتوى</span>
                        </div>
                        <span className="mr-auto">
                          {showCharts ? <Eye size={14} className="text-brand-500" /> : <EyeOff size={14} className="text-slate-400" />}
                        </span>
                      </label>

                      {/* Tabs/Table & AI Toggle */}
                      <label className="relative flex items-center gap-3 p-3 bg-slate-50 hover:bg-brand-50 rounded-xl cursor-pointer border border-slate-150 hover:border-brand-200 transition-all">
                        <input 
                          type="checkbox" 
                          checked={showTabs}
                          onChange={(e) => setShowTabs(e.target.checked)}
                          className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4 border-slate-300 cursor-pointer"
                        />
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-700 block">جدول التفاصيل والمستشار الذكي</span>
                          <span className="text-[9px] text-slate-400">تصفح المقاطع أو الدردشة مع الذكاء الاصطناعي</span>
                        </div>
                        <span className="mr-auto">
                          {showTabs ? <Eye size={14} className="text-brand-500" /> : <EyeOff size={14} className="text-slate-400" />}
                        </span>
                      </label>

                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6" id="main-content-area">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center gap-3 text-sm font-semibold">
            <AlertCircle size={18} className="shrink-0 text-red-600" />
            <p>{error}</p>
          </div>
        )}

        {/* 1. KPIs Section */}
        <AnimatePresence>
          {showKPIs && (
            <motion.section 
              id="kpi-section" 
              className="space-y-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-1.5 px-1">
                <TrendingUp className="text-brand-500" size={16} />
                <h2 className="text-xs font-bold text-slate-500 tracking-wider uppercase">مؤشرات الأداء الرئيسية (KPIs)</h2>
              </div>
              <KPICards 
                kpis={stats?.kpis || { totalMaterials: 0, totalInteractions: 0, avgInteractions: 0, uniqueSheikhsCount: 0, uniquePlatformsCount: 0 }} 
                isLoading={isStatsLoading} 
              />
            </motion.section>
          )}
        </AnimatePresence>

        {/* 2. Filters Section */}
        <AnimatePresence>
          {showFilters && (
            <motion.section 
              id="filters-section"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FiltersBar
                search={search}
                setSearch={setSearch}
                selectedSheikh={selectedSheikh}
                setSelectedSheikh={setSelectedSheikh}
                selectedPlatform={selectedPlatform}
                setSelectedPlatform={setSelectedPlatform}
                selectedContentType={selectedContentType}
                setSelectedContentType={setSelectedContentType}
                filterOptions={filterOptions}
                onReset={handleResetFilters}
                isStatsLoading={isStatsLoading}
              />
            </motion.section>
          )}
        </AnimatePresence>

        {/* 3. Charts & Analytics */}
        <AnimatePresence>
          {showCharts && (
            <motion.section 
              id="charts-section" 
              className="space-y-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="text-brand-500" size={16} />
                  <h2 className="text-xs font-bold text-slate-500 tracking-wider uppercase">الرسوم البيانية والتحليل التفصيلي للإنتاج والنشر</h2>
                </div>
                {isStatsLoading && (
                  <span className="text-xs text-brand-600 font-bold flex items-center gap-1 animate-pulse">
                    جاري تحديث الرسوم البيانية...
                  </span>
                )}
              </div>
              <ChartsSection stats={stats} isLoading={isStatsLoading} />
            </motion.section>
          )}
        </AnimatePresence>

        {/* 4. Details, Sheikhs and AI Tabs Container */}
        <AnimatePresence>
          {showTabs && (
            <motion.section 
              id="tabs-section" 
              className="space-y-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-wrap border-b border-slate-200 bg-white p-2 rounded-xl" id="tabs-bar">
                <button
                  onClick={() => setActiveTab('table')}
                  className={`pb-2.5 pt-2 px-5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                    activeTab === 'table'
                      ? 'border-brand-500 text-brand-600 font-extrabold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                  id="tab-btn-table"
                >
                  <Table size={15} />
                  <span>جدول البيانات المفصل</span>
                </button>
                
                {/* Sheikhs Performance Table (NEW tab from Spreadsheet Details) */}
                <button
                  onClick={() => setActiveTab('sheikhs')}
                  className={`pb-2.5 pt-2 px-5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                    activeTab === 'sheikhs'
                      ? 'border-brand-500 text-brand-600 font-extrabold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                  id="tab-btn-sheikhs"
                >
                  <Award size={15} className="text-gold-500" />
                  <span>مؤشرات أداء المشايخ والدعاة</span>
                  <span className="bg-brand-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    مستخلص
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('ai')}
                  className={`pb-2.5 pt-2 px-5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                    activeTab === 'ai'
                      ? 'border-brand-500 text-brand-600 font-extrabold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                  id="tab-btn-ai"
                >
                  <Sparkles size={15} />
                  <span>المستشار الذكي (AI Analyzer)</span>
                  <span className="bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full animate-bounce">
                    جديد
                  </span>
                </button>
              </div>

              <div className="transition-all duration-300">
                {activeTab === 'table' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    id="tab-content-table"
                  >
                    <DataTable
                      data={dataList}
                      page={page}
                      totalPages={totalPages}
                      totalItems={totalItems}
                      limit={limit}
                      setPage={setPage}
                      setLimit={setLimit}
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      handleSort={handleSort}
                      isLoading={isDataLoading}
                    />
                  </motion.div>
                )}

                {activeTab === 'sheikhs' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    id="tab-content-sheikhs"
                  >
                    <SheikhsTable 
                      sheikhsData={stats?.topSheikhs} 
                      isLoading={isStatsLoading} 
                    />
                  </motion.div>
                )}

                {activeTab === 'ai' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    id="tab-content-ai"
                  >
                    <AIAssistant stats={stats} />
                  </motion.div>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Admin Login Modal Backdrop */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            id="login-modal-backdrop"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-md w-full overflow-hidden text-right font-sans"
              id="login-modal-box"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-l from-brand-600 to-brand-500 text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock size={18} className="text-gold-500" />
                  <h3 className="text-sm font-black">بوابة تسجيل دخول مدير لوحة التحكم</h3>
                </div>
                <button 
                  onClick={() => {
                    setIsLoginModalOpen(false);
                    setLoginError(null);
                  }}
                  className="text-white hover:text-slate-200 text-xs font-bold"
                >
                  إغلاق ✕
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleLogin} className="p-6 space-y-4">
                
                {/* Help Alert containing testing credentials */}
                <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3.5 rounded-xl text-xs space-y-1">
                  <p className="font-extrabold flex items-center gap-1">
                    <Info size={13} />
                    <span>بيانات الدخول التجريبية (المسؤول):</span>
                  </p>
                  <p className="font-semibold">اسم المستخدم: <span className="font-mono bg-blue-100 px-1 py-0.2 rounded text-blue-900">admin</span></p>
                  <p className="font-semibold">كلمة المرور: <span className="font-mono bg-blue-100 px-1 py-0.2 rounded text-blue-900">admin123</span></p>
                </div>

                {loginError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-bold flex items-center gap-1.5">
                    <AlertCircle size={14} className="shrink-0" />
                    <p>{loginError}</p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">اسم المستخدم</label>
                  <input 
                    type="text" 
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="مثال: admin"
                    className="w-full text-xs bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-brand-500 rounded-xl px-3 py-2.5 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">كلمة المرور</label>
                  <input 
                    type="password" 
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-brand-500 rounded-xl px-3 py-2.5 outline-none transition-all"
                  />
                </div>

                <div className="pt-2">
                  <button 
                    type="submit"
                    className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md shadow-brand-500/10 flex items-center justify-center gap-2"
                  >
                    <LogIn size={14} />
                    <span>تسجيل الدخول والتحقق</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-200/80 text-center space-y-2 text-xs text-slate-400 font-medium" id="main-footer">
        <p className="font-sans">© ٢٠٢٦الحقوق محفوظة.</p>
        <p className="text-[11px] text-slate-400">
          سعدنا بكم.
        </p>
      </footer>
    </div>
  );
}
