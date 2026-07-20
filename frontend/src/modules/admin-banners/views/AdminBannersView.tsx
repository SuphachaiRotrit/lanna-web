import React, { useState } from 'react';
import { Plus, Images } from 'lucide-react';
import { useBanners, useBannerMutation } from '../hooks/use-banners';
import { BannerList } from '../components/BannerList';
import { BannerModal } from '../components/BannerModal';
import { Banner } from '@/types';

export const AdminBannersView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const { data: res, isLoading } = useBanners();
  const banners = res?.data || [];

  const { createMutation, updateMutation, deleteMutation, reorderMutation } = useBannerMutation(() => {
    setIsModalOpen(false);
    setEditingBanner(null);
  });

  const handleOpenModal = (banner: Banner | null = null) => {
    setEditingBanner(banner);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (data: Partial<Banner>) => {
    if (editingBanner) {
      updateMutation.mutate({ id: editingBanner.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[12px] font-bold text-brand uppercase tracking-[0.2em] bg-brand/5 px-2.5 py-1 rounded-md">Banners</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">จัดการสไลด์โชว์</h1>
          <p className="text-gray-400 text-sm font-medium mt-0.5">เพิ่ม ลบ แก้ไข และเรียงลำดับรูปภาพที่แสดงบนหน้าแรก</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl font-bold text-sm shadow-lg shadow-brand/15 hover:bg-brand-dark transition-all active:scale-[0.98]"
        >
          <Plus size={18} />
          เพิ่มสไลด์
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 w-fit">
        <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center">
          <Images size={18} />
        </div>
        <div>
          <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wide">ทั้งหมด</p>
          <h4 className="text-xl font-extrabold text-gray-800">{banners.length}</h4>
        </div>
      </div>

      <BannerList
        banners={banners}
        onEdit={handleOpenModal}
        onDelete={(id) => deleteMutation.mutate(id)}
        onReorder={(ids) => reorderMutation.mutate(ids)}
        isLoading={isLoading}
        deletingId={deleteMutation.isPending ? deleteMutation.variables : undefined}
      />

      <BannerModal
        key={editingBanner?.id ?? 'new'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        banner={editingBanner}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};
