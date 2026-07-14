import React from 'react';
import { Edit2, Trash2, Loader2 } from 'lucide-react';
import { Faculty } from '@/types';
import { Skeleton } from '@/components/ui/Skeleton';

interface FacultyTableProps {
  faculties: Faculty[];
  onEdit: (faculty: Faculty) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
  deletingId?: string;
}

export const FacultyTable: React.FC<FacultyTableProps> = ({ faculties, onEdit, onDelete, isLoading, deletingId }) => {
  if (!isLoading && faculties.length === 0) return (
    <div className="p-16 text-center text-gray-400 font-bold bg-white rounded-2xl border border-gray-100">
      ไม่พบข้อมูลคณะ
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50/80 border-b border-gray-100">
            <th className="px-6 py-4 text-[12px] font-extrabold text-gray-400 uppercase tracking-[0.15em]">ชื่อคณะ</th>
            <th className="px-6 py-4 text-[12px] font-extrabold text-gray-400 uppercase tracking-[0.15em] text-right">จัดการ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {isLoading ? Array.from({ length: 5 }).map((_, i) => (
            <tr key={i}>
              <td className="px-6 py-4"><Skeleton className="h-4 w-40" /></td>
              <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-8 ml-auto" /></td>
            </tr>
          )) : faculties.map((faculty) => (
            <tr key={faculty.id} className="group hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-4 text-sm font-bold text-gray-800">{faculty.name}</td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit(faculty)}
                    className="p-2 text-gray-400 hover:text-brand hover:bg-brand/5 rounded-lg transition-all"
                    title="แก้ไข"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(faculty.id)}
                    disabled={deletingId === faculty.id}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title="ลบ"
                  >
                    {deletingId === faculty.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
