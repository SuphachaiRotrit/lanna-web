import React from 'react';
import { User, GraduationCap, BookOpen, Upload, CheckCircle } from 'lucide-react';

const steps = [
  { id: 1, title: 'ข้อมูลส่วนตัว', icon: <User size={18} /> },
  { id: 2, title: 'ประวัติการศึกษา', icon: <GraduationCap size={18} /> },
  { id: 3, title: 'เลือกหลักสูตร', icon: <BookOpen size={18} /> },
  { id: 4, title: 'เอกสาร/ยืนยัน', icon: <Upload size={18} /> },
];

export const ProgressStepper = ({ currentStep }: { currentStep: number }) => {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-6 left-[10%] right-[10%] h-0.5 bg-gray-200 -z-10" />
        <div
          className="absolute top-6 left-[10%] h-0.5 bg-brand -z-10 transition-all duration-700"
          style={{ width: `${((currentStep - 1) / 3) * 80}%` }}
        />

        {steps.map((step) => (
          <div key={step.id} className="flex flex-col items-center relative">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${currentStep >= step.id
                  ? 'bg-brand text-white shadow-brand-sm scale-110'
                  : 'bg-white text-gray-300 border-2 border-gray-100'
                }`}
            >
              {currentStep > step.id ? <CheckCircle size={20} /> : step.icon}
            </div>
            <span className={`mt-3 text-[13px] font-bold transition-colors ${currentStep >= step.id ? 'text-brand' : 'text-gray-300'}`}>
              {step.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
