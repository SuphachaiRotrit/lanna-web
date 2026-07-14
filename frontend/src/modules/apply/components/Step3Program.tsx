import React from 'react';
import { Field, ErrorMessage } from 'formik';
import { CheckCircle, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { Program } from '@/types';

interface Step3Props {
  programs: Program[];
  selectedProgramId: string;
  isLoading?: boolean;
}

export const Step3Program: React.FC<Step3Props> = ({ programs, selectedProgramId, isLoading }) => {
  if (isLoading) return (
    <div className="flex flex-col items-center gap-3 py-16 text-navy/30">
      <Loader2 size={28} className="animate-spin" />
      <p className="text-sm font-bold">กำลังโหลดรายการสาขาวิชา...</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <p className="text-sm font-bold text-navy/70 text-base mb-6">เลือกสาขาวิชาที่ต้องการเข้าศึกษา *</p>
      <div className="space-y-3">
        {programs.map((program) => (
          <label
            key={program.id}
            className={`relative flex items-center gap-5 p-6 rounded-2xl border-2 transition-all group ${
              program.isFull 
                ? 'border-gray-50 bg-gray-50/50 cursor-not-allowed grayscale' 
                : selectedProgramId === program.id
                  ? 'border-brand bg-brand/[0.03] shadow-brand-sm cursor-pointer'
                  : 'border-gray-100 hover:border-gray-200 bg-white cursor-pointer'
            }`}
          >
            <Field 
              type="radio" 
              name="programId" 
              value={program.id} 
              disabled={program.isFull}
              className="w-5 h-5 accent-brand" 
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="font-bold text-navy text-base">{program.name}</p>
                {program.duration && (
                   <span className="inline-flex items-center gap-1 text-brand font-bold text-sm">
                      <Clock size={14} />
                      หลักสูตร {program.duration} ปี
                   </span>
                )}
                {program.isFull && (
                   <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-600 text-[12px] font-black uppercase">เต็มแล้ว</span>
                )}
              </div>
              <p className="text-sm text-gray-400 mt-0.5">
                {program.faculty?.name} • {program.degree}
              </p>
              {program.description && (
                <p className="text-xs text-brand font-bold mt-1.5 p-2 bg-brand/5 rounded-lg inline-block">
                  {program.description}
                </p>
              )}
            </div>
            
            {!program.isFull && selectedProgramId === program.id && (
              <CheckCircle className="text-brand shrink-0" size={22} />
            )}
            {program.isFull && (
              <AlertCircle className="text-gray-300 shrink-0" size={22} />
            )}
          </label>
        ))}
      </div>
      <ErrorMessage name="programId" component="div" className="text-red-500 text-xs mt-1.5 font-medium ml-1" />
    </div>
  );
};
