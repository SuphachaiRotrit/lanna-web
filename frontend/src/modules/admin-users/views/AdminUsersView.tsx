'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, UserCog } from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks/use-auth';
import { useUsers, useUserMutation } from '../hooks/use-users';
import { UserTable } from '../components/UserTable';
import { UserModal } from '../components/UserModal';
import { User } from '@/types';
import { CreateUserPayload, UpdateUserPayload } from '@/services/user.service';

export const AdminUsersView = () => {
  const router = useRouter();
  const { user: currentUser, isLoading: isAuthLoading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    if (!isAuthLoading && currentUser && currentUser.role !== 'SUPER_ADMIN') {
      router.replace('/admin/dashboard');
    }
  }, [isAuthLoading, currentUser, router]);

  const { data: res, isLoading, progress } = useUsers();
  const users = res?.data || [];

  const { createMutation, updateMutation, deleteMutation } = useUserMutation(() => {
    setIsModalOpen(false);
    setEditingUser(null);
  });

  if (isAuthLoading || !currentUser || currentUser.role !== 'SUPER_ADMIN') {
    return null;
  }

  const handleOpenModal = (user: User | null = null) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (data: CreateUserPayload | UpdateUserPayload) => {
    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, data: data as UpdateUserPayload });
    } else {
      createMutation.mutate(data as CreateUserPayload);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[12px] font-bold text-brand uppercase tracking-[0.2em] bg-brand/5 px-2.5 py-1 rounded-md">Users</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">จัดการผู้ใช้</h1>
          <p className="text-gray-400 text-sm font-medium mt-0.5">เพิ่ม แก้ไข หรือปิดใช้งานบัญชีผู้ดูแลระบบ</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl font-bold text-sm shadow-lg shadow-brand/15 hover:bg-brand-dark transition-all active:scale-[0.98]"
        >
          <Plus size={18} />
          เพิ่มผู้ใช้
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 max-w-xs">
        <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center">
          <UserCog size={18} />
        </div>
        <div>
          <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wide">ทั้งหมด</p>
          <h4 className="text-xl font-extrabold text-gray-800">{users.length}</h4>
        </div>
      </div>

      <UserTable
        users={users}
        currentUserId={currentUser.id}
        onEdit={handleOpenModal}
        onDeactivate={(id) => deleteMutation.mutate(id)}
        onReactivate={(id) => updateMutation.mutate({ id, data: { isActive: true } })}
        isLoading={isLoading}
        progress={progress}
      />

      <UserModal
        key={editingUser?.id ?? 'new'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        user={editingUser}
      />
    </div>
  );
};
