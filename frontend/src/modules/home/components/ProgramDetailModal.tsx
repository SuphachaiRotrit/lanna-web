import React from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { XCircle, ExternalLink } from 'lucide-react';
import { Program } from '@/types';
import { ProgramDetailContent } from './ProgramDetailContent';

interface ProgramDetailModalProps {
  program: Program | null;
  onClose: () => void;
}

export const ProgramDetailModal: React.FC<ProgramDetailModalProps> = ({ program, onClose }) => {
  if (!program) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-[2.5rem] shadow-2xl p-8 sm:p-10 animate-in fade-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-300 hover:bg-gray-100 rounded-full transition-colors">
          <XCircle size={24} />
        </button>
        <Link
          href={`/programs/${program.id}`}
          className="inline-flex items-center gap-1.5 text-[12px] font-bold text-navy/30 hover:text-brand transition-colors mb-4"
        >
          <ExternalLink size={12} /> เปิดเป็นหน้าเต็ม
        </Link>
        <ProgramDetailContent program={program} />
      </div>
    </div>,
    document.body
  );
};
