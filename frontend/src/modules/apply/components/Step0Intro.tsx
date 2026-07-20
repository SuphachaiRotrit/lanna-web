import React from 'react';
import { ClipboardCheck, FileText, GraduationCap, ClipboardList, CloudUpload, Smartphone } from 'lucide-react';

interface IntroProps {
  onStart: () => void;
  onCancel: () => void;
}

export const Step0Intro: React.FC<IntroProps> = ({ onStart, onCancel }) => {
  // ponytail: titles mirror ApplyView's stepTitles — keep in sync if steps change there.
  const steps = [
    {
      icon: <FileText className="text-brand" size={24} />,
      title: '1. ข้อมูลส่วนตัว',
      desc: 'เตรียมเลขบัตรประชาชน, ที่อยู่, เบอร์โทรศัพท์ และอีเมลที่ติดต่อได้จริง'
    },
    {
      icon: <GraduationCap className="text-brand" size={24} />,
      title: '2. ประวัติการศึกษา',
      desc: 'ระบุสถานศึกษาเดิม วุฒิที่จบ และเกรดเฉลี่ย'
    },
    {
      icon: <ClipboardList className="text-brand" size={24} />,
      title: '3. เลือกหลักสูตร',
      desc: 'เลือกสาขาวิชาที่ต้องการสมัครเข้าศึกษาต่อ'
    },
    {
      icon: <CloudUpload className="text-brand" size={24} />,
      title: '4. อัปโหลดเอกสาร',
      desc: 'อัปโหลดรูปถ่ายและเอกสารประกอบให้ครบ ตรวจสอบให้ถูกต้องก่อนกดส่ง (แก้ไขไม่ได้หลังส่ง)'
    }
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-brand/10 text-brand mb-6 shadow-inner">
          <ClipboardCheck size={32} />
        </div>
        <h2 className="text-2xl font-black text-navy mb-3 italic">ขั้นตอนการสมัครเรียนออนไลน์</h2>
        <p className="text-sm font-medium text-navy/50 leading-relaxed">
          กรุณาอ่านคำแนะนำและเตรียมเอกสารให้พร้อม <br /> เพื่อความรวดเร็วและถูกต้องในกระบวนการสมัครเข้าศึกษาต่อ
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {steps.map((s, i) => (
          <div key={i} className="group p-6 bg-white border-2 border-gray-100 rounded-[2rem] hover:border-brand/30 hover:shadow-xl hover:shadow-brand/5 transition-all duration-300">
            <div className="flex gap-5 items-start">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-brand/10 transition-colors">
                {s.icon}
              </div>
              <div>
                <h3 className="font-black text-navy mb-1.5 tracking-tight group-hover:text-brand transition-colors">{s.title}</h3>
                <p className="text-xs font-bold text-navy/40 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 rounded-[2rem] p-6 border-2 border-amber-100/50">
        <h4 className="text-xs font-black text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-2">
          📌 เอกสารที่ต้องอัปโหลด (เตรียมไฟล์ให้พร้อม)
        </h4>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
          {['รูปถ่ายหน้าตรง 1 นิ้ว', 'สำเนาบัตรประชาชน/ใบสุทธิ', 'สำเนาทะเบียนบ้าน', 'สำเนาวุฒิการศึกษา (3 ฉบับ)'].map((doc, idx) => (
            <li key={idx} className="text-xs font-bold text-amber-800/80 flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-amber-400" />
              {doc}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-center gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-8 py-4 text-sm font-bold text-navy bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-300"
        >
          ยกเลิก
        </button>
        <button
          type="button"
          onClick={onStart}
          className="group relative px-16 py-5 bg-navy text-white rounded-3xl font-black text-sm tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-navy/20"
        >
          <span className="relative z-10 flex items-center gap-3">
            เริ่มสมัครเรียนตอนนี้
            <div className="w-6 h-6 rounded-full bg-brand flex items-center justify-center group-hover:translate-x-1 transition-transform">
              <Smartphone size={14} className="text-navy" />
            </div>
          </span>
        </button>
      </div>
    </div>
  );
};
