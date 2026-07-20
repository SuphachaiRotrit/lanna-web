import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { XCircle, UploadCloud, Loader2 } from 'lucide-react';
import { Banner } from '@/types';
import { Switch } from '@/components/ui/Switch';
import { uploadFileApi } from '@/services/upload.service';
import { getErrorMessage } from '@/lib/call-api';
import { toast } from 'sonner';

interface BannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Banner>) => void;
  banner?: Banner | null;
  isSubmitting?: boolean;
}

const defaultFormData: Partial<Banner> = {
  imageKey: '',
  title: '',
  linkUrl: '',
  isActive: true,
};

export const BannerModal: React.FC<BannerModalProps> = ({ isOpen, onClose, onSubmit, banner, isSubmitting }) => {
  const [formData, setFormData] = useState<Partial<Banner>>(() =>
    banner
      ? {
          imageKey: banner.imageKey,
          title: banner.title || '',
          linkUrl: banner.linkUrl || '',
          isActive: banner.isActive,
        }
      : defaultFormData
  );
  const [previewUrl, setPreviewUrl] = useState<string>(banner?.imageUrl || '');
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setIsUploading(true);
    try {
      const [promise] = await uploadFileApi(file, 'banners');
      const result = await promise;
      setFormData((prev) => ({ ...prev, imageKey: result.key }));
    } catch (err) {
      toast.error(getErrorMessage(err, 'ไม่สามารถอัปโหลดรูปภาพได้'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl p-8 sm:p-10 animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-black text-navy tracking-tight">
            {banner ? 'แก้ไขสไลด์' : 'เพิ่มสไลด์ใหม่'}
          </h3>
          <button onClick={onClose} className="p-2 text-gray-300 hover:bg-gray-100 rounded-full transition-colors">
            <XCircle size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[12px] font-black text-gray-400 uppercase mb-1.5 ml-1">รูปภาพ</label>
            <label className="relative flex flex-col items-center justify-center w-full aspect-video bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-brand/40 transition-all overflow-hidden">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-300">
                  <UploadCloud size={28} />
                  <span className="text-xs font-bold">อัปโหลดรูปภาพ (JPEG/PNG/WebP)</span>
                </div>
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                  <Loader2 size={24} className="animate-spin text-brand" />
                </div>
              )}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
            </label>
          </div>

          <div>
            <label className="block text-[12px] font-black text-gray-400 uppercase mb-1.5 ml-1">ชื่อสไลด์ (ไม่บังคับ)</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand outline-none transition-all font-bold text-sm"
              placeholder="เช่น เปิดรับนักศึกษาใหม่ 2569"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[12px] font-black text-gray-400 uppercase mb-1.5 ml-1">ลิงก์เมื่อคลิก (ไม่บังคับ)</label>
            <input
              type="url"
              className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand outline-none transition-all font-bold text-sm"
              placeholder="https://..."
              value={formData.linkUrl}
              onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
            />
          </div>

          <div className="flex items-center pt-2">
            <Switch
              checked={!!formData.isActive}
              onChange={(checked) => setFormData({ ...formData, isActive: checked })}
              label="แสดงในสไลด์โชว์"
            />
          </div>

          <div className="pt-6 flex gap-4">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 py-4 rounded-2xl border-2 border-gray-100 text-gray-400 font-bold hover:bg-gray-50 transition-all text-sm uppercase tracking-widest disabled:opacity-50">ยกเลิก</button>
            <button type="submit" disabled={isSubmitting || isUploading || !formData.imageKey} className="flex-[2] py-4 rounded-2xl bg-brand text-white font-black hover:bg-brand-dark shadow-xl shadow-brand/20 transition-all text-sm uppercase tracking-widest active:scale-95 disabled:opacity-60 disabled:active:scale-100">
              {isSubmitting ? 'กำลังบันทึก...' : banner ? 'อัปเดตสไลด์' : 'ยืนยันเพิ่มสไลด์'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
