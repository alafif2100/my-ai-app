import React from 'react';
import { motion } from 'motion/react';
import { Video, Heart, Users, Share2, TrendingUp } from 'lucide-react';
import { KPIStats } from '../types';

interface KPICardsProps {
  kpis: KPIStats;
  isLoading: boolean;
}

export default function KPICards({ kpis, isLoading }: KPICardsProps) {
  const cards = [
    {
      title: 'إجمالي المواد الدعوية',
      value: kpis.totalMaterials,
      icon: Video,
      desc: 'مقطع ودرس ومحاضرة',
      color: 'from-emerald-500/10 to-teal-500/5 text-emerald-700 border-emerald-500/10',
      iconColor: 'bg-emerald-500 text-white'
    },
    {
      title: 'إجمالي التفاعلات',
      value: kpis.totalInteractions,
      icon: Heart,
      desc: 'مشاهدة، إعجاب، ومشاركة',
      color: 'from-amber-500/10 to-orange-500/5 text-amber-700 border-amber-500/10',
      iconColor: 'bg-amber-500 text-white'
    },
    {
      title: 'معدل التفاعل للمادة',
      value: kpis.avgInteractions,
      icon: TrendingUp,
      desc: 'متوسط التفاعل للمقطع الواحد',
      color: 'from-blue-500/10 to-indigo-500/5 text-blue-700 border-blue-500/10',
      iconColor: 'bg-blue-500 text-white'
    },
    {
      title: 'عدد الدعاة والمشايخ',
      value: kpis.uniqueSheikhsCount,
      icon: Users,
      desc: 'شيخ وداعية مسجل',
      color: 'from-purple-500/10 to-pink-500/5 text-purple-700 border-purple-500/10',
      iconColor: 'bg-purple-500 text-white'
    },
    {
      title: 'المنصات الدعوية',
      value: kpis.uniquePlatformsCount,
      icon: Share2,
      desc: 'منصات نشر مختلفة',
      color: 'from-sky-500/10 to-blue-500/5 text-sky-700 border-sky-500/10',
      iconColor: 'bg-sky-500 text-white'
    }
  ];

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ar-SA').format(num);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4" id="kpi-cards-container">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            id={`kpi-card-${i}`}
            className={`relative bg-gradient-to-br ${card.color} border p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between overflow-hidden`}
          >
            {/* Background Accent Circle */}
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">{card.title}</p>
                {isLoading ? (
                  <div className="h-8 w-24 bg-slate-200 animate-pulse rounded my-2" />
                ) : (
                  <h3 className="text-2xl font-bold tracking-tight font-mono text-slate-800">
                    {formatNumber(card.value)}
                  </h3>
                )}
              </div>
              <div className={`p-2.5 rounded-xl ${card.iconColor} shadow-inner`}>
                <Icon size={20} />
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-200/20">
              <span className="text-xs text-slate-500 font-normal">
                {card.desc}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
