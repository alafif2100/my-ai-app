import React from 'react';
import { Search, Filter, RotateCcw, ChevronDown } from 'lucide-react';
import { FilterOptions } from '../types';

interface FiltersBarProps {
  search: string;
  setSearch: (s: string) => void;
  selectedSheikh: string;
  setSelectedSheikh: (s: string) => void;
  selectedPlatform: string;
  setSelectedPlatform: (s: string) => void;
  selectedContentType: string;
  setSelectedContentType: (s: string) => void;
  filterOptions: FilterOptions | null;
  onReset: () => void;
  isStatsLoading: boolean;
}

export default function FiltersBar({
  search,
  setSearch,
  selectedSheikh,
  setSelectedSheikh,
  selectedPlatform,
  setSelectedPlatform,
  selectedContentType,
  setSelectedContentType,
  filterOptions,
  onReset,
  isStatsLoading
}: FiltersBarProps) {
  return (
    <div 
      id="filters-bar-container" 
      className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Filter className="text-brand-500" size={18} />
          <h2 className="text-base font-bold text-slate-800">خيارات التصفية والبحث</h2>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors bg-slate-50 hover:bg-brand-50 border border-slate-150 rounded-lg px-2.5 py-1.5"
          id="reset-filters-btn"
        >
          <RotateCcw size={13} />
          <span>إعادة تعيين</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="relative" id="search-filter-col">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">البحث المباشر</label>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالعنوان أو اسم الشيخ..."
              className="w-full text-sm bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-brand-500 rounded-xl pr-10 pl-4 py-2.5 outline-none transition-all duration-200 text-slate-700"
              id="search-input-field"
            />
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>
        </div>

        {/* Sheikh Filter */}
        <div id="sheikh-filter-col">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">الشيخ / الداعية</label>
          <div className="relative">
            <select
              value={selectedSheikh}
              onChange={(e) => setSelectedSheikh(e.target.value)}
              className="w-full text-sm bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-brand-500 rounded-xl px-3 py-2.5 outline-none transition-all duration-200 text-slate-700 appearance-none cursor-pointer"
              id="sheikh-select-field"
            >
              <option value="all">كل المشايخ والدعاة</option>
              {filterOptions?.sheikhs.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name} ({s.count})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
          </div>
        </div>

        {/* Platform Filter */}
        <div id="platform-filter-col">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">المنصة</label>
          <div className="relative">
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-full text-sm bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-brand-500 rounded-xl px-3 py-2.5 outline-none transition-all duration-200 text-slate-700 appearance-none cursor-pointer"
              id="platform-select-field"
            >
              <option value="all">كل المنصات</option>
              {filterOptions?.platforms.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name} ({p.count})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
          </div>
        </div>

        {/* Content Type Filter */}
        <div id="contenttype-filter-col">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">نوع المحتوى</label>
          <div className="relative">
            <select
              value={selectedContentType}
              onChange={(e) => setSelectedContentType(e.target.value)}
              className="w-full text-sm bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-brand-500 rounded-xl px-3 py-2.5 outline-none transition-all duration-200 text-slate-700 appearance-none cursor-pointer"
              id="contenttype-select-field"
            >
              <option value="all">كل أنواع المحتوى</option>
              {filterOptions?.contentTypes.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.count})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
          </div>
        </div>
      </div>
    </div>
  );
}
