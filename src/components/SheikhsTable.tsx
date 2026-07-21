import React, { useState } from 'react';
import { Search, ArrowUpDown, Award, Film, Heart, Sparkles, TrendingUp, HelpCircle } from 'lucide-react';
import { ChartDataPoint } from '../types';

interface SheikhsTableProps {
  sheikhsData: ChartDataPoint[] | undefined;
  isLoading: boolean;
}

export default function SheikhsTable({ sheikhsData = [], isLoading }: SheikhsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'name' | 'count' | 'interactions' | 'avg'>('interactions');
  const [sortAsc, setSortAsc] = useState(false);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ar-SA').format(num);
  };

  const handleSort = (field: 'name' | 'count' | 'interactions' | 'avg') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Pre-calculate statistics for the sheikhs list
  const processedSheikhs = sheikhsData.map(s => {
    const avg = s.count > 0 ? Math.round(s.interactions / s.count) : 0;
    return {
      ...s,
      avg
    };
  });

  const totalInteractionsAll = processedSheikhs.reduce((acc, curr) => acc + curr.interactions, 0);

  // Filter sheikhs based on search
  const filteredSheikhs = processedSheikhs.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort sheikhs
  filteredSheikhs.sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (typeof valA === 'string') {
      return sortAsc ? valA.localeCompare(valB as string) : (valB as string).localeCompare(valA);
    }

    return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
  });

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden" id="sheikhs-table-container">
      {/* Header Controls */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-l from-slate-50 to-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-gold-500/10 text-gold-700 border border-gold-500/20 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Award size={10} />
              <span>إحصائيات مفصلة</span>
            </span>
            <h3 className="text-sm font-bold text-slate-800">تحليل وتقييم أداء الدعاة والمشايخ</h3>
          </div>
          <p className="text-xs text-slate-500">
            تتبع إنتاجية المشايخ (عدد المواد المنشورة) وإجمالي مستويات التفاعل ومعدل التأثير لكل مادة دعوية.
          </p>
        </div>

        {/* Quick Search inside sheikhs */}
        <div className="relative w-full md:w-64">
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="البحث باسم الشيخ..."
            className="w-full text-xs bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-brand-500 rounded-xl pr-9 pl-3 py-2 outline-none transition-all text-slate-700"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-0.5 bg-slate-100 border-b border-slate-150">
        <div className="bg-white p-4 text-center">
          <p className="text-[10px] font-bold text-slate-400 mb-1">الداعية الأكثر نشراً للإنتاج</p>
          {processedSheikhs.length > 0 ? (
            <div>
              <p className="text-sm font-black text-brand-700">
                {[...processedSheikhs].sort((a,b) => b.count - a.count)[0]?.name}
              </p>
              <p className="text-xs font-mono font-bold text-slate-500">
                ({formatNumber([...processedSheikhs].sort((a,b) => b.count - a.count)[0]?.count)} مادة دعوية)
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400">---</p>
          )}
        </div>
        <div className="bg-white p-4 text-center">
          <p className="text-[10px] font-bold text-slate-400 mb-1">الداعية الأعلى جذباً للتفاعل</p>
          {processedSheikhs.length > 0 ? (
            <div>
              <p className="text-sm font-black text-brand-700">
                {[...processedSheikhs].sort((a,b) => b.interactions - a.interactions)[0]?.name}
              </p>
              <p className="text-xs font-mono font-bold text-slate-500">
                ({formatNumber([...processedSheikhs].sort((a,b) => b.interactions - a.interactions)[0]?.interactions)} تفاعل إجمالي)
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400">---</p>
          )}
        </div>
        <div className="bg-white p-4 text-center">
          <p className="text-[10px] font-bold text-slate-400 mb-1">الأعلى تأثيراً للمادة الواحدة (متوسط)</p>
          {processedSheikhs.length > 0 ? (
            <div>
              <p className="text-sm font-black text-brand-700">
                {[...processedSheikhs].sort((a,b) => b.avg - a.avg)[0]?.name}
              </p>
              <p className="text-xs font-mono font-bold text-slate-500">
                (بمتوسط {formatNumber([...processedSheikhs].sort((a,b) => b.avg - a.avg)[0]?.avg)} تفاعل لكل مادة)
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400">---</p>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse text-slate-600 text-xs">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-150 text-slate-700 font-bold uppercase tracking-wider">
              <th className="py-3 px-5 font-semibold text-slate-600 w-12">م</th>
              <th className="py-3 px-4 font-semibold text-slate-600">
                <button onClick={() => handleSort('name')} className="flex items-center gap-1.5 hover:text-brand-600 transition-colors">
                  <span>اسم الشيخ / الداعية</span>
                  <ArrowUpDown size={12} className="text-slate-400" />
                </button>
              </th>
              <th className="py-3 px-4 font-semibold text-slate-600">
                <button onClick={() => handleSort('count')} className="flex items-center gap-1.5 hover:text-brand-600 transition-colors">
                  <span>عدد المواد الدعوية</span>
                  <ArrowUpDown size={12} className="text-slate-400" />
                </button>
              </th>
              <th className="py-3 px-4 font-semibold text-slate-600">
                <button onClick={() => handleSort('interactions')} className="flex items-center gap-1.5 hover:text-brand-600 transition-colors">
                  <span>إجمالي التفاعلات المستقطبة</span>
                  <ArrowUpDown size={12} className="text-slate-400" />
                </button>
              </th>
              <th className="py-3 px-4 font-semibold text-slate-600">
                <button onClick={() => handleSort('avg')} className="flex items-center gap-1.5 hover:text-brand-600 transition-colors">
                  <span>معدل التأثير (تفاعل/مادة)</span>
                  <ArrowUpDown size={12} className="text-slate-400" />
                </button>
              </th>
              <th className="py-3 px-5 font-semibold text-slate-600">نسبة المساهمة في تفاعل اللوحة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td className="py-3 px-5"><div className="h-3.5 bg-slate-100 rounded w-6" /></td>
                  <td className="py-3 px-4"><div className="h-3.5 bg-slate-100 rounded w-32" /></td>
                  <td className="py-3 px-4"><div className="h-3.5 bg-slate-100 rounded w-16" /></td>
                  <td className="py-3 px-4"><div className="h-3.5 bg-slate-100 rounded w-24" /></td>
                  <td className="py-3 px-4"><div className="h-3.5 bg-slate-100 rounded w-20" /></td>
                  <td className="py-3 px-5"><div className="h-2 bg-slate-100 rounded w-full" /></td>
                </tr>
              ))
            ) : filteredSheikhs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                  لا يوجد نتائج مطابقة للبحث الحالي.
                </td>
              </tr>
            ) : (
              filteredSheikhs.map((sheikh, index) => {
                const contributionPct = totalInteractionsAll > 0 
                  ? Math.min(100, Math.round((sheikh.interactions / totalInteractionsAll) * 100))
                  : 0;

                return (
                  <tr key={sheikh.name} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-slate-400 font-bold">
                      {index + 1}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                        <span>{sheikh.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Film size={12} className="text-slate-400" />
                        <span>{formatNumber(sheikh.count)}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Heart size={12} className="text-gold-500 fill-gold-500/10" />
                        <span>{formatNumber(sheikh.interactions)}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-600 text-xs">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono">
                        {formatNumber(sheikh.avg)}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden shrink-0">
                          <div 
                            className="bg-gold-500 h-1.5 rounded-full" 
                            style={{ width: `${contributionPct}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] font-extrabold text-slate-500">
                          {formatNumber(contributionPct)}٪
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
