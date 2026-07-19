import React from 'react';
import { Clock, CheckCircle2, XCircle, Search, Eye, ChevronLeft, ChevronRight, RotateCcw, Loader2 } from 'lucide-react';
import { Applicant } from '@/services/applicant.service';
import { Pagination } from '@/types';
import { Skeleton } from '@/components/ui/Skeleton';

interface ApplicantTableProps {
  applicants: Applicant[];
  pagination: Partial<Pagination>;
  loading: boolean;
  onUpdateStatus: (id: string, status: string) => void;
  onView: (id: string) => void;
  onPageChange: (page: number) => void;
  currentPage: number;
  pendingStatusId?: string;
}

export const ApplicantTable: React.FC<ApplicantTableProps> = ({
  applicants, pagination, loading, onUpdateStatus, onView, onPageChange, currentPage, pendingStatusId
}) => {
  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-8 py-5 text-[12px] font-black text-gray-400 uppercase tracking-[0.2em]">ข้อมูลผู้สมัคร</th>
              <th className="px-6 py-5 text-[12px] font-black text-gray-400 uppercase tracking-[0.2em]">สาขาที่สมัคร</th>
              <th className="px-6 py-5 text-[12px] font-black text-gray-400 uppercase tracking-[0.2em]">เบอร์โทรศัพท์</th>
              <th className="px-6 py-5 text-[12px] font-black text-gray-400 uppercase tracking-[0.2em]">สถานะ</th>
              <th className="px-6 py-5 text-[12px] font-black text-gray-400 uppercase tracking-[0.2em]">ผลสอบ</th>
              <th className="px-8 py-5 text-[12px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? Array.from({ length: 6 }).map((_, i) => (
              <tr key={i}>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-6"><Skeleton className="h-4 w-32" /></td>
                <td className="px-6 py-6"><Skeleton className="h-4 w-24" /></td>
                <td className="px-6 py-6"><Skeleton className="h-6 w-20 rounded-full" /></td>
                <td className="px-6 py-6"><Skeleton className="h-6 w-20 rounded-full" /></td>
                <td className="px-8 py-6 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
              </tr>
            )) : applicants.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-navy/5 flex items-center justify-center font-bold text-navy text-sm">
                      {app.firstName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-navy leading-tight">{app.prefixName}{app.firstName} {app.lastName}</p>
                      <p className="text-[13px] text-gray-400 font-bold mt-0.5">{app.applicationNumber}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-6">
                  <p className="text-sm font-bold text-gray-700 truncate w-48">{app.program?.name}</p>
                  <p className="text-[12px] text-gray-400 font-medium uppercase tracking-tighter">{app.program?.faculty?.name}</p>
                </td>
                <td className="px-6 py-6 font-bold text-sm text-gray-600">{app.phone}</td>
                <td className="px-6 py-6">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-black uppercase tracking-wider ${
                    app.status === 'PENDING' ? 'bg-orange-100 text-orange-600' :
                    app.status === 'REVIEWING' ? 'bg-blue-100 text-blue-600' :
                    app.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' :
                    app.status === 'REJECTED' ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {app.status === 'PENDING' && <Clock size={12} />}
                    {app.status === 'REVIEWING' && <Eye size={12} />}
                    {app.status === 'APPROVED' && <CheckCircle2 size={12} />}
                    {app.status === 'REJECTED' && <XCircle size={12} />}
                    {app.status === 'PENDING' ? 'รอตรวจสอบ' :
                     app.status === 'REVIEWING' ? 'กำลังตรวจสอบ' :
                     app.status === 'APPROVED' ? 'อนุมัติแล้ว' :
                     app.status === 'REJECTED' ? 'ไม่ผ่าน' :
                     app.status === 'CANCELLED' ? 'ยกเลิก' : app.status}
                  </div>
                </td>
                <td className="px-6 py-6">
                  <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-black uppercase tracking-wider ${
                    app.examResult === 'PASSED' ? 'bg-emerald-100 text-emerald-600' :
                    app.examResult === 'FAILED' ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {app.examResult === 'PASSED' ? 'สอบผ่าน' : app.examResult === 'FAILED' ? 'สอบไม่ผ่าน' : 'รอสอบ'}
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {app.status === 'PENDING' ? (
                      <button
                        onClick={() => { onUpdateStatus(app.id, 'REVIEWING'); onView(app.id); }}
                        disabled={pendingStatusId === app.id}
                        className="flex items-center gap-1.5 px-3 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors text-xs font-black disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {pendingStatusId === app.id ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                        ตรวจสอบ
                      </button>
                    ) : (
                      <button
                        onClick={() => onView(app.id)}
                        className="flex items-center gap-1.5 px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors text-xs font-black"
                      >
                        <Eye size={16} />
                        ดูรายละเอียด
                      </button>
                    )}
                    {app.status === 'APPROVED' && (
                      <details className="relative">
                        <summary className="list-none flex items-center gap-1.5 px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors text-xs font-black cursor-pointer">
                          {pendingStatusId === app.id ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
                          ปรับสถานะ
                        </summary>
                        <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-100 rounded-xl shadow-xl z-10 overflow-hidden text-left">
                          <button
                            onClick={(e) => {
                              onUpdateStatus(app.id, 'PENDING');
                              (e.currentTarget.closest('details') as HTMLDetailsElement)?.removeAttribute('open');
                            }}
                            disabled={pendingStatusId === app.id}
                            className="w-full text-left px-4 py-2.5 text-xs font-bold text-orange-600 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            ส่งกลับไปรอตรวจใหม่
                          </button>
                          <button
                            onClick={(e) => {
                              onUpdateStatus(app.id, 'REVIEWING');
                              onView(app.id);
                              (e.currentTarget.closest('details') as HTMLDetailsElement)?.removeAttribute('open');
                            }}
                            disabled={pendingStatusId === app.id}
                            className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            ปรับเป็นไม่ผ่าน
                          </button>
                        </div>
                      </details>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
        <p className="text-xs font-bold text-gray-400">
          แสดง {applicants.length} จาก {pagination.total || 0} รายการ
        </p>
        <div className="flex items-center gap-2">
          <button 
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-2 bg-white border border-gray-200 rounded-xl disabled:opacity-30 hover:bg-gray-50 transition-all shadow-sm"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-black text-navy px-2">
            หน้า {currentPage} / {pagination.totalPages || 1}
          </span>
          <button 
            disabled={currentPage === pagination.totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-2 bg-white border border-gray-200 rounded-xl disabled:opacity-30 hover:bg-gray-50 transition-all shadow-sm"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
