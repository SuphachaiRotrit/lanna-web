'use client';

import React, { useState } from 'react';
import { Search, Download, Printer, ArrowLeft } from 'lucide-react';
import { useApplicants, useApplicantMutation } from '../hooks/use-applicants';
import { usePrograms } from '@/modules/admin-programs/hooks/use-programs';
import { ApplicantTable } from '../components/ApplicantTable';
import { ApplicantDetailModal } from '../components/ApplicantDetailModal';
import { ProgramCardGrid } from '../components/ProgramCardGrid';
import { PremiumButton, PremiumCard } from '../../../components/ui/PremiumBase';
import { PremiumInput, PremiumSelect, YearPicker } from '../../../components/ui/FormControls';
import { STATUS_LABELS } from '@/constants/applicant-status';

export const ApplicantsView = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    year: new Date().getFullYear() + 543,
    programId: '',
  });
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [viewingApplicantId, setViewingApplicantId] = useState<string | null>(null);

  const { data: programsRes, isLoading: programsLoading } = usePrograms();
  const programs = programsRes?.data || [];

  const { data: res, isLoading } = useApplicants(filters);
  const applicants = res?.data?.rows || [];
  const pagination = res?.data?.pagination || {};

  const { updateStatus, exportData } = useApplicantMutation();

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleSearchChange = (search: string) => {
    setFilters(prev => ({ ...prev, search, page: 1 }));
  };

  const handleSelectProgram = (programId: string | null) => {
    setSelectedProgramId(programId ?? '');
    setFilters(prev => ({ ...prev, programId: programId ?? '', page: 1 }));
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
          <p className="text-gray-400 text-sm font-medium mt-0.5">ตรวจสอบเอกสารและพิจารณาใบสมัครเรียน</p>
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

      {selectedProgramId === null ? (
        <ProgramCardGrid programs={programs} loading={programsLoading} onSelect={handleSelectProgram} />
      ) : (
      <>
      <button
        type="button"
        onClick={() => setSelectedProgramId(null)}
        className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-navy transition-colors"
      >
        <ArrowLeft size={16} />
        กลับไปเลือกสาขา
      </button>

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
              { label: STATUS_LABELS.PENDING, value: 'PENDING' },
              { label: STATUS_LABELS.REVIEWING, value: 'REVIEWING' },
              { label: STATUS_LABELS.APPROVED, value: 'APPROVED' },
              { label: STATUS_LABELS.REJECTED, value: 'REJECTED' },
            ]}
          />
        </div>

        <div className="w-36">
          <YearPicker
            value={filters.year}
            onChange={(year) => setFilters(prev => ({ ...prev, year, page: 1 }))}
          />
        </div>
      </PremiumCard>

      {/* Table Content */}
      <ApplicantTable 
        applicants={applicants}
        pagination={pagination}
        loading={isLoading}
        currentPage={filters.page}
        onPageChange={handlePageChange}
        onUpdateStatus={(id, status) => updateStatus.mutate({ id, status })}
        onView={setViewingApplicantId}
        pendingStatusId={updateStatus.isPending ? updateStatus.variables?.id : undefined}
      />
      </>
      )}

      <ApplicantDetailModal
        applicantId={viewingApplicantId}
        onClose={() => setViewingApplicantId(null)}
      />
    </div>
  );
};
