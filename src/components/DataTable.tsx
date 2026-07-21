import React from 'react';
import { ExternalLink, ChevronRight, ChevronLeft, ArrowUpDown, Clock, Calendar, MessageSquare, PlayCircle } from 'lucide-react';
import { ContentItem } from '../types';

interface DataTableProps {
  data: ContentItem[];
  page: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  setPage: (p: number) => void;
  setLimit: (l: number) => void;
  sortBy: string;
  sortOrder: string;
  handleSort: (col: string) => void;
  isLoading: boolean;
}

export default function DataTable({
  data,
  page,
  totalPages,
  totalItems,
  limit,
  setPage,
  setLimit,
  sortBy,
  sortOrder,
  handleSort,
  isLoading
}: DataTableProps) {
  
  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, page - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
            page === i
              ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          {new Intl.NumberFormat('ar-SA').format(i)}
        </button>
      );
    }
    return pages;
  };

  const getPlatformBadgeClass = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('youtube')) return 'bg-red-50 text-red-700 border-red-150';
    if (p.includes('tiktok')) return 'bg-slate-900 text-white border-slate-950';
    if (p.includes('twitter') || p.includes('x')) return 'bg-sky-50 text-sky-700 border-sky-150';
    if (p.includes('telegram')) return 'bg-cyan-50 text-cyan-700 border-cyan-150';
    if (p.includes('facebook')) return 'bg-blue-50 text-blue-700 border-blue-150';
    return 'bg-slate-50 text-slate-700 border-slate-150';
  };

  const getContentTypeBadgeClass = (type: string) => {
    if (type.includes('درس')) return 'bg-emerald-50 text-emerald-700 border-emerald-150';
    if (type.includes('محاضرة')) return 'bg-purple-50 text-purple-700 border-purple-150';
    if (type.includes('كلمة')) return 'bg-amber-50 text-amber-700 border-amber-150';
    return 'bg-blue-50 text-blue-700 border-blue-150';
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden" id="data-table-main-container">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">قائمة المواد المفصلة ({new Intl.NumberFormat('ar-SA').format(totalItems)} مادة دعوية)</h3>
          <p className="text-xs text-slate-500 mt-1">تصفّح وشاهد جميع المقاطع والدروس المسجلة مع إمكانية الفلترة السريعة والفرز</p>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-medium">عرض:</span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(parseInt(e.target.value));
              setPage(1);
            }}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 focus:border-brand-500 rounded-lg px-2 py-1.5 outline-none cursor-pointer"
            id="table-limit-select"
          >
            <option value={10}>١٠ أسطر</option>
            <option value={15}>١٥ سطر</option>
            <option value={25}>٢٥ سطر</option>
            <option value={50}>٥٠ سطر</option>
          </select>
        </div>
      </div>

      {/* Actual Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse text-slate-600 text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-150 text-slate-700 font-bold uppercase tracking-wider">
              <th className="py-3.5 px-5 font-semibold text-slate-600">المادة الدعوية</th>
              <th className="py-3.5 px-4 font-semibold text-slate-600">
                <button onClick={() => handleSort('sheikh')} className="flex items-center gap-1.5 hover:text-brand-600 transition-colors">
                  <span>الشيخ / الداعية</span>
                  <ArrowUpDown size={12} className="text-slate-400" />
                </button>
              </th>
              <th className="py-3.5 px-4 font-semibold text-slate-600">المنصة</th>
              <th className="py-3.5 px-4 font-semibold text-slate-600">نوع المحتوى</th>
              <th className="py-3.5 px-4 font-semibold text-slate-600">المدة</th>
              <th className="py-3.5 px-4 font-semibold text-slate-600">
                <button onClick={() => handleSort('uploadDate')} className="flex items-center gap-1.5 hover:text-brand-600 transition-colors">
                  <span>تاريخ الرفع</span>
                  <ArrowUpDown size={12} className="text-slate-400" />
                </button>
              </th>
              <th className="py-3.5 px-4 font-semibold text-slate-600">
                <button onClick={() => handleSort('interactions')} className="flex items-center gap-1.5 hover:text-brand-600 transition-colors">
                  <span>إجمالي التفاعلات</span>
                  <ArrowUpDown size={12} className="text-slate-400" />
                </button>
              </th>
              <th className="py-3.5 px-5 text-center font-semibold text-slate-600">الرابط</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: limit }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td className="py-4 px-5"><div className="h-4 bg-slate-100 rounded w-4/5" /></td>
                  <td className="py-4 px-4"><div className="h-4 bg-slate-100 rounded w-2/3" /></td>
                  <td className="py-4 px-4"><div className="h-4 bg-slate-100 rounded w-16" /></td>
                  <td className="py-4 px-4"><div className="h-4 bg-slate-100 rounded w-20" /></td>
                  <td className="py-4 px-4"><div className="h-4 bg-slate-100 rounded w-12" /></td>
                  <td className="py-4 px-4"><div className="h-4 bg-slate-100 rounded w-24" /></td>
                  <td className="py-4 px-4"><div className="h-4 bg-slate-100 rounded w-16" /></td>
                  <td className="py-4 px-5"><div className="h-6 bg-slate-100 rounded w-16 mx-auto" /></td>
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty state
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <PlayCircle size={40} className="text-slate-300" />
                    <p className="text-sm font-semibold">لم يتم العثور على أي مواد تطابق التصفية الحالية</p>
                    <p className="text-xs">يرجى تعديل خيارات البحث أو التصفية والمحاولة مرة أخرى</p>
                  </div>
                </td>
              </tr>
            ) : (
              // Actual rows
              data.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-5">
                    <p className="font-semibold text-slate-800 line-clamp-1 max-w-xs md:max-w-md lg:max-w-lg" title={item.title}>
                      {item.title}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">{item.sheikh}</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getPlatformBadgeClass(item.platform)}`}>
                      {item.platform}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getContentTypeBadgeClass(item.contentType)}`}>
                      {item.contentType}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500 font-medium">
                    <div className="flex items-center gap-1">
                      <Clock size={12} className="text-slate-400" />
                      <span>{item.duration || '--:--'}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-medium">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} className="text-slate-400" />
                      <span>{item.uploadDate ? item.uploadDate.split(' ')[0] : 'غير معروف'}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                    {new Intl.NumberFormat('ar-SA').format(item.interactions)}
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    {item.link ? (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        referrerPolicy="no-referrer"
                        className="inline-flex items-center gap-1 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-lg px-2.5 py-1 font-bold text-[11px] transition-all"
                      >
                        <span>رابط المادة</span>
                        <ExternalLink size={11} />
                      </a>
                    ) : (
                      <span className="text-slate-400 text-[10px]">غير متوفر</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <span className="text-xs text-slate-500 font-semibold" id="table-page-info">
            الصفحة <span className="font-bold text-slate-800">{new Intl.NumberFormat('ar-SA').format(page)}</span> من <span className="font-bold text-slate-800">{new Intl.NumberFormat('ar-SA').format(totalPages)}</span> (عرض {(page - 1) * limit + 1}-{Math.min(page * limit, totalItems)} من إجمالي {new Intl.NumberFormat('ar-SA').format(totalItems)} مادة)
          </span>

          <div className="flex items-center gap-1.5" id="table-pagination-buttons">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1 || isLoading}
              className="p-1.5 text-slate-600 hover:text-brand-700 disabled:text-slate-300 disabled:pointer-events-none hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 bg-white"
              title="الصفحة السابقة"
            >
              <ChevronLeft size={16} />
            </button>
            
            {renderPagination()}

            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages || isLoading}
              className="p-1.5 text-slate-600 hover:text-brand-700 disabled:text-slate-300 disabled:pointer-events-none hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 bg-white"
              title="الصفحة التالية"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
