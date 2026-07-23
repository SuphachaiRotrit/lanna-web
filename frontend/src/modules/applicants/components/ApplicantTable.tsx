import React from 'react';
import { Clock, CheckCircle2, XCircle, Search, Eye, ChevronLeft, ChevronRight, RotateCcw, Loader2, ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';
import { Applicant } from '@/services/applicant.service';
import { Pagination } from '@/types';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatThaiDateMedium } from '@/lib/date';
import {
  STATUS_LABELS,
  STATUS_STYLES,
  EXAM_RESULT_LABELS,
  EXAM_RESULT_STYLES,
  REPORT_IN_LABELS,
  REPORT_IN_STYLES,
} from '@/constants/applicant-status';

interface ApplicantTableProps {
  applicants: Applicant[];
  pagination: Partial<Pagination>;
  loading: boolean;
  onUpdateStatus: (id: string, status: string) => void;
  onView: (id: string) => void;
  onPageChange: (page: number) => void;
  currentPage: number;
  pendingStatusId?: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (column: string) => void;
}

export const ApplicantTable: React.FC<ApplicantTableProps> = ({
  applicants, pagination, loading, onUpdateStatus, onView, onPageChange, currentPage, pendingStatusId,
  sortBy, sortOrder, onSort,
}) => {
  const renderSortableHeader = (key: string, label: string, className = 'px-6') => {
    const isActive = sortBy === key;
    const Icon = isActive ? (sortOrder === 'asc' ? ArrowUp : ArrowDown) : ChevronsUpDown;
    return (
      <th className={`${className} py-5 text-[12px] font-black uppercase tracking-[0.2em]`}>
        <button
          type="button"
          onClick={() => onSort(key)}
          className={`flex items-center gap-1 transition-colors ${isActive ? 'text-brand' : 'text-gray-400 hover:text-navy'}`}
        >
          {label}
          <Icon size={13} strokeWidth={3} />
        </button>
      </th>
    );
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50">
              {renderSortableHeader('firstName', 'ข้อมูลผู้สมัคร', 'px-8')}
              {renderSortableHeader('program.name', 'สาขาที่สมัคร')}
              {renderSortableHeader('phone', 'เบอร์โทรศัพท์')}
              {renderSortableHeader('submittedAt', 'วันที่สมัคร')}
              {renderSortableHeader('status', 'สถานะ')}
              {renderSortableHeader('examResult', 'ผลสอบ')}
              {renderSortableHeader('reportInStatus', 'การรายงานตัว')}
              <th className="px-8 py-5 text-[12px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? Array.from({ length: 6 }).map((_, i) => (
              <tr key={i}>
                <td className="px-8 py-6 space-y-1.5">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-20" />
                </td>
                <td className="px-6 py-6"><Skeleton className="h-4 w-32" /></td>
                <td className="px-6 py-6"><Skeleton className="h-4 w-24" /></td>
                <td className="px-6 py-6"><Skeleton className="h-4 w-20" /></td>
                <td className="px-6 py-6"><Skeleton className="h-6 w-20 rounded-full" /></td>
                <td className="px-6 py-6"><Skeleton className="h-6 w-20 rounded-full" /></td>
                <td className="px-6 py-6"><Skeleton className="h-6 w-20 rounded-full" /></td>
                <td className="px-8 py-6 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
              </tr>
            )) : applicants.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-8 py-6">
                  <p className="text-sm font-black text-navy leading-tight">{app.prefixName}{app.firstName} {app.lastName}</p>
                  <p className="text-[13px] text-gray-400 font-bold mt-0.5">{app.applicationNumber}</p>
                </td>
                <td className="px-6 py-6">
                  <p className="text-sm font-bold text-gray-700 truncate w-48">{app.program?.name}</p>
                  <p className="text-[12px] text-gray-400 font-medium uppercase tracking-tighter">{app.program?.faculty?.name}</p>
                </td>
                <td className="px-6 py-6 font-bold text-sm text-gray-600">{app.phone}</td>
                <td className="px-6 py-6 font-bold text-sm text-gray-600">
                  {formatThaiDateMedium(app.submittedAt)}
                </td>
                <td className="px-6 py-6">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-black uppercase tracking-wider ${STATUS_STYLES[app.status]}`}>
                    {app.status === 'PENDING' && <Clock size={12} />}
                    {app.status === 'REVIEWING' && <Eye size={12} />}
                    {app.status === 'APPROVED' && <CheckCircle2 size={12} />}
                    {app.status === 'REJECTED' && <XCircle size={12} />}
                    {STATUS_LABELS[app.status]}
                  </div>
                </td>
                <td className="px-6 py-6">
                  <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-black uppercase tracking-wider ${EXAM_RESULT_STYLES[app.examResult]}`}>
                    {EXAM_RESULT_LABELS[app.examResult]}
                  </div>
                </td>
                <td className="px-6 py-6">
                  <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-black uppercase tracking-wider ${REPORT_IN_STYLES[app.reportInStatus]}`}>
                    {REPORT_IN_LABELS[app.reportInStatus]}
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
                      <button
                        onClick={() => onUpdateStatus(app.id, 'PENDING')}
                        disabled={pendingStatusId === app.id}
                        className="flex items-center gap-1.5 px-3 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors text-xs font-black disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {pendingStatusId === app.id ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
                        ส่งกลับไปรอตรวจใหม่
                      </button>
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
