import React from 'react';
import { Edit2, Power, PowerOff, ShieldCheck } from 'lucide-react';
import { User } from '@/types';

interface UserTableProps {
  users: User[];
  currentUserId?: string;
  onEdit: (user: User) => void;
  onDeactivate: (id: string) => void;
  onReactivate: (id: string) => void;
  isLoading: boolean;
  progress: number;
}

const formatLastLogin = (value: string | null) => {
  if (!value) return 'ยังไม่เคยเข้าสู่ระบบ';
  return new Date(value).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });
};

export const UserTable: React.FC<UserTableProps> = ({
  users,
  currentUserId,
  onEdit,
  onDeactivate,
  onReactivate,
  isLoading,
  progress,
}) => {
  if (isLoading) return (
    <div className="p-16 text-center flex flex-col items-center gap-2 bg-white rounded-2xl border border-gray-100">
      <span className="text-3xl font-black text-brand tabular-nums">{progress}%</span>
      <span className="text-gray-400 text-sm font-bold">กำลังโหลดข้อมูล...</span>
    </div>
  );

  if (users.length === 0) return (
    <div className="p-16 text-center text-gray-400 font-bold bg-white rounded-2xl border border-gray-100">
      ไม่พบข้อมูลผู้ใช้
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50/80 border-b border-gray-100">
            <th className="px-6 py-4 text-[12px] font-extrabold text-gray-400 uppercase tracking-[0.15em]">ชื่อ-นามสกุล</th>
            <th className="px-6 py-4 text-[12px] font-extrabold text-gray-400 uppercase tracking-[0.15em]">อีเมล</th>
            <th className="px-6 py-4 text-[12px] font-extrabold text-gray-400 uppercase tracking-[0.15em]">บทบาท</th>
            <th className="px-6 py-4 text-[12px] font-extrabold text-gray-400 uppercase tracking-[0.15em]">สถานะ</th>
            <th className="px-6 py-4 text-[12px] font-extrabold text-gray-400 uppercase tracking-[0.15em]">เข้าสู่ระบบล่าสุด</th>
            <th className="px-6 py-4 text-[12px] font-extrabold text-gray-400 uppercase tracking-[0.15em] text-right">จัดการ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {users.map((user) => {
            const isSelf = user.id === currentUserId;
            return (
              <tr key={user.id} className="group hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-gray-800">
                  <div className="flex items-center gap-2">
                    {user.fullName}
                    {isSelf && (
                      <span className="text-[11px] font-bold text-brand bg-brand/5 px-2 py-0.5 rounded-md">คุณ</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 font-medium">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    user.role === 'SUPER_ADMIN'
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-blue-50 text-blue-500'
                  }`}>
                    {user.role === 'SUPER_ADMIN' && <ShieldCheck size={12} />}
                    {user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Staff'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    user.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {user.isActive ? 'ใช้งานอยู่' : 'ปิดใช้งาน'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-400 font-medium">{formatLastLogin(user.lastLoginAt)}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(user)}
                      className="p-2 text-gray-400 hover:text-brand hover:bg-brand/5 rounded-lg transition-all"
                      title="แก้ไข"
                    >
                      <Edit2 size={14} />
                    </button>
                    {user.isActive ? (
                      <button
                        onClick={() => onDeactivate(user.id)}
                        disabled={isSelf}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 disabled:cursor-not-allowed"
                        title={isSelf ? 'ไม่สามารถปิดใช้งานบัญชีตัวเองได้' : 'ปิดใช้งาน'}
                      >
                        <PowerOff size={14} />
                      </button>
                    ) : (
                      <button
                        onClick={() => onReactivate(user.id)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                        title="เปิดใช้งาน"
                      >
                        <Power size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
