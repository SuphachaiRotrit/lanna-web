import React, { useState } from 'react';
import { XCircle } from 'lucide-react';
import { User } from '@/types';
import { Switch } from '@/components/ui/Switch';
import { CreateUserPayload, UpdateUserPayload } from '@/services/user.service';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserPayload | UpdateUserPayload) => void;
  user?: User | null;
}

export const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSubmit, user }) => {
  const [email, setEmail] = useState(user?.email || '');
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [role, setRole] = useState<'SUPER_ADMIN' | 'STAFF'>(user?.role || 'STAFF');
  const [password, setPassword] = useState('');
  const [isActive, setIsActive] = useState(user?.isActive ?? true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      const data: UpdateUserPayload = { fullName, role, isActive };
      if (password) data.password = password;
      onSubmit(data);
    } else {
      onSubmit({ email, fullName, role, password });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 sm:p-10 animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-black text-navy tracking-tight">
            {user ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้ใหม่'}
          </h3>
          <button onClick={onClose} className="p-2 text-gray-300 hover:bg-gray-100 rounded-full transition-colors">
            <XCircle size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[12px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">อีเมล</label>
            <input
              type="email"
              className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand outline-none transition-all font-bold text-sm disabled:text-gray-400 disabled:cursor-not-allowed"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!!user}
              required
              autoFocus={!user}
            />
          </div>

          <div>
            <label className="block text-[12px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">ชื่อ-นามสกุล</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand outline-none transition-all font-bold text-sm"
              placeholder="เช่น สมชาย ใจดี"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoFocus={!!user}
            />
          </div>

          <div>
            <label className="block text-[12px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">บทบาท</label>
            <select
              className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand outline-none transition-all font-bold text-sm"
              value={role}
              onChange={(e) => setRole(e.target.value as 'SUPER_ADMIN' | 'STAFF')}
            >
              <option value="STAFF">Staff</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
              {user ? 'ตั้งรหัสผ่านใหม่ (เว้นว่างถ้าไม่เปลี่ยน)' : 'รหัสผ่าน'}
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand outline-none transition-all font-bold text-sm"
              placeholder="อย่างน้อย 8 ตัวอักษร"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required={!user}
            />
          </div>

          {user && (
            <div className="pt-1">
              <Switch checked={isActive} onChange={setIsActive} label={isActive ? 'ใช้งานอยู่' : 'ปิดใช้งาน'} />
            </div>
          )}

          <div className="pt-6 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 rounded-2xl border-2 border-gray-100 text-gray-400 font-bold hover:bg-gray-50 transition-all text-sm uppercase tracking-widest">ยกเลิก</button>
            <button type="submit" className="flex-[2] py-4 rounded-2xl bg-brand text-white font-black hover:bg-brand-dark shadow-xl shadow-brand/20 transition-all text-sm uppercase tracking-widest active:scale-95">
              {user ? 'อัปเดตข้อมูล' : 'ยืนยันเพิ่มผู้ใช้'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
