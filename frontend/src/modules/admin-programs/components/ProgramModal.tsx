import React, { useState } from 'react';
import { XCircle, Users } from 'lucide-react';
import { Program, ProgramTrack } from '@/types';
import { useFaculties } from '@/modules/admin-faculties/hooks/use-faculties';
import { Switch } from '@/components/ui/Switch';

interface ProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Program>) => void;
  program?: Program | null;
  isSubmitting?: boolean;
}

const DEGREE_OPTIONS = ['ปริญญาตรี', 'ปริญญาโท', 'ปริญญาเอก'];

const defaultFormData: Partial<Program> = {
  name: '',
  facultyId: '',
  degree: 'ปริญญาตรี',
  track: 'REGULAR',
  duration: 4,
  description: '',
  curriculum: '',
  skills: '',
  careerPaths: '',
  maxQuota: 50,
  isActive: true
};

export const ProgramModal: React.FC<ProgramModalProps> = ({ isOpen, onClose, onSubmit, program, isSubmitting }) => {
  const { data: facultiesRes } = useFaculties();
  const faculties = facultiesRes?.data || [];

  const [formData, setFormData] = useState<Partial<Program>>(() =>
    program
      ? {
          name: program.name,
          facultyId: program.facultyId,
          degree: program.degree,
          track: program.track,
          duration: program.duration || 4,
          description: program.description || '',
          curriculum: program.curriculum || '',
          skills: program.skills || '',
          careerPaths: program.careerPaths || '',
          maxQuota: program.maxQuota,
          isActive: program.isActive
        }
      : defaultFormData
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleTrackChange = (track: ProgramTrack) => {
    setFormData(prev => ({ ...prev, track, description: track === 'REGULAR' ? '' : prev.description }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl p-8 sm:p-10 animate-in fade-in zoom-in duration-300">
         <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-navy tracking-tight">
               {program ? 'แก้ไขสาขาวิชา' : 'เพิ่มสาขาวิชาใหม่'}
            </h3>
            <button onClick={onClose} className="p-2 text-gray-300 hover:bg-gray-100 rounded-full transition-colors">
               <XCircle size={24} />
            </button>
         </div>

         <form onSubmit={handleSubmit} className="space-y-4">
            <div>
               <label className="block text-[12px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">ชื่อสาขาวิชา</label>
               <input
                 type="text"
                 className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand outline-none transition-all font-bold text-sm"
                 placeholder="เช่น การสอนภาษาอังกฤษ"
                 value={formData.name}
                 onChange={(e) => setFormData({...formData, name: e.target.value})}
                 required
               />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-[12px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">คณะ</label>
                  <select
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand outline-none transition-all font-bold text-sm"
                    value={formData.facultyId}
                    onChange={(e) => setFormData({...formData, facultyId: e.target.value})}
                    required
                  >
                     <option value="" disabled>เลือกคณะ</option>
                     {faculties.map((f) => (
                       <option key={f.id} value={f.id}>{f.name}</option>
                     ))}
                  </select>
               </div>
               <div>
                  <label className="block text-[12px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">ระยะเวลาหลักสูตร (ปี)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand outline-none transition-all font-bold text-sm"
                    value={formData.duration ?? ''}
                    onChange={(e) => setFormData({...formData, duration: e.target.value ? parseInt(e.target.value) : undefined})}
                  />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">ระดับการศึกษา</label>
                  <select
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand outline-none transition-all font-bold text-sm"
                    value={formData.degree}
                    onChange={(e) => setFormData({...formData, degree: e.target.value})}
                  >
                     {DEGREE_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                   <label className="block text-[12px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">โควตารับ (คน)</label>
                   <div className="relative">
                      <input
                        type="number"
                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand outline-none transition-all font-bold text-sm"
                        value={formData.maxQuota}
                        onChange={(e) => setFormData({...formData, maxQuota: parseInt(e.target.value)})}
                        min="1"
                        required
                      />
                      <Users className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                   </div>
                </div>
            </div>

            <div>
               <label className="block text-[12px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">หลักสูตร</label>
               <select
                 className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand outline-none transition-all font-bold text-sm"
                 value={formData.track}
                 onChange={(e) => handleTrackChange(e.target.value as ProgramTrack)}
               >
                  <option value="REGULAR">ภาคปกติ</option>
                  <option value="SPECIAL">ภาคพิเศษ</option>
               </select>
            </div>

            {formData.track === 'SPECIAL' && (
              <div>
                 <label className="block text-[12px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">หมายเหตุ (เช่น เรียนเสาร์-อาทิตย์)</label>
                 <input
                   type="text"
                   className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand outline-none transition-all font-bold text-sm"
                   placeholder="เช่น เรียนเสาร์-อาทิตย์"
                   value={formData.description}
                   onChange={(e) => setFormData({...formData, description: e.target.value})}
                 />
              </div>
            )}

            <div className="pt-2 border-t border-gray-100 space-y-4">
               <p className="text-[11px] font-black text-gray-300 uppercase tracking-widest pt-4">ข้อมูลแสดงหน้าเว็บสาธารณะ (กดดูรายละเอียดสาขา)</p>
               <div>
                  <label className="block text-[12px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">เรียนเกี่ยวกับอะไรบ้าง</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand outline-none transition-all font-medium text-sm resize-none"
                    placeholder="เนื้อหาที่เรียนในหลักสูตรนี้..."
                    value={formData.curriculum}
                    onChange={(e) => setFormData({...formData, curriculum: e.target.value})}
                  />
               </div>
               <div>
                  <label className="block text-[12px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">ทักษะ/ความรู้ที่จะได้รับ</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand outline-none transition-all font-medium text-sm resize-none"
                    placeholder="ทักษะและความรู้ที่ผู้เรียนจะได้รับ..."
                    value={formData.skills}
                    onChange={(e) => setFormData({...formData, skills: e.target.value})}
                  />
               </div>
               <div>
                  <label className="block text-[12px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">แนวทางอาชีพหลังจบการศึกษา</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand outline-none transition-all font-medium text-sm resize-none"
                    placeholder="อาชีพที่สามารถทำได้หลังจบการศึกษา..."
                    value={formData.careerPaths}
                    onChange={(e) => setFormData({...formData, careerPaths: e.target.value})}
                  />
               </div>
            </div>

            <div className="flex items-center pt-2">
               <Switch
                 checked={!!formData.isActive}
                 onChange={(checked) => setFormData({...formData, isActive: checked})}
                 label="เปิดรับสมัคร"
               />
            </div>

            <div className="pt-6 flex gap-4">
               <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 py-4 rounded-2xl border-2 border-gray-100 text-gray-400 font-bold hover:bg-gray-50 transition-all text-sm uppercase tracking-widest disabled:opacity-50">ยกเลิก</button>
               <button type="submit" disabled={isSubmitting} className="flex-[2] py-4 rounded-2xl bg-brand text-white font-black hover:bg-brand-dark shadow-xl shadow-brand/20 transition-all text-sm uppercase tracking-widest active:scale-95 disabled:opacity-60 disabled:active:scale-100">
                 {isSubmitting ? 'กำลังบันทึก...' : program ? 'อัปเดตข้อมูล' : 'ยืนยันเพิ่มสาขา'}
               </button>
            </div>
         </form>
      </div>
    </div>
  );
};
