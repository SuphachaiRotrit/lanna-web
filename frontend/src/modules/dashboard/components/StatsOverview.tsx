import React from 'react';
import { Users, UserPlus, FileClock, UserCheck, GraduationCap, ClipboardCheck, ArrowUpRight, ArrowDownRight } from 'lucide-react';
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
      title: 'ผ่านการสมัคร',
      value: stats?.statusBreakdown?.find((s) => s.status === 'APPROVED')?.count || 0,
      icon: UserCheck, 
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
      trend: 'up',
      subtitle: 'ผ่านเกณฑ์'
    },
    {
      title: 'รายงานตัวแล้ว',
      value: stats?.overview?.reportedInCount || 0,
      icon: GraduationCap,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-500',
      trend: null,
      subtitle: 'ยืนยันเข้าเรียนแล้ว'
    },
  ];

  const passed = stats?.examResultBreakdown?.find((e) => e.examResult === 'PASSED')?.count || 0;
  const failed = stats?.examResultBreakdown?.find((e) => e.examResult === 'FAILED')?.count || 0;
  const examTotal = passed + failed;
  const passedPct = examTotal ? (passed / examTotal) * 100 : 0;
  const failedPct = examTotal ? (failed / examTotal) * 100 : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-150 transition-all duration-300 group cursor-default">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2.5 rounded-xl bg-violet-50 group-hover:scale-105 transition-transform duration-300">
            <ClipboardCheck size={18} className="text-violet-500" strokeWidth={2} />
          </div>
        </div>
        <div className="flex items-end justify-between gap-2 mb-3">
          <div>
            <h3 className="text-2xl font-extrabold text-emerald-600 tabular-nums tracking-tight">{passed.toLocaleString()}</h3>
            <p className="text-[12px] font-bold text-gray-400 mt-0.5">สอบผ่าน</p>
          </div>
          <div className="text-right">
            <h3 className="text-2xl font-extrabold text-red-500 tabular-nums tracking-tight">{failed.toLocaleString()}</h3>
            <p className="text-[12px] font-bold text-gray-400 mt-0.5">สอบไม่ผ่าน</p>
          </div>
        </div>
        <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden flex">
          {examTotal ? (
            <>
              <div className="h-full bg-emerald-400" style={{ width: `${passedPct}%` }} />
              <div className="h-full bg-red-400" style={{ width: `${failedPct}%` }} />
            </>
          ) : (
            <div className="h-full w-full bg-gray-100" />
          )}
        </div>
      </div>
    </div>
  );
};
