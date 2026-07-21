'use client';

import React, { useState } from 'react';
import { Award, BookOpen, Users, Clock, RefreshCw } from 'lucide-react';
import { useDashboardStats } from '../hooks/use-dashboard';
import { StatsOverview } from '../components/StatsOverview';
import { TrendChart } from '../components/TrendChart';
import { ExamByProgramChart } from '../components/ExamByProgramChart';
import { Skeleton } from '@/components/ui/Skeleton';
import { YearPicker } from '@/components/ui/FormControls';
import { toBuddhistYear } from '@/lib/date';
import { useSetting } from '@/modules/settings/hooks/use-settings';

export const DashboardView = () => {
  const [selectedYear, setSelectedYear] = useState(toBuddhistYear(new Date().getFullYear()));
  const { data: settingRes } = useSetting();
  const [appliedSettingYear, setAppliedSettingYear] = useState<number | undefined>(undefined);

  if (settingRes?.data && settingRes.data.currentApplicationYear !== appliedSettingYear) {
    setAppliedSettingYear(settingRes.data.currentApplicationYear);
    setSelectedYear(settingRes.data.currentApplicationYear);
  }

  const { data: res, isLoading, isFetching, refetch } = useDashboardStats(selectedYear);
  const stats = res?.data;

  if (isLoading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white p-7 rounded-2xl shadow-sm border border-gray-100">
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[12px] font-bold text-brand uppercase tracking-[0.2em] bg-brand/5 px-2.5 py-1 rounded-md">Dashboard</span>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">ภาพรวมการรับสมัคร</h2>
          <p className="text-gray-400 text-sm font-medium mt-0.5">สรุปข้อมูลการรับสมัครนักศึกษาและสถิติที่สำคัญ</p>
        </div>
        <div className="flex items-end gap-3">
          <div className="w-44">
            <YearPicker label="ปีการศึกษา" value={selectedYear} onChange={setSelectedYear} />
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white rounded-xl border border-gray-100 shadow-sm text-[13px] font-bold text-gray-400 hover:text-navy hover:border-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={12} className={isFetching ? 'animate-spin' : ''} />
            รีเฟรช
          </button>
          <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-white rounded-xl border border-gray-100 shadow-sm text-[13px] font-bold text-gray-400">
            <Clock size={12} className="text-gray-300" />
            อัปเดต {new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
          </div>
        </div>
      </div>

      <StatsOverview stats={stats} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
           <TrendChart data={stats?.monthlyTrend || []} year={stats?.overview?.currentYear || 0} />
        </div>

        {/* Popular Programs Side Panel */}
        <div className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-extrabold text-gray-800 flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                <Award size={16} className="text-amber-500" />
              </div>
              หลักสูตรยอดนิยม
            </h3>
            <span className="text-[12px] font-bold text-gray-300 uppercase tracking-widest">Top 5</span>
          </div>
          <div className="space-y-4">
            {stats?.programBreakdown?.sort((a, b) => b.count - a.count).slice(0, 5).map((prog, idx: number) => (
              <div key={idx} className="group">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[12px] font-black ${
                      idx === 0 ? 'bg-amber-50 text-amber-600' : idx === 1 ? 'bg-gray-100 text-gray-500' : 'bg-gray-50 text-gray-400'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-gray-700 truncate max-w-[140px]">{prog.programName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-extrabold text-gray-800">{prog.count}</span>
                    <Users size={10} className="text-gray-300" />
                  </div>
                </div>
                <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      idx === 0 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-brand/60 to-brand/40'
                    }`}
                    style={{ width: `${Math.min((prog.count / (stats.overview.thisYearApplicants || 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
            {(!stats?.programBreakdown || stats.programBreakdown.length === 0) && (
              <div className="text-center py-10">
                <BookOpen className="mx-auto text-gray-200 mb-3" size={40} />
                <p className="text-gray-400 text-xs font-bold">ยังไม่มีข้อมูลการสมัคร</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ExamByProgramChart data={stats?.examByProgramBreakdown || []} />
    </div>
  );
};
