'use client';

import React, { useState } from 'react';
import { XCircle, FileText, ExternalLink } from 'lucide-react';
import { useApplicant, useApplicantMutation } from '../hooks/use-applicants';
import { ApplicantDocument } from '@/types';

interface ApplicantDetailModalProps {
  applicantId: string | null;
  onClose: () => void;
}

const DOCUMENT_LABELS: Record<ApplicantDocument['type'], string> = {
  PHOTO: 'รูปถ่าย',
  ID_CARD: 'บัตรประชาชน / ใบสุทธิ',
  HOUSE_REGISTRATION: 'ทะเบียนบ้าน',
  TRANSCRIPT: 'วุฒิการศึกษา / Transcript',
  CERTIFICATE: 'ใบรับรอง',
  NAME_CHANGE: 'ใบเปลี่ยนชื่อ-นามสกุล',
  OTHER: 'เอกสารอื่นๆ',
};

const InfoRow = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div>
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
    <p className="text-sm font-bold text-navy mt-0.5">{value || '-'}</p>
  </div>
);

export const ApplicantDetailModal: React.FC<ApplicantDetailModalProps> = ({ applicantId, onClose }) => {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const { data: res, isLoading } = useApplicant(applicantId);
  const { updateStatus } = useApplicantMutation();
  const applicant = res?.data;

  if (!applicantId) return null;

  const handleClose = () => {
    setRejecting(false);
    setReason('');
    onClose();
  };

  const handleApprove = () => {
    updateStatus.mutate({ id: applicantId, status: 'APPROVED' }, { onSuccess: handleClose });
  };

  const handleConfirmReject = () => {
    updateStatus.mutate(
      { id: applicantId, status: 'REJECTED', reason },
      { onSuccess: handleClose },
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-[2.5rem] shadow-2xl p-8 sm:p-10 animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-black text-navy tracking-tight">รายละเอียดผู้สมัคร</h3>
          <button onClick={handleClose} className="p-2 text-gray-300 hover:bg-gray-100 rounded-full transition-colors">
            <XCircle size={24} />
          </button>
        </div>

        {isLoading || !applicant ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <p className="text-[10px] font-bold text-brand uppercase tracking-[0.2em]">{applicant.applicationNumber}</p>
              <h4 className="text-xl font-black text-navy">{applicant.prefixName}{applicant.firstName} {applicant.lastName}</h4>
              <p className="text-sm font-bold text-gray-500">{applicant.program?.name}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-5">
              <InfoRow label="เลขบัตรประชาชน" value={applicant.nationalId} />
              <InfoRow label="เพศ" value={applicant.gender} />
              <InfoRow label="วันเกิด" value={new Date(applicant.birthDate).toLocaleDateString('th-TH')} />
              <InfoRow label="เบอร์โทรศัพท์" value={applicant.phone} />
              <InfoRow label="อีเมล" value={applicant.email} />
              <InfoRow label="LINE ID" value={applicant.lineId} />
              <InfoRow label="ที่อยู่" value={`${applicant.address} ต.${applicant.subDistrict} อ.${applicant.district} จ.${applicant.province} ${applicant.postalCode}`} />
              <InfoRow label="โรงเรียนเดิม" value={applicant.previousSchool} />
              <InfoRow label="วุฒิการศึกษาเดิม" value={applicant.previousEducation} />
              <InfoRow label="เกรดเฉลี่ย" value={applicant.gpa} />
              <InfoRow label="ผู้ปกครอง" value={applicant.parentName} />
              <InfoRow label="เบอร์โทรผู้ปกครอง" value={applicant.parentPhone} />
              <InfoRow label="เหตุผลการสมัคร" value={applicant.applicationReason} />
            </div>

            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">เอกสารแนบ</p>
              <div className="space-y-2">
                {(applicant.documents || []).map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 border border-gray-100 p-3 rounded-xl transition-colors"
                  >
                    <span className="flex items-center gap-2.5 text-sm font-bold text-navy">
                      <FileText size={16} className="text-gray-400" />
                      {DOCUMENT_LABELS[doc.type]}
                    </span>
                    <ExternalLink size={14} className="text-gray-400" />
                  </a>
                ))}
                {(!applicant.documents || applicant.documents.length === 0) && (
                  <p className="text-sm text-gray-400 font-medium">ไม่มีเอกสารแนบ</p>
                )}
              </div>
            </div>

            {rejecting && (
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">เหตุผลที่ไม่ผ่าน</label>
                <textarea
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand outline-none transition-all font-bold text-sm"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="เช่น เอกสารไม่ครบถ้วน"
                />
              </div>
            )}
          </div>
        )}

        <div className="pt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={handleClose}
            className="py-3 px-6 rounded-2xl border-2 border-gray-100 text-gray-400 font-bold hover:bg-gray-50 transition-all text-sm uppercase tracking-widest"
          >
            ปิด
          </button>

          {applicant?.status === 'REVIEWING' && (
            rejecting ? (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setRejecting(false); setReason(''); }}
                  className="py-3 px-5 rounded-2xl border-2 border-gray-100 text-gray-400 font-bold hover:bg-gray-50 transition-all text-sm uppercase tracking-widest"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  disabled={!reason.trim() || updateStatus.isPending}
                  onClick={handleConfirmReject}
                  className="py-3 px-5 rounded-2xl bg-red-500 text-white font-black hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-red-500/20 transition-all text-sm uppercase tracking-widest"
                >
                  ยืนยันไม่ผ่าน
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={updateStatus.isPending}
                  onClick={() => setRejecting(true)}
                  className="py-3 px-5 rounded-2xl border-2 border-red-100 text-red-500 font-black hover:bg-red-50 transition-all text-sm uppercase tracking-widest"
                >
                  ไม่ผ่าน
                </button>
                <button
                  type="button"
                  disabled={updateStatus.isPending}
                  onClick={handleApprove}
                  className="py-3 px-5 rounded-2xl bg-emerald-500 text-white font-black hover:bg-emerald-600 disabled:opacity-40 shadow-xl shadow-emerald-500/20 transition-all text-sm uppercase tracking-widest"
                >
                  อนุมัติผ่าน
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
