import React from 'react';
import Link from 'next/link';
import { BookOpen, Sparkles, Briefcase, ArrowRight, Clock } from 'lucide-react';
import { Program } from '@/types';

export const ProgramDetailContent: React.FC<{ program: Program }> = ({ program }) => {
  const sections = [
    { icon: BookOpen, label: 'เรียนเกี่ยวกับอะไรบ้าง', text: program.curriculum },
    { icon: Sparkles, label: 'ทักษะและความรู้ที่จะได้รับ', text: program.skills },
    { icon: Briefcase, label: 'แนวทางอาชีพหลังจบการศึกษา', text: program.careerPaths },
  ].filter((s) => s.text);

  return (
    <>
      <div className="pr-10">
        {program.duration && (
          <span className="inline-flex items-center gap-1 text-[12px] font-black text-brand bg-brand/8 px-2.5 py-1 rounded-full uppercase tracking-widest mb-3">
            <Clock size={12} /> หลักสูตร {program.duration} ปี
          </span>
        )}
        <h3 className="text-2xl font-black text-navy tracking-tight leading-snug">{program.name}</h3>
        <p className="text-sm text-navy/40 font-bold uppercase tracking-wide mt-1">{program.faculty?.name} • {program.degree}</p>
      </div>

      <div className="mt-8 space-y-6">
        {sections.length === 0 && (
          <p className="text-sm text-navy/40 font-medium">รายละเอียดสาขาวิชานี้กำลังจัดเตรียม สอบถามข้อมูลเพิ่มเติมได้ที่เจ้าหน้าที่รับสมัคร</p>
        )}
        {sections.map(({ icon: Icon, label, text }) => (
          <div key={label} className="flex gap-4">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-brand/8 flex items-center justify-center">
              <Icon size={18} className="text-brand" />
            </div>
            <div>
              <p className="text-[12px] font-black text-navy/50 uppercase tracking-widest mb-1">{label}</p>
              <p className="text-sm text-navy/70 leading-relaxed whitespace-pre-line">{text}</p>
            </div>
          </div>
        ))}
      </div>

      <Link
        href={`/apply?programId=${program.id}`}
        className="mt-10 w-full py-4 bg-brand text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-brand/20 hover:bg-brand-dark transition-all active:scale-95 flex items-center justify-center gap-2"
      >
        สมัครเรียนสาขานี้ <ArrowRight size={16} />
      </Link>
    </>
  );
};
