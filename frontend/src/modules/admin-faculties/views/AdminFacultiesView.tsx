'use client';

import React, { useState } from 'react';
import { Plus, Building2 } from 'lucide-react';
import { useFaculties, useFacultyMutation } from '../hooks/use-faculties';
import { FacultyTable } from '../components/FacultyTable';
import { FacultyModal } from '../components/FacultyModal';
import { Faculty } from '@/types';

export const AdminFacultiesView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);

  const { data: res, isLoading, progress } = useFaculties();
  const faculties = res?.data || [];

  const { createMutation, updateMutation, deleteMutation } = useFacultyMutation(() => {
    setIsModalOpen(false);
    setEditingFaculty(null);
  });

  const handleOpenModal = (faculty: Faculty | null = null) => {
    setEditingFaculty(faculty);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (data: { name: string }) => {
    if (editingFaculty) {
      updateMutation.mutate({ id: editingFaculty.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[12px] font-bold text-brand uppercase tracking-[0.2em] bg-brand/5 px-2.5 py-1 rounded-md">Faculties</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">จัดการคณะ</h1>
          <p className="text-gray-400 text-sm font-medium mt-0.5">เพิ่ม แก้ไข หรือลบคณะที่ใช้ในการสร้างสาขาวิชา</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl font-bold text-sm shadow-lg shadow-brand/15 hover:bg-brand-dark transition-all active:scale-[0.98]"
        >
          <Plus size={18} />
          เพิ่มคณะ
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 max-w-xs">
        <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center">
          <Building2 size={18} />
        </div>
        <div>
          <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wide">ทั้งหมด</p>
          <h4 className="text-xl font-extrabold text-gray-800">{faculties.length}</h4>
        </div>
      </div>

      <FacultyTable
        faculties={faculties}
        onEdit={handleOpenModal}
        onDelete={(id) => deleteMutation.mutate(id)}
        isLoading={isLoading}
        progress={progress}
        deletingId={deleteMutation.isPending ? deleteMutation.variables : undefined}
      />

      <FacultyModal
        key={editingFaculty?.id ?? 'new'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        faculty={editingFaculty}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};
