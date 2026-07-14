import React from 'react';
import { Edit2, Trash2, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import { Program } from '@/types';
import { Skeleton } from '@/components/ui/Skeleton';

interface ProgramTableProps {
  programs: Program[];
  onEdit: (program: Program) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
  deletingId?: string;
}

export const ProgramTable: React.FC<ProgramTableProps> = ({ programs, onEdit, onDelete, isLoading, deletingId }) => {
  if (!isLoading && programs.length === 0) return (
    <div className="p-16 text-center text-gray-400 font-bold bg-white rounded-2xl border border-gray-100">
      ไม่พบข้อมูลสาขาวิชา
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="px-6 py-4 text-[12px] font-extrabold text-gray-400 uppercase tracking-[0.15em]">สาขาวิชา</th>
              <th className="px-5 py-4 text-[12px] font-extrabold text-gray-400 uppercase tracking-[0.15em]">คณะ / วุฒิ</th>
              <th className="px-5 py-4 text-[12px] font-extrabold text-gray-400 uppercase tracking-[0.15em]">โควตา</th>
              <th className="px-5 py-4 text-[12px] font-extrabold text-gray-400 uppercase tracking-[0.15em]">สถานะ</th>
              <th className="px-6 py-4 text-[12px] font-extrabold text-gray-400 uppercase tracking-[0.15em] text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td className="px-6 py-4"><Skeleton className="h-4 w-48" /></td>
                <td className="px-5 py-4"><Skeleton className="h-4 w-32" /></td>
                <td className="px-5 py-4"><Skeleton className="h-4 w-28" /></td>
                <td className="px-5 py-4"><Skeleton className="h-6 w-20 rounded-lg" /></td>
                <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-8 ml-auto" /></td>
              </tr>
            )) : programs.map((program) => {
              const quotaPercent = Math.min((program.currentApplicants / program.maxQuota) * 100, 100);
              const isNearFull = quotaPercent >= 80;
              
              return (
                <tr 
                  key={program.id} 
                  className={`group transition-colors ${
                    !program.isActive ? 'bg-gray-50/40' : 'hover:bg-gray-50/50'
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <p className={`text-[13px] font-bold ${!program.isActive ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                          {program.name}
                        </p>
                        {program.duration && (
                          <span className={`px-1.5 py-0.5 rounded-md text-[12px] font-bold flex items-center gap-0.5 ${
                            !program.isActive 
                              ? 'bg-gray-100 text-gray-400' 
                              : 'bg-brand/8 text-brand'
                          }`}>
                            <Clock size={9} /> {program.duration} ปี
                          </span>
                        )}
                      </div>
                      <p className={`text-[12px] font-semibold ${!program.isActive ? 'text-gray-300' : 'text-brand/70'}`}>
                        {program.description || 'หลักสูตรปกติ'}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className={`text-xs font-bold ${!program.isActive ? 'text-gray-400' : 'text-gray-600'}`}>{program.faculty?.name}</p>
                    <p className="text-[12px] text-gray-300 font-medium mt-0.5">{program.degree}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="min-w-[120px]">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[13px] font-extrabold tabular-nums ${
                          program.isFull ? 'text-red-500' : isNearFull ? 'text-amber-500' : 'text-gray-700'
                        }`}>
                          {program.currentApplicants}/{program.maxQuota}
                        </span>
                        <span className={`text-[12px] font-bold ${
                          program.isFull ? 'text-red-400' : 'text-gray-300'
                        }`}>
                          {Math.round(quotaPercent)}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ${
                            program.isFull ? 'bg-red-400' : isNearFull ? 'bg-amber-400' : 'bg-brand/60'
                          }`}
                          style={{ width: `${quotaPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {program.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[12px] font-bold border border-emerald-100">
                        <CheckCircle2 size={11} /> เปิดรับ
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-400 text-[12px] font-bold border border-gray-150">
                        <XCircle size={11} /> ปิดรับ
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onEdit(program)} 
                        className="p-2 text-gray-400 hover:text-brand hover:bg-brand/5 rounded-lg transition-all"
                        title="แก้ไข"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(program.id)}
                        disabled={deletingId === program.id}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title="ลบ"
                      >
                        {deletingId === program.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      {!isLoading && (
        <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[12px] font-bold text-gray-400">
            แสดง {programs.length} รายการ
          </span>
          <div className="flex items-center gap-3 text-[12px] font-bold text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
              เปิดรับ {programs.filter(p => p.isActive).length}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
              ปิดรับ {programs.filter(p => !p.isActive).length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
