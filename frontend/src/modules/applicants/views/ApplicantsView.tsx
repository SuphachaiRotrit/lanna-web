'use client';

import React, { useState } from 'react';
import { Search, Download, Printer } from 'lucide-react';
import { useApplicants, useApplicantMutation } from '../hooks/use-applicants';
import { ApplicantTable } from '../components/ApplicantTable';
import { ApplicantDetailModal } from '../components/ApplicantDetailModal';
import { PremiumButton, PremiumCard } from '../../../components/ui/PremiumBase';
import { PremiumInput, PremiumSelect } from '../../../components/ui/FormControls';

export const ApplicantsView = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    year: new Date().getFullYear() + 543,
  });
  const [viewingApplicantId, setViewingApplicantId] = useState<string | null>(null);

  const { data: res, isLoading, progress } = useApplicants(filters);
  const applicants = res?.data?.rows || [];
  const pagination = res?.data?.pagination || {};

  const { updateStatus, exportData } = useApplicantMutation();

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleSearchChange = (search: string) => {
    setFilters(prev => ({ ...prev, search, page: 1 }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[12px] font-bold text-brand uppercase tracking-[0.2em] bg-brand/5 px-2.5 py-1 rounded-md">Applicants</span>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">จัดการผู้สมัคร</h2>
          <p className="text-gray-400 text-sm font-medium mt-0.5">ตรวจสอบเอกสารและอนุมัติใบสมัครเรียน</p>
        </div>
        <div className="flex items-center gap-3">
          <PremiumButton
            variant="outline"
            size="md"
            className="!bg-emerald-50/30 !text-emerald-700 !border-emerald-100/50 hover:!bg-emerald-50"
            onClick={() => exportData.mutate({ type: 'excel', filters })}
            loading={exportData.isPending}
            leftIcon={<Download size={16} />}
          >
            Export Excel
          </PremiumButton>
          {/* <PremiumButton
            variant="outline"
            size="md"
            className="!bg-red-50/30 !text-red-600 !border-red-100/50 hover:!bg-red-50"
            onClick={() => exportData.mutate({ type: 'pdf', filters })}
            loading={exportData.isPending}
            leftIcon={<Printer size={16} />}
          >
            พิมพ์ PDF
          </PremiumButton> */}
        </div>
      </div>

      {/* Filters Bar */}
      <PremiumCard className="p-2 flex flex-wrap items-center gap-3 border-gray-100/50">
        <div className="flex-1 min-w-[320px]">
          <PremiumInput
            placeholder="ค้นหาตามชื่อ, นามสกุล หรือเลขใบสมัคร..."
            prefixIcon={<Search size={18} />}
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="!py-3"
          />
        </div>
        
        <div className="w-44">
          <PremiumSelect
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: String(e.target.value), page: 1 }))}
            className="!py-3"
            options={[
              { label: 'ทุกสถานะ', value: '' },
              { label: 'รอตรวจสอบ', value: 'PENDING' },
              { label: 'กำลังตรวจสอบ', value: 'REVIEWING' },
              { label: 'อนุมัติแล้ว', value: 'APPROVED' },
              { label: 'ไม่ผ่าน', value: 'REJECTED' },
            ]}
          />
        </div>

        <div className="w-32">
          <PremiumSelect
            value={filters.year}
            onChange={(e) => setFilters(prev => ({ ...prev, year: Number(e.target.value), page: 1 }))}
            className="!py-3"
            options={[0, 1, 2].map(i => {
              const year = new Date().getFullYear() + 543 - i;
              return { label: `ปี ${year}`, value: year };
            })}
          />
        </div>
      </PremiumCard>

      {/* Table Content */}
      <ApplicantTable 
        applicants={applicants}
        pagination={pagination}
        loading={isLoading}
        progress={progress}
        currentPage={filters.page}
        onPageChange={handlePageChange}
        onUpdateStatus={(id, status) => updateStatus.mutate({ id, status })}
        onView={setViewingApplicantId}
        pendingStatusId={updateStatus.isPending ? updateStatus.variables?.id : undefined}
      />

      <ApplicantDetailModal
        applicantId={viewingApplicantId}
        onClose={() => setViewingApplicantId(null)}
      />
    </div>
  );
};
