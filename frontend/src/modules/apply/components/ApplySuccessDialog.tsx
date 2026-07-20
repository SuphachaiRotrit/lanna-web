'use client';

import React, { useState } from 'react';
import { CheckCircle2, Copy, Check } from 'lucide-react';

interface ApplySuccessDialogProps {
  applicationNumber: string;
  onClose: () => void;
}

export const ApplySuccessDialog: React.FC<ApplySuccessDialogProps> = ({ applicationNumber, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(applicationNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm" />
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-5">
          <CheckCircle2 size={32} className="text-emerald-500" />
        </div>
        <h3 className="text-xl font-black text-navy mb-1">ส่งใบสมัครเรียบร้อยแล้ว!</h3>
        <p className="text-navy/50 text-sm mb-6">โปรดบันทึกรหัสสมัครเรียนไว้เป็นหลักฐาน</p>

        <div className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 mb-2">
          <span className="font-black text-navy tracking-wider text-lg">{applicationNumber}</span>
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-navy/70 hover:bg-gray-100 transition-all"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
          </button>
        </div>
        <p className="text-navy/40 text-xs mb-6">ใช้เป็นหลักฐานอ้างอิงเวลาติดต่อเจ้าหน้าที่</p>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 bg-brand text-white rounded-xl font-black text-sm uppercase tracking-wider hover:bg-brand-dark transition-all"
        >
          เสร็จสิ้น
        </button>
      </div>
    </div>
  );
};
