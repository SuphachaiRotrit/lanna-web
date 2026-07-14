import React, { useState } from 'react';
import { XCircle } from 'lucide-react';
import { Faculty } from '@/types';

interface FacultyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string }) => void;
  faculty?: Faculty | null;
  isSubmitting?: boolean;
}

export const FacultyModal: React.FC<FacultyModalProps> = ({ isOpen, onClose, onSubmit, faculty, isSubmitting }) => {
  const [name, setName] = useState(faculty?.name || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 sm:p-10 animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-black text-navy tracking-tight">
            {faculty ? 'แก้ไขคณะ' : 'เพิ่มคณะใหม่'}
          </h3>
          <button onClick={onClose} className="p-2 text-gray-300 hover:bg-gray-100 rounded-full transition-colors">
            <XCircle size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[12px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">ชื่อคณะ</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand outline-none transition-all font-bold text-sm"
              placeholder="เช่น คณะศึกษาศาสตร์"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="pt-6 flex gap-4">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 py-4 rounded-2xl border-2 border-gray-100 text-gray-400 font-bold hover:bg-gray-50 transition-all text-sm uppercase tracking-widest disabled:opacity-50">ยกเลิก</button>
            <button type="submit" disabled={isSubmitting} className="flex-[2] py-4 rounded-2xl bg-brand text-white font-black hover:bg-brand-dark shadow-xl shadow-brand/20 transition-all text-sm uppercase tracking-widest active:scale-95 disabled:opacity-60 disabled:active:scale-100">
              {isSubmitting ? 'กำลังบันทึก...' : faculty ? 'อัปเดตข้อมูล' : 'ยืนยันเพิ่มคณะ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
