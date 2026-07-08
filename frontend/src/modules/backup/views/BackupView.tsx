'use client';

import React from 'react';
import { Database, HardDriveUpload, CheckCircle2, Loader2 } from 'lucide-react';
import { useBackupLogs, useBackupMutation } from '../hooks/use-backup';
import { BackupTable } from '../components/BackupTable';

export const BackupView = () => {
  const { data: res, isLoading } = useBackupLogs();
  const { mutate: triggerBackup, isPending } = useBackupMutation();
  const logs = res?.data || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-navy">ระบบสำรองข้อมูล</h2>
          <p className="text-gray-500 font-medium">จัดการและตรวจสอบประวัติการสำรองข้อมูลไปยัง Cloud Storage</p>
        </div>
        <button 
          onClick={() => triggerBackup()}
          disabled={isPending}
          className="px-8 py-4 bg-navy text-white rounded-2xl font-bold text-sm flex items-center gap-3 hover:shadow-xl hover:shadow-navy/20 transition-all disabled:opacity-50"
        >
          {isPending ? <Loader2 className="animate-spin" /> : <HardDriveUpload />}
          {isPending ? 'กำลังรัน Backup...' : 'เริ่มสำรองข้อมูลทันที'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-brand/20 text-navy rounded-2xl flex items-center justify-center">
              <Database size={24} />
            </div>
            <div>
              <h3 className="font-bold text-navy">Google Drive Storage</h3>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Automated Backup Status</p>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-500">ความถี่ในการสำรอง</span>
              <span className="text-sm font-black text-navy">ทุกวันที่ 1 ของเดือน (02:00 น.)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-500">ประเภทข้อมูล</span>
              <span className="text-sm font-black text-navy">DB JSON + R2 Documents</span>
            </div>
          </div>
        </div>

        <div className="bg-navy p-8 rounded-[2.5rem] text-white shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold mb-2">มาตรฐานความปลอดภัย</h3>
            <p className="text-white/60 text-sm">ข้อมูลทั้งหมดจะถูกบีบอัดเป็นรหัสผ่าน (ZIP) และจัดเก็บใน Google Drive ส่วนตัวที่ผ่านการรับรองสิทธิ์เท่านั้น</p>
          </div>
          <div className="mt-8 flex items-center gap-2 text-xs font-bold text-brand italic">
            <CheckCircle2 size={16} />
            ระบบสำรองข้อมูลพร้อมใช้งาน
          </div>
        </div>
      </div>

      <BackupTable logs={logs} loading={isLoading} />
    </div>
  );
};
