import React, { useState } from 'react';
import { Plus, Search, GraduationCap, AlertTriangle, BookOpen, ToggleLeft } from 'lucide-react';
import { usePrograms, useProgramMutation } from '../hooks/use-programs';
import { useFaculties } from '@/modules/admin-faculties/hooks/use-faculties';
import { ProgramTable } from '../components/ProgramTable';
import { ProgramModal } from '../components/ProgramModal';
import { Program } from '@/types';

export const AdminProgramsView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [facultyFilter, setFacultyFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);

  // TanStack Query Hooks
  const { data: res, isLoading, progress } = usePrograms();
  const programs = res?.data || [];
  const { data: facultiesRes } = useFaculties();
  const faculties = facultiesRes?.data || [];

  const { createMutation, updateMutation, deleteMutation } = useProgramMutation(() => {
    setIsModalOpen(false);
    setEditingProgram(null);
  });

  const handleOpenModal = (program: Program | null = null) => {
    setEditingProgram(program);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (data: Partial<Program>) => {
    if (editingProgram) {
      updateMutation.mutate({ id: editingProgram.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredPrograms = programs.filter((p: Program) =>
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.faculty?.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!facultyFilter || p.facultyId === facultyFilter)
  );

  const activeCount = programs.filter((p: Program) => p.isActive).length;
  const inactiveCount = programs.filter((p: Program) => !p.isActive).length;
  const nearFullCount = programs.filter((p: Program) => !p.isFull && (p.currentApplicants / p.maxQuota) > 0.8).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[12px] font-bold text-brand uppercase tracking-[0.2em] bg-brand/5 px-2.5 py-1 rounded-md">Programs</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">จัดการสาขาวิชา</h1>
          <p className="text-gray-400 text-sm font-medium mt-0.5">ตั้งค่าหลักสูตรและควบคุมโควตาการรับสมัคร</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl font-bold text-sm shadow-lg shadow-brand/15 hover:bg-brand-dark transition-all active:scale-[0.98]"
        >
          <Plus size={18} />
          เพิ่มสาขาวิชา
        </button>
      </div>

      {/* Stats Area */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
           <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center">
              <GraduationCap size={18} />
           </div>
           <div>
              <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wide">ทั้งหมด</p>
              <h4 className="text-xl font-extrabold text-gray-800">{programs.length}</h4>
           </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
           <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-lg flex items-center justify-center">
              <BookOpen size={18} />
           </div>
           <div>
              <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wide">เปิดรับ</p>
              <h4 className="text-xl font-extrabold text-gray-800">{activeCount}</h4>
           </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
           <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-lg flex items-center justify-center">
              <AlertTriangle size={18} />
           </div>
           <div>
              <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wide">ใกล้เต็ม</p>
              <h4 className="text-xl font-extrabold text-gray-800">{nearFullCount}</h4>
           </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
           <div className="w-10 h-10 bg-gray-100 text-gray-400 rounded-lg flex items-center justify-center">
              <ToggleLeft size={18} />
           </div>
           <div>
              <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wide">ปิดรับ</p>
              <h4 className="text-xl font-extrabold text-gray-800">{inactiveCount}</h4>
           </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อสาขาวิชาหรือคณะ..." 
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 rounded-lg border border-transparent focus:bg-white focus:border-brand/30 outline-none transition-all text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2.5 bg-gray-50/50 rounded-lg border border-transparent focus:bg-white focus:border-brand/30 outline-none transition-all text-sm font-medium md:w-56"
          value={facultyFilter}
          onChange={(e) => setFacultyFilter(e.target.value)}
        >
          <option value="">ทุกคณะ</option>
          {faculties.map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
      </div>

      {/* Content Table */}
      <ProgramTable
        programs={filteredPrograms}
        onEdit={handleOpenModal}
        onDelete={(id) => deleteMutation.mutate(id)}
        isLoading={isLoading}
        progress={progress}
        deletingId={deleteMutation.isPending ? deleteMutation.variables : undefined}
      />

      {/* Modal Tool */}
      <ProgramModal
        key={editingProgram?.id ?? 'new'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        program={editingProgram}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};
