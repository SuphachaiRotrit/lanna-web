import React, { useEffect, useState } from 'react';
import { Reorder } from 'framer-motion';
import { GripVertical, Pencil, Trash2, Loader2, ImageOff } from 'lucide-react';
import { Banner } from '@/types';

interface BannerListProps {
  banners: Banner[];
  onEdit: (banner: Banner) => void;
  onDelete: (id: string) => void;
  onReorder: (ids: string[]) => void;
  isLoading?: boolean;
  deletingId?: string;
}

export const BannerList: React.FC<BannerListProps> = ({ banners, onEdit, onDelete, onReorder, isLoading, deletingId }) => {
  const [items, setItems] = useState(banners);

  useEffect(() => setItems(banners), [banners]);

  if (isLoading) {
    return <div className="py-16 text-center text-gray-300 text-sm font-bold">กำลังโหลด...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="py-16 flex flex-col items-center gap-3 text-gray-300">
        <ImageOff size={28} />
        <p className="text-sm font-bold">ยังไม่มีสไลด์ กดเพิ่มสไลด์เพื่อเริ่มต้น</p>
      </div>
    );
  }

  return (
    <Reorder.Group
      axis="y"
      values={items}
      onReorder={setItems}
      className="space-y-3"
    >
      {items.map((banner) => (
        <Reorder.Item
          key={banner.id}
          value={banner}
          onDragEnd={() => onReorder(items.map((b) => b.id))}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 p-3"
        >
          <GripVertical size={18} className="text-gray-300 cursor-grab active:cursor-grabbing shrink-0" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={banner.imageUrl} alt={banner.title || 'banner'} className="w-24 h-14 object-cover rounded-lg shrink-0 bg-gray-50" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-navy text-sm truncate">{banner.title || <span className="text-gray-300">ไม่มีชื่อ</span>}</p>
            {banner.linkUrl && <p className="text-xs text-gray-400 truncate">{banner.linkUrl}</p>}
            <span className={`inline-block mt-1 text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${banner.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
              {banner.isActive ? 'แสดงอยู่' : 'ปิดใช้งาน'}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => onEdit(banner)} className="p-2 text-gray-400 hover:text-brand hover:bg-brand/5 rounded-lg transition-colors">
              <Pencil size={16} />
            </button>
            <button
              onClick={() => onDelete(banner.id)}
              disabled={deletingId === banner.id}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            >
              {deletingId === banner.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            </button>
          </div>
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
};
