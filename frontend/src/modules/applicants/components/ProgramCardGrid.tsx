'use client';

import React from 'react';
import { GraduationCap, Users, LayoutGrid } from 'lucide-react';
import { Program } from '@/types';
import { PremiumCard } from '@/components/ui/PremiumBase';
import { Skeleton } from '@/components/ui/Skeleton';

interface ProgramCardGridProps {
  programs: Program[];
  loading: boolean;
  onSelect: (programId: string | null) => void;
}

export const ProgramCardGrid: React.FC<ProgramCardGridProps> = ({ programs, loading, onSelect }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border-2 border-gray-50/50 space-y-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <button type="button" onClick={() => onSelect(null)} className="text-left">
        <PremiumCard className="p-6 h-full hover:border-brand/30 cursor-pointer transition-colors">
          <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center mb-4">
            <LayoutGrid size={18} className="text-navy" />
          </div>
          <p className="text-sm font-black text-navy">ทั้งหมด</p>
          <p className="text-[12px] text-gray-400 font-bold mt-0.5">ทุกสาขาวิชา</p>
        </PremiumCard>
      </button>
      {programs.map((program) => (
        <button key={program.id} type="button" onClick={() => onSelect(program.id)} className="text-left">
          <PremiumCard className="p-6 h-full hover:border-brand/30 cursor-pointer transition-colors">
            <div className="w-10 h-10 rounded-xl bg-brand/5 flex items-center justify-center mb-4">
              <GraduationCap size={18} className="text-brand" />
            </div>
            <p className="text-sm font-black text-navy truncate">{program.name}</p>
            <p className="text-[12px] text-gray-400 font-bold mt-0.5 truncate">{program.faculty?.name}</p>
            <div className="flex items-center gap-1 mt-3 text-[12px] font-bold text-gray-400">
              <Users size={12} />
              {program.currentApplicants} คน
            </div>
          </PremiumCard>
        </button>
      ))}
    </div>
  );
};
