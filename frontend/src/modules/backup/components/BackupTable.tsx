import React from 'react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { BackupLog } from '@/services/backup.service';

interface BackupTableProps {
  logs: BackupLog[];
  loading: boolean;
}

export const BackupTable: React.FC<BackupTableProps> = ({ logs, loading }) => (
  <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
    <div className="p-8 border-b border-gray-50">
      <h3 className="text-xl font-bold text-navy">ประวัติการสำรองข้อมูล</h3>
    </div>
    
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-50/50">
            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">วันที่เริ่ม</th>
            <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">จำนวนไฟล์</th>
            <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">ขนาดรวม</th>
            <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">สถานะ</th>
            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Drive ID</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {loading ? (
            <tr>
              <td colSpan={5} className="py-20 text-center">
                <Loader2 className="animate-spin mx-auto text-navy" />
              </td>
            </tr>
          ) : logs.map((log) => (
            <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-8 py-6 font-bold text-sm text-navy">
                {new Date(log.startedAt).toLocaleString('th-TH')}
              </td>
              <td className="px-6 py-6 text-sm font-medium text-gray-600">{log.fileCount} ไฟล์</td>
              <td className="px-6 py-6 text-sm font-medium text-gray-600">
                {(Number(log.totalSize) / 1024 / 1024).toFixed(2)} MB
              </td>
              <td className="px-6 py-6">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  log.status === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                }`}>
                  {log.status === 'success' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                  {log.status === 'success' ? 'สำเร็จ' : 'ล้มเหลว'}
                </span>
              </td>
              <td className="px-8 py-6 text-right">
                {log.driveFileId ? (
                  <span className="text-[10px] font-mono bg-gray-100 px-2 py-1 rounded text-gray-400 select-all">
                    {log.driveFileId.substring(0, 15)}...
                  </span>
                ) : '-'}
              </td>
            </tr>
          ))}
          {logs.length === 0 && !loading && (
            <tr>
              <td colSpan={5} className="py-20 text-center text-gray-400 font-bold">ยังไม่เคยมีการสำรองข้อมูล</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);
