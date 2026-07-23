import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { BarChart3, PieChart as PieIcon, LineChart as LineIcon, Activity } from 'lucide-react';
import { DashboardStats } from '../types';

interface ChartsSectionProps {
  stats: DashboardStats | null;
  isLoading: boolean;
}

const COLORS = [
  '#105e42', // brand emerald
  '#0284c7', // sky
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#3b82f6', // blue
  '#14b8a6', // teal
  '#f43f5e', // rose
];

export default function ChartsSection({ stats, isLoading }: ChartsSectionProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="charts-loading-container">
        {[1, 2, 3, 4].map((id) => (
          <div key={id} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm h-80 animate-pulse flex flex-col justify-between">
            <div className="h-6 w-1/3 bg-slate-200 rounded" />
            <div className="h-48 w-full bg-slate-100 rounded my-4" />
            <div className="h-4 w-1/4 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(1) + 'M';
    }
    if (num >= 1_000) {
      return (num / 1_000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-800 text-xs font-sans">
          <p className="font-bold mb-1.5 border-b border-slate-800 pb-1">{label}</p>
          {payload.map((p: any, index: number) => (
            <p key={index} className="flex justify-between items-center gap-4 py-0.5">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fill || p.color }} />
                {p.name === 'count' ? 'عدد المواد' : p.name === 'interactions' ? 'إجمالي التفاعلات' : p.name}:
              </span>
              <span className="font-mono font-bold text-white">
                {new Intl.NumberFormat('ar-SA').format(p.value)}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="charts-dashboard-container">
      {/* Chart 1: Top Sheikhs by Interactions */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between" id="chart-top-sheikhs">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="text-brand-500" size={18} />
          <h3 className="text-sm font-bold text-slate-800">أكثر 10 مشايخ تفاعلاً ونشاطاً</h3>
        </div>
        <div className="h-72 w-full text-xs font-sans">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stats.topSheikhs}
              margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                stroke="#334155" 
                tickLine={false} 
                axisLine={false}
                tick={({ x, y, payload }: any) => {
                  // تقسيم الاسم الطويل إلى أسطر بناءً على المسافات
                  const words = payload.value.split(' ');
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text
                        x={0}
                        y={0}
                        dy={10}
                        textAnchor="middle"
                        fill="#1e293b"
                        fontSize={10}
                        fontWeight={600}
                        >
                         {words.map((word: string, index: number) => (
                           <tspan x={0} dy={index === 0 ? 0 : 12} key={index}>
                             {word}
                          </tspan>
                        ))}
                      </text>
                    </g>
                  );
                }}
                interval={0}
                height={90}
                reversed={true}
                />
              
              <YAxis 
                stroke="#64748b" 
                tickLine={false} 
                axisLine={false}
                tickFormatter={formatNumber}
                tick={{ fontSize: 10 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={36} 
                formatter={(value) => (value === 'count' ? 'عدد المواد' : 'إجمالي التفاعلات')}
              />
              <Bar dataKey="interactions" fill="#105e42" radius={[4, 4, 0, 0]} name="interactions" />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Platforms Distribution */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between" id="chart-platforms">
        <div className="flex items-center gap-2 mb-4">
          <PieIcon className="text-sky-500" size={18} />
          <h3 className="text-sm font-bold text-slate-800">توزيع التفاعلات ونسب النشر عبر المنصات</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="h-56 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.platforms}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="interactions"
                  nameKey="name"
                >
                  {stats.platforms.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {stats.platforms.map((p, index) => (
              <div key={p.name} className="flex items-center justify-between border-b border-slate-50 pb-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="font-semibold text-slate-700">{p.name}</span>
                </div>
                <div className="flex flex-col items-end text-left font-mono">
                  <span className="text-slate-800 font-bold">{new Intl.NumberFormat('ar-SA').format(p.interactions)} تفاعل</span>
                  <span className="text-slate-400 text-[10px]">{p.count} مقطع</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart 3: Content Types Distribution */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between" id="chart-content-types">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="text-gold-500" size={18} />
            <h3 className="text-sm font-bold text-slate-800">توزيع المحتوى الدعوي وحجم التأثير</h3>
          </div>
          <span className="text-[10px] bg-gold-50 text-gold-700 font-bold border border-gold-100 rounded-full px-2 py-0.5">
            تحليل نوع المادة
          </span>
        </div>

        {/* Improved Bento list + bar representation */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Progress Breakdown list */}
          <div className="md:col-span-5 space-y-3.5">
            {stats.contentTypes.map((c, index) => {
              const maxVal = Math.max(...stats.contentTypes.map(x => x.count));
              const percentage = maxVal > 0 ? Math.round((c.count / maxVal) * 100) : 0;
              return (
                <div key={c.name} className="bg-slate-50/50 hover:bg-slate-50 border border-slate-100 p-2.5 rounded-xl transition-all">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-xs text-slate-700">{c.name}</span>
                    <span className="text-xs font-mono font-bold text-brand-600">{new Intl.NumberFormat('ar-SA').format(c.count)} مادة</span>
                  </div>
                  
                  {/* Styled Progress Bar */}
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-l from-brand-500 to-gold-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center mt-1.5 text-[10px] text-slate-400 font-medium">
                    <span>نسبة الحضور النسبي</span>
                    <span className="font-mono text-slate-600 font-bold">{new Intl.NumberFormat('ar-SA').format(c.interactions)} تفاعل إجمالي</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Elegant Recharts representation */}
          <div className="md:col-span-7 h-56 w-full text-xs font-sans">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.contentTypes}
                margin={{ top: 10, right: -5, left: -25, bottom: 5 }}
                barSize={20}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fontSize: 10, fontWeight: 600 }}
                />
                <YAxis 
                  stroke="#64748b" 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={formatNumber}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  name="count" 
                  fill="#004b87" 
                  radius={[4, 4, 0, 0]}
                >
                  {stats.contentTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#004b87' : '#c5a059'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart 4: Timeline Publications - Displaying ONLY Publication Count Curve */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between" id="chart-timeline">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <LineIcon className="text-brand-500" size={18} />
            <h3 className="text-sm font-bold text-slate-800">منحنى النشر السنوي (حجم الإنتاجية مستقلة لكل عام)</h3>
          </div>
          <span className="text-[10px] bg-brand-50 text-brand-700 font-bold border border-brand-100 rounded-full px-2 py-0.5">
            عدد المواد فقط
          </span>
        </div>
        
        <div className="h-72 w-full text-xs font-sans">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={stats.timeline}
              margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorCountGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#004b87" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#004b87" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="year" 
                stroke="#64748b" 
                tickLine={false} 
                axisLine={false}
                tick={{ fontSize: 10, fontWeight: 500 }}
              />
              <YAxis 
                stroke="#64748b" 
                tickLine={false} 
                axisLine={false}
                tickFormatter={formatNumber}
                tick={{ fontSize: 10 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#004b87" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorCountGrad)" 
                name="count"
                dot={{ r: 5, strokeWidth: 2, fill: '#ffffff', stroke: '#004b87' }}
                activeDot={{ r: 7 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
