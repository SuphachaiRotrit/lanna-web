import React from 'react';
import { Users, UserPlus, FileClock, UserCheck, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { DashboardStats } from '@/services/dashboard.service';

interface StatsCardProps {
  stats: DashboardStats | undefined;
}

export const StatsOverview: React.FC<StatsCardProps> = ({ stats }) => {
  const overviewCards = [
    { 
      title: 'ผู้สมัครทั้งหมด', 
      value: stats?.overview?.totalApplicants || 0, 
      icon: Users, 
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-500',
      trend: null,
      subtitle: 'ตั้งแต่เปิดระบบ'
    },
    { 
      title: 'ผู้สมัครปีนี้', 
      value: stats?.overview?.thisYearApplicants || 0, 
      icon: UserPlus, 
      iconBg: 'bg-brand/5',
      iconColor: 'text-brand',
      trend: 'up',
      subtitle: `ปีการศึกษา ${stats?.overview?.currentYear || ''}`
    },
    { 
      title: 'รอตรวจสอบ', 
      value: stats?.statusBreakdown?.find((s) => s.status === 'PENDING')?.count || 0,
      icon: FileClock, 
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-500',
      trend: null,
      subtitle: 'ต้องดำเนินการ'
    },
    { 
      title: 'อนุมัติแล้ว', 
      value: stats?.statusBreakdown?.find((s) => s.status === 'APPROVED')?.count || 0,
      icon: UserCheck, 
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
      trend: 'up',
      subtitle: 'ผ่านเกณฑ์'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {overviewCards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div 
            key={idx} 
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-150 transition-all duration-300 group cursor-default"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${card.iconBg} group-hover:scale-105 transition-transform duration-300`}>
                <Icon size={18} className={card.iconColor} strokeWidth={2} />
              </div>
              {card.trend && (
                <div className={`flex items-center gap-0.5 px-2 py-1 rounded-md text-[12px] font-bold ${
                  card.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                }`}>
                  {card.trend === 'up' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                  {card.trend === 'up' ? 'Active' : 'Down'}
                </div>
              )}
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-0.5 tabular-nums tracking-tight">
              {card.value.toLocaleString()}
            </h3>
            <p className="text-[13px] font-bold text-gray-400">{card.title}</p>
            <p className="text-[12px] font-medium text-gray-300 mt-0.5">{card.subtitle}</p>
          </div>
        );
      })}
    </div>
  );
};
