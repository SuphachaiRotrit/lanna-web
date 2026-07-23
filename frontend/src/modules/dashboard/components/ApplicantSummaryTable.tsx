'use client';

import React, { useRef, useState } from 'react';
import { FileSpreadsheet, FileText, ClipboardList, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import { toast } from 'sonner';
import { DashboardStats, exportDashboardSummaryExcelApi } from '@/services/dashboard.service';
import { Skeleton } from '@/components/ui/Skeleton';
import { getErrorMessage } from '@/lib/call-api';

interface ApplicantSummaryTableProps {
  data: DashboardStats['programStatusBreakdown'] | undefined;
  year: number;
  isLoading: boolean;
}

const Cell = ({ value }: { value: number }) => (
  <td className="px-4 py-3 text-center text-[13px] font-bold text-gray-700 tabular-nums">
    {value || <span className="text-gray-300">-</span>}
  </td>
);

export const ApplicantSummaryTable: React.FC<ApplicantSummaryTableProps> = ({ data, year, isLoading }) => {
  const [exporting, setExporting] = useState<'excel' | 'pdf' | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const totals = (data ?? []).reduce(
    (acc, r) => ({
      applied: acc.applied + r.applied,
      pending: acc.pending + r.pending,
      approved: acc.approved + r.approved,
      examPassed: acc.examPassed + r.examPassed,
      reportedIn: acc.reportedIn + r.reportedIn,
    }),
    { applied: 0, pending: 0, approved: 0, examPassed: 0, reportedIn: 0 },
  );

  const handleExportExcel = async () => {
    setExporting('excel');
    try {
      const [promise] = await exportDashboardSummaryExcelApi(year);
      const blob = await promise;
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `applicant_summary_${year}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(getErrorMessage(err, 'ไม่สามารถส่งออกไฟล์ Excel ได้'));
    } finally {
      setExporting(null);
    }
  };

  const handleExportPdf = async () => {
    if (!tableRef.current) return;
    setExporting('pdf');
    try {
      const canvas = await html2canvas(tableRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pageWidth) / canvas.width;
      const finalHeight = Math.min(imgHeight, pageHeight);
      const finalWidth = (canvas.width * finalHeight) / canvas.height;
      pdf.addImage(imgData, 'PNG', (pageWidth - finalWidth) / 2, 10, finalWidth, finalHeight);
      pdf.save(`applicant_summary_${year}.pdf`);
    } catch (err) {
      toast.error(getErrorMessage(err, 'ไม่สามารถส่งออกไฟล์ PDF ได้'));
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand/8 rounded-lg flex items-center justify-center">
            <ClipboardList size={16} className="text-brand" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-gray-800">สรุปยอดผู้สมัครแยกตามสาขาวิชา</h3>
            <p className="text-[12px] font-bold text-gray-400">ปีการศึกษา {year}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={exporting !== null || isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white rounded-xl border border-gray-100 shadow-sm text-[13px] font-bold text-gray-500 hover:text-emerald-600 hover:border-emerald-100 transition-colors disabled:opacity-50"
          >
            {exporting === 'excel' ? <Loader2 size={12} className="animate-spin" /> : <FileSpreadsheet size={12} />}
            Export Excel
          </button>
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={exporting !== null || isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white rounded-xl border border-gray-100 shadow-sm text-[13px] font-bold text-gray-500 hover:text-red-600 hover:border-red-100 transition-colors disabled:opacity-50"
          >
            {exporting === 'pdf' ? <Loader2 size={12} className="animate-spin" /> : <FileText size={12} />}
            Export PDF
          </button>
        </div>
      </div>

      <div ref={tableRef} className="overflow-x-auto bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="px-6 py-3.5 text-[12px] font-extrabold text-gray-400 uppercase tracking-[0.1em]">สาขาวิชาที่เปิดรับสมัคร</th>
              <th className="px-4 py-3.5 text-[12px] font-extrabold text-gray-400 uppercase tracking-[0.1em] text-center">ผู้สมัครปีนี้</th>
              <th className="px-4 py-3.5 text-[12px] font-extrabold text-gray-400 uppercase tracking-[0.1em] text-center">รอตรวจสอบ</th>
              <th className="px-4 py-3.5 text-[12px] font-extrabold text-gray-400 uppercase tracking-[0.1em] text-center">ผ่านการสมัคร</th>
              <th className="px-4 py-3.5 text-[12px] font-extrabold text-gray-400 uppercase tracking-[0.1em] text-center">สอบผ่าน</th>
              <th className="px-4 py-3.5 text-[12px] font-extrabold text-gray-400 uppercase tracking-[0.1em] text-center">รายงานตัวแล้ว</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-3.5"><Skeleton className="h-4 w-56" /></td>
                  <td className="px-4 py-3.5"><Skeleton className="h-4 w-8 mx-auto" /></td>
                  <td className="px-4 py-3.5"><Skeleton className="h-4 w-8 mx-auto" /></td>
                  <td className="px-4 py-3.5"><Skeleton className="h-4 w-8 mx-auto" /></td>
                  <td className="px-4 py-3.5"><Skeleton className="h-4 w-8 mx-auto" /></td>
                  <td className="px-4 py-3.5"><Skeleton className="h-4 w-8 mx-auto" /></td>
                </tr>
              ))
            ) : !data || data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-400 text-xs font-bold">
                  ยังไม่มีสาขาวิชาที่เปิดรับสมัคร
                </td>
              </tr>
            ) : (
              data.map((r) => (
                <tr key={r.programId} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-3.5 text-[13px] font-bold text-gray-800">{r.programName}</td>
                  <Cell value={r.applied} />
                  <Cell value={r.pending} />
                  <Cell value={r.approved} />
                  <Cell value={r.examPassed} />
                  <Cell value={r.reportedIn} />
                </tr>
              ))
            )}
          </tbody>
          {!isLoading && data && data.length > 0 && (
            <tfoot>
              <tr className="bg-amber-50/70 border-t border-amber-100">
                <td className="px-6 py-3.5 text-[13px] font-extrabold text-gray-800">รวม</td>
                <td className="px-4 py-3.5 text-center text-[13px] font-extrabold text-gray-800 tabular-nums">{totals.applied}</td>
                <td className="px-4 py-3.5 text-center text-[13px] font-extrabold text-gray-800 tabular-nums">{totals.pending}</td>
                <td className="px-4 py-3.5 text-center text-[13px] font-extrabold text-gray-800 tabular-nums">{totals.approved}</td>
                <td className="px-4 py-3.5 text-center text-[13px] font-extrabold text-gray-800 tabular-nums">{totals.examPassed}</td>
                <td className="px-4 py-3.5 text-center text-[13px] font-extrabold text-gray-800 tabular-nums">{totals.reportedIn}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};
