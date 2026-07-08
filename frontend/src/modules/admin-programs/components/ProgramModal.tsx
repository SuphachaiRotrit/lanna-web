import React, { useState, useEffect } from 'react';
import { XCircle, Users, Clock } from 'lucide-react';
import { Program } from '@/types';

interface ProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  program?: Program | null;
}

export const ProgramModal: React.FC<ProgramModalProps> = ({ isOpen, onClose, onSubmit, program }) => {
  const [formData, setFormData] = useState({
    name: '',
    faculty: 'คณะศึกษาศาสตร์',
    degree: 'ปริญญาตรี',
    duration: '4 ปี',
    description: '',
    maxQuota: 50,
    isActive: true
  });

  useEffect(() => {
    if (program) {
      setFormData({
        name: program.name,
        faculty: program.faculty,
        degree: program.degree,
        duration: program.duration || '4 ปี',
        description: program.description || '',
        maxQuota: program.maxQuota,
        isActive: program.isActive
      });
    } else {
      setFormData({
        name: '',
        faculty: 'คณะศึกษาศาสตร์',
        degree: 'ปริญญาตรี',
        duration: '4 ปี',
        description: '',
        maxQuota: 50,
        isActive: true
      });
    }
  }, [program]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 sm:p-10 animate-in fade-in zoom-in duration-300">
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
               <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">ชื่อสาขาวิชา</label>
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
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">คณะ</label>
                  <select 
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand outline-none transition-all font-bold text-sm"
                    value={formData.faculty}
                    onChange={(e) => setFormData({...formData, faculty: e.target.value})}
                  >
                     <option value="คณะศึกษาศาสตร์">คณะศึกษาศาสตร์</option>
                     <option value="คณะสังคมศาสตร์">คณะสังคมศาสตร์</option>
                     <option value="คณะมนุษยศาสตร์">คณะมนุษยศาสตร์</option>
                     <option value="คณะศาสนาและปรัชญา">คณะศาสนาและปรัชญา</option>
                  </select>
               </div>
               <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">ระยะเวลาหลักสูตร</label>
                  <div className="relative">
                    <input 
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand outline-none transition-all font-bold text-sm pl-10"
                      value={formData.duration}
                      placeholder="เช่น 4 ปี"
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    />
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">ระดับการศึกษา</label>
                  <input 
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand outline-none transition-all font-bold text-sm"
                    value={formData.degree}
                    placeholder="เช่น ปริญญาตรี"
                    onChange={(e) => setFormData({...formData, degree: e.target.value})}
                  />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">โควตารับ (คน)</label>
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
               <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">รายละเอียดเพิ่มเติม/หมายเหตุ</label>
               <input 
                 type="text" 
                 className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand outline-none transition-all font-bold text-sm"
                 placeholder="เช่น ภาคพิเศษ เรียนเสาร์-อาทิตย์"
                 value={formData.description}
                 onChange={(e) => setFormData({...formData, description: e.target.value})}
               />
            </div>

            <div className="flex items-center pt-2">
               <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 accent-brand"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  />
                  <span className="text-xs font-black text-navy uppercase tracking-widest">เปิดรับสมัคร</span>
               </label>
            </div>

            <div className="pt-6 flex gap-4">
               <button type="button" onClick={onClose} className="flex-1 py-4 rounded-2xl border-2 border-gray-100 text-gray-400 font-bold hover:bg-gray-50 transition-all text-sm uppercase tracking-widest">ยกเลิก</button>
               <button type="submit" className="flex-[2] py-4 rounded-2xl bg-brand text-white font-black hover:bg-brand-dark shadow-xl shadow-brand/20 transition-all text-sm uppercase tracking-widest active:scale-95">
                 {program ? 'อัปเดตข้อมูล' : 'ยืนยันเพิ่มสาขา'}
               </button>
            </div>
         </form>
      </div>
    </div>
  );
};
