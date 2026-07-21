import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { XCircle } from 'lucide-react';
import { User } from '@/types';
import { Switch } from '@/components/ui/Switch';
import { PremiumInput, PremiumSelect } from '@/components/ui/FormControls';
import { CreateUserPayload, UpdateUserPayload } from '@/services/user.service';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserPayload | UpdateUserPayload) => void;
  user?: User | null;
  isSubmitting?: boolean;
}

export const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSubmit, user, isSubmitting }) => {
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

  return createPortal(
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
          <PremiumInput
            label="อีเมล"
            type="email"
            pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
            title="อีเมลต้องมีโดเมนที่ถูกต้อง เช่น name@example.com"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!!user}
            required
            autoFocus={!user}
          />

          <PremiumInput
            label="ชื่อ-นามสกุล"
            placeholder="เช่น สมชาย ใจดี"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            autoFocus={!!user}
          />

          <PremiumSelect
            label="บทบาท"
            value={role}
            onChange={(e) => setRole(String(e.target.value) as 'SUPER_ADMIN' | 'STAFF')}
            options={[
              { label: 'Staff', value: 'STAFF' },
              { label: 'Super Admin', value: 'SUPER_ADMIN' },
            ]}
          />

          <PremiumInput
            label={user ? 'ตั้งรหัสผ่านใหม่ (เว้นว่างถ้าไม่เปลี่ยน)' : 'รหัสผ่าน'}
            type="password"
            placeholder="อย่างน้อย 8 ตัวอักษร"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required={!user}
          />

          {user && (
            <div className="pt-1">
              <Switch checked={isActive} onChange={setIsActive} label={isActive ? 'ใช้งานอยู่' : 'ปิดใช้งาน'} />
            </div>
          )}

          <div className="pt-6 flex gap-4">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 py-4 rounded-2xl border-2 border-gray-100 text-gray-400 font-bold hover:bg-gray-50 transition-all text-sm uppercase tracking-widest disabled:opacity-50">ยกเลิก</button>
            <button type="submit" disabled={isSubmitting} className="flex-[2] py-4 rounded-2xl bg-brand text-white font-black hover:bg-brand-dark shadow-xl shadow-brand/20 transition-all text-sm uppercase tracking-widest active:scale-95 disabled:opacity-60 disabled:active:scale-100">
              {isSubmitting ? 'กำลังบันทึก...' : user ? 'อัปเดตข้อมูล' : 'ยืนยันเพิ่มผู้ใช้'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
