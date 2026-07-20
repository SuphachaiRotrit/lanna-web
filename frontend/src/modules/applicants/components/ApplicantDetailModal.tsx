'use client';

import React, { useRef, useState } from 'react';
import { XCircle, FileText, ExternalLink, Printer, Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import { useApplicant, useApplicantMutation } from '../hooks/use-applicants';
import { Applicant, ApplicantDocument } from '@/types';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  STATUS_LABELS,
  STATUS_STYLES,
  EXAM_RESULT_LABELS,
  EXAM_RESULT_STYLES,
  REPORT_IN_LABELS,
  REPORT_IN_STYLES,
} from '@/constants/applicant-status';

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

const GENDER_LABELS: Record<Applicant['gender'], string> = {
  MALE: 'ชาย',
  FEMALE: 'หญิง',
  OTHER: 'อื่นๆ',
};

const formatDateTime = (value?: string) =>
  value ? new Date(value).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }) : undefined;

const formatFileSize = (bytes: number) => {
  if (!bytes) return undefined;
  const kb = bytes / 1024;
  return kb < 1024 ? `${kb.toFixed(0)} KB` : `${(kb / 1024).toFixed(1)} MB`;
};

const THAI_DIGITS = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
const toThaiNum = (value?: string | number | null) =>
  value === undefined || value === null || value === '' ? '' : String(value).replace(/[0-9]/g, (d) => THAI_DIGITS[Number(d)]);

const formatThaiDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString('th-TH-u-nu-thai', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

const FormField = ({ label, value, className }: { label?: string; value?: string | number | null; className?: string }) => (
  <div className={`flex items-baseline gap-1.5 py-0.5 ${className || ''}`}>
    {label && <span className="whitespace-nowrap shrink-0">{label}</span>}
    <span className="flex-1 border-b border-dotted border-black min-h-[1em] px-1">{value || ''}</span>
  </div>
);

const CheckField = ({ checked, label }: { checked: boolean; label: string }) => (
  <div className="flex items-baseline gap-1.5 py-0.5">
    <span className="shrink-0">({checked ? '✓' : ' '})</span>
    <span>{label}</span>
  </div>
);

const InfoRow = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div>
    <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
    <p className="text-sm font-bold text-navy mt-0.5">{value || '-'}</p>
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <p className="text-[12px] font-black text-brand uppercase tracking-widest mb-3">{title}</p>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-5">{children}</div>
  </div>
);

export const ApplicantDetailModal: React.FC<ApplicantDetailModalProps> = ({ applicantId, onClose }) => {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [reportInRejecting, setReportInRejecting] = useState(false);
  const [reportInReason, setReportInReason] = useState('');
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const { data: res, isLoading } = useApplicant(applicantId);
  const { updateStatus, updateExam, updateReportIn } = useApplicantMutation();
  const applicant = res?.data;
  const hasDoc = (type: ApplicantDocument['type']) => !!applicant?.documents?.some((d) => d.type === type);

  if (!applicantId) return null;

  const handleClose = () => {
    setRejecting(false);
    setReason('');
    setReportInRejecting(false);
    setReportInReason('');
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

  const handleSetExamResult = (examResult: 'PASSED' | 'FAILED') => {
    updateExam.mutate({ id: applicantId, examResult });
  };

  const handleConfirmReportIn = () => {
    updateReportIn.mutate({ id: applicantId, reportInStatus: 'CONFIRMED' }, { onSuccess: handleClose });
  };

  const handleConfirmReportInReject = () => {
    updateReportIn.mutate(
      { id: applicantId, reportInStatus: 'REJECTED', reason: reportInReason },
      { onSuccess: handleClose },
    );
  };

  const buildPdf = async () => {
    const canvas = await html2canvas(printRef.current!, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    return pdf;
  };

  const handlePrint = async () => {
    if (!printRef.current || !applicant) return;
    setGeneratingPdf(true);
    try {
      const pdf = await buildPdf();
      pdf.autoPrint();
      window.open(pdf.output('bloburl'), '_blank');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!printRef.current || !applicant) return;
    setGeneratingPdf(true);
    try {
      const pdf = await buildPdf();
      pdf.save(`ใบสมัคร_${applicant.applicationNumber}.pdf`);
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 print:static print:block print:p-0">
      <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm print:hidden" onClick={handleClose} />
      <div className="relative bg-white w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-[2.5rem] shadow-2xl p-8 sm:p-10 animate-in fade-in zoom-in duration-300 print:static print:max-w-none print:max-h-none print:overflow-visible print:rounded-none print:shadow-none print:p-0 print:animate-none">
        <div className="flex items-center justify-between mb-8 print:hidden">
          <h3 className="text-2xl font-black text-navy tracking-tight">รายละเอียดผู้สมัคร</h3>
          <button onClick={handleClose} className="p-2 text-gray-300 hover:bg-gray-100 rounded-full transition-colors">
            <XCircle size={24} />
          </button>
        </div>

        <div className="print:hidden">
        {isLoading || !applicant ? (
          <div className="space-y-8">
            <div className="space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-6 w-56" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-3 w-32" />
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <p className="text-[12px] font-bold text-brand uppercase tracking-[0.2em]">{applicant.applicationNumber}</p>
              <h4 className="text-xl font-black text-navy">{applicant.prefixName}{applicant.firstName} {applicant.lastName}</h4>
              {applicant.aliasName && <p className="text-sm font-bold text-gray-400">ชื่อเล่น {applicant.aliasName}</p>}
              <div className={`inline-flex items-center px-3 py-1 mt-2 rounded-full text-[12px] font-black uppercase tracking-wider ${STATUS_STYLES[applicant.status]}`}>
                {STATUS_LABELS[applicant.status] || applicant.status}
              </div>
            </div>

            <Section title="ข้อมูลส่วนตัว">
              <InfoRow label="เลขบัตรประชาชน" value={applicant.nationalId} />
              <InfoRow label="เพศ" value={GENDER_LABELS[applicant.gender] || applicant.gender} />
              <InfoRow label="วันเกิด" value={new Date(applicant.birthDate).toLocaleDateString('th-TH')} />
              <InfoRow label="เชื้อชาติ" value={applicant.ethnicity} />
              <InfoRow label="สัญชาติ" value={applicant.nationality} />
              <InfoRow label="ศาสนา" value={applicant.religion} />
              <InfoRow label="กรุ๊ปเลือด" value={applicant.bloodType} />
            </Section>

            <Section title="ข้อมูลติดต่อ">
              <InfoRow label="เบอร์โทรศัพท์" value={applicant.phone} />
              <InfoRow label="อีเมล" value={applicant.email} />
              <InfoRow label="LINE ID" value={applicant.lineId} />
            </Section>

            <Section title="ที่อยู่">
              <InfoRow label="บ้านเลขที่ / ถนน" value={applicant.address} />
              <InfoRow label="ตำบล/แขวง" value={applicant.subDistrict} />
              <InfoRow label="อำเภอ/เขต" value={applicant.district} />
              <InfoRow label="จังหวัด" value={applicant.province} />
              <InfoRow label="รหัสไปรษณีย์" value={applicant.postalCode} />
            </Section>

            <Section title="ประวัติการศึกษา">
              <InfoRow label="โรงเรียนเดิม" value={applicant.previousSchool} />
              <InfoRow label="จังหวัดโรงเรียนเดิม" value={applicant.schoolProvince} />
              <InfoRow label="วุฒิการศึกษาเดิม" value={applicant.previousEducation} />
              <InfoRow label="ปีที่จบการศึกษา" value={applicant.graduationYear} />
              <InfoRow label="เกรดเฉลี่ย" value={applicant.gpa} />
            </Section>

            <Section title="หลักสูตรที่สมัคร">
              <InfoRow label="สาขาวิชา" value={applicant.program?.name} />
              <InfoRow label="คณะ" value={applicant.program?.faculty?.name} />
              <InfoRow label="ระดับการศึกษา" value={applicant.program?.degree} />
              <InfoRow label="ระยะเวลาเรียน" value={applicant.program?.duration ? `${applicant.program.duration} ปี` : undefined} />
              <InfoRow label="เหตุผลการสมัคร" value={applicant.applicationReason} />
            </Section>

            <Section title="ข้อมูลผู้ปกครอง">
              <InfoRow label="ชื่อผู้ปกครอง" value={applicant.parentName} />
              <InfoRow label="เบอร์โทรผู้ปกครอง" value={applicant.parentPhone} />
              <InfoRow label="ความเกี่ยวข้อง" value={applicant.parentRelation} />
            </Section>

            <Section title="สถานะและการยินยอม">
              <InfoRow label="ปีการศึกษาที่สมัคร" value={applicant.applicationYear} />
              <InfoRow label="วันที่ยื่นใบสมัคร" value={formatDateTime(applicant.submittedAt)} />
              <InfoRow label="วันที่ตรวจสอบ" value={formatDateTime(applicant.reviewedAt)} />
              <InfoRow label="ยินยอม PDPA" value={applicant.pdpaConsent ? 'ยินยอม' : 'ไม่ยินยอม'} />
              <InfoRow label="วันที่ให้ความยินยอม" value={formatDateTime(applicant.consentedAt)} />
              {applicant.status === 'REJECTED' && applicant.rejectionReason && (
                <InfoRow label="เหตุผลที่ไม่ผ่านการสมัคร" value={applicant.rejectionReason} />
              )}
            </Section>

            <Section title="ผลสอบและการรายงานตัว">
              <div>
                <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest">ผลสอบ</p>
                <div className={`inline-flex items-center px-3 py-1 mt-1 rounded-full text-[12px] font-black uppercase tracking-wider ${EXAM_RESULT_STYLES[applicant.examResult]}`}>
                  {EXAM_RESULT_LABELS[applicant.examResult]}
                </div>
              </div>
              <div>
                <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest">รายงานตัว</p>
                <div className={`inline-flex items-center px-3 py-1 mt-1 rounded-full text-[12px] font-black uppercase tracking-wider ${REPORT_IN_STYLES[applicant.reportInStatus]}`}>
                  {REPORT_IN_LABELS[applicant.reportInStatus]}
                </div>
              </div>
              {applicant.reportInStatus === 'REJECTED' && applicant.reportInReason && (
                <InfoRow label="เหตุผลที่ปฏิเสธรายงานตัว" value={applicant.reportInReason} />
              )}
            </Section>

            <div>
              <p className="text-[12px] font-black text-brand uppercase tracking-widest mb-3">เอกสารแนบ</p>
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
                      {doc.fileName && <span className="text-gray-400 font-medium">({doc.fileName}{formatFileSize(doc.fileSize) ? `, ${formatFileSize(doc.fileSize)}` : ''})</span>}
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
                <label className="block text-[12px] font-black text-gray-400 uppercase mb-1.5 ml-1">เหตุผลที่ไม่ผ่านการสมัคร</label>
                <textarea
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand outline-none transition-all font-bold text-sm"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="เช่น เอกสารไม่ครบถ้วน"
                />
              </div>
            )}

            {reportInRejecting && (
              <div>
                <label className="block text-[12px] font-black text-gray-400 uppercase mb-1.5 ml-1">เหตุผลที่ปฏิเสธการรายงานตัว</label>
                <textarea
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand outline-none transition-all font-bold text-sm"
                  rows={3}
                  value={reportInReason}
                  onChange={(e) => setReportInReason(e.target.value)}
                  placeholder="เช่น ไม่มารายงานตัวตามกำหนด"
                />
              </div>
            )}
          </div>
        )}
        </div>

        {applicant && (
          <div
            ref={printRef}
            className="absolute -left-[9999px] top-0 print:static print:left-auto bg-white w-[794px] px-16 py-10 text-black text-[13px] leading-relaxed"
          >
            <div className="flex items-start justify-between">
              <div className="w-20 shrink-0" />
              <div className="flex flex-col items-center flex-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/img/logo.png" alt="" className="h-16 w-16 object-contain" />
              </div>
              <div className="w-[95px] h-[132px] border border-black flex flex-col items-center justify-center text-[10px] text-center shrink-0 overflow-hidden">
                {applicant.documents?.find((d) => d.type === 'PHOTO')?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={applicant.documents.find((d) => d.type === 'PHOTO')!.url} alt="" crossOrigin="anonymous" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <span>รูปถ่าย</span>
                    <span>ขนาด ๑ นิ้ว</span>
                  </>
                )}
              </div>
            </div>

            <div className="text-center mt-2 space-y-0.5">
              <p className="font-bold text-[15px]">ใบสมัครเข้าศึกษาต่อระดับปริญญาตรี ประจำปีการศึกษา {toThaiNum(applicant.applicationYear)}</p>
              <p className="font-bold text-[14px]">มหาวิทยาลัยมหามกุฏราชวิทยาลัย วิทยาเขตล้านนา</p>
            </div>

            <p className="text-center my-3 tracking-[0.6em]">◆❖◆</p>

            <div className="space-y-3">
              <div>
                <p>๑. สมัครเรียน ระดับปริญญาตรี ภาคปกติ หลักสูตร ๔ ปี (โปรดเลือก ๑ สาขาวิชา)</p>
                <FormField value={applicant.program?.name} />
              </div>

              <div>
                <p>๒. คำนำหน้า / ชื่อ / ฉายา / นามสกุล</p>
                <FormField
                  label="ชื่อ-ฉายา-นามสกุล"
                  value={`${applicant.prefixName}${applicant.firstName}${applicant.aliasName ? ` (${applicant.aliasName})` : ''} ${applicant.lastName}`}
                />
                <FormField label="หมายเลขบัตรประชาชน" value={toThaiNum(applicant.nationalId)} />
                <div className="flex gap-4">
                  <FormField label="เกิด วันที่/เดือน/พ.ศ." value={formatThaiDate(applicant.birthDate)} className="flex-[2]" />
                  <FormField label="สัญชาติ" value={applicant.nationality} className="flex-1" />
                </div>
              </div>

              <div>
                <p>๓. ที่อยู่ตามทะเบียนบ้าน เลขที่</p>
                <FormField value={applicant.address} />
                <FormField value={`ตำบล/แขวง ${applicant.subDistrict} อำเภอ/เขต ${applicant.district} จังหวัด ${applicant.province} รหัสไปรษณีย์ ${toThaiNum(applicant.postalCode)}`} />
                <FormField label="โทรศัพท์" value={toThaiNum(applicant.phone)} />
                <FormField label="E-mail" value={applicant.email} />
                <FormField label="Line ID" value={applicant.lineId} />
              </div>

              <div>
                <p>๔. วุฒิการศึกษาที่ใช้ในการสมัคร</p>
                <div className="flex gap-4">
                  <FormField label="ระดับการศึกษาที่จบ" value={applicant.previousEducation} className="flex-[2]" />
                  <FormField label="จบปี พ.ศ." value={toThaiNum(applicant.graduationYear)} className="flex-1" />
                  <FormField label="เกรดเฉลี่ย" value={toThaiNum(applicant.gpa)} className="flex-1" />
                </div>
                <FormField label="จบจากโรงเรียน" value={applicant.previousSchool} />
                <FormField label="จังหวัด" value={applicant.schoolProvince} />
              </div>

              <div>
                <p>๕. เหตุผลการสมัครเรียนในมหาวิทยาลัยมหามกุฏราชวิทยาลัย วิทยาเขตล้านนา</p>
                <FormField value={applicant.applicationReason} />
                <FormField value="" />
              </div>

              <div className="pt-2">
                <p>
                  ข้าพเจ้าขอรับรองข้อความแสดงไว้เป็นความจริงทุกประการ หากข้าพเจ้าได้เป็นนักศึกษาของมหาวิทยาลัยมหามกุฏราชวิทยาลัย
                  วิทยาเขตล้านนา ข้าพเจ้ายินยอมปฏิบัติตามระเบียบข้อบังคับของมหาวิทยาลัยทุกประการ
                </p>
                <p className="mt-2">ทั้งนี้ ข้าพเจ้าได้แนบหลักฐานการสมัครมาพร้อมนี้ ดังนี้</p>
                <div className="grid grid-cols-2 gap-x-4 mt-1">
                  <CheckField checked={hasDoc('TRANSCRIPT')} label="สำเนาระเบียนผลการศึกษา จำนวน ๑ ฉบับ" />
                  <CheckField checked={hasDoc('HOUSE_REGISTRATION')} label="สำเนาทะเบียนบ้าน จำนวน ๑ ฉบับ" />
                  <CheckField checked={hasDoc('ID_CARD')} label="สำเนาบัตรประจำตัวประชาชน จำนวน ๑ ฉบับ" />
                  <CheckField checked={hasDoc('NAME_CHANGE')} label="สำเนาการเปลี่ยนชื่อ-นามสกุล (ถ้ามี)" />
                  <CheckField checked={hasDoc('PHOTO')} label="รูปถ่ายขนาด ๑ นิ้ว จำนวน ๑ รูป" />
                </div>
              </div>

              <div className="flex justify-between pt-8 text-center">
                <div>
                  <p>(ลงชื่อ)..................................................... ผู้สมัคร</p>
                  <p className="mt-1">(......................................)</p>
                  <p className="mt-1">........... / ........... / ...........</p>
                </div>
                <div>
                  <p>(ลงชื่อ)..................................................... เจ้าหน้าที่รับสมัคร</p>
                  <p className="mt-1">(......................................)</p>
                  <p className="mt-1">........... / ........... / ...........</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="pt-8 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="py-3 px-6 rounded-2xl border-2 border-gray-100 text-gray-400 font-bold hover:bg-gray-50 transition-all text-sm uppercase tracking-widest"
            >
              ปิด
            </button>
            <button
              type="button"
              disabled={!applicant || generatingPdf}
              onClick={handlePrint}
              className="flex items-center gap-2 py-3 px-5 rounded-2xl border-2 border-gray-100 text-navy font-bold hover:bg-gray-50 disabled:opacity-40 transition-all text-sm uppercase tracking-widest"
            >
              {generatingPdf ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
              พิมพ์
            </button>
            <button
              type="button"
              disabled={!applicant || generatingPdf}
              onClick={handleDownloadPdf}
              className="flex items-center gap-2 py-3 px-5 rounded-2xl border-2 border-gray-100 text-navy font-bold hover:bg-gray-50 disabled:opacity-40 transition-all text-sm uppercase tracking-widest"
            >
              {generatingPdf ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              ดาวน์โหลด PDF
            </button>
          </div>

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
                  className="flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-red-500 text-white font-black hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-red-500/20 transition-all text-sm uppercase tracking-widest"
                >
                  {updateStatus.isPending ? <><Loader2 size={16} className="animate-spin" /> กำลังยืนยัน...</> : 'ยืนยันไม่ผ่านการสมัคร'}
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
                  ไม่ผ่านการสมัคร
                </button>
                <button
                  type="button"
                  disabled={updateStatus.isPending}
                  onClick={handleApprove}
                  className="flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-emerald-500 text-white font-black hover:bg-emerald-600 disabled:opacity-40 shadow-xl shadow-emerald-500/20 transition-all text-sm uppercase tracking-widest"
                >
                  {updateStatus.isPending ? <><Loader2 size={16} className="animate-spin" /> กำลังยืนยัน...</> : 'ผ่านการสมัคร'}
                </button>
              </div>
            )
          )}

          {applicant?.status === 'APPROVED' && applicant.examResult === 'NOT_YET' && (
            <div className="flex gap-3">
              <button
                type="button"
                disabled={updateExam.isPending}
                onClick={() => handleSetExamResult('FAILED')}
                className="flex items-center justify-center gap-2 py-3 px-5 rounded-2xl border-2 border-red-100 text-red-500 font-black hover:bg-red-50 transition-all text-sm uppercase tracking-widest"
              >
                {updateExam.isPending ? <><Loader2 size={16} className="animate-spin" /> กำลังยืนยัน...</> : 'สอบไม่ผ่าน'}
              </button>
              <button
                type="button"
                disabled={updateExam.isPending}
                onClick={() => handleSetExamResult('PASSED')}
                className="flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-emerald-500 text-white font-black hover:bg-emerald-600 disabled:opacity-40 shadow-xl shadow-emerald-500/20 transition-all text-sm uppercase tracking-widest"
              >
                {updateExam.isPending ? <><Loader2 size={16} className="animate-spin" /> กำลังยืนยัน...</> : 'สอบผ่าน'}
              </button>
            </div>
          )}

          {applicant?.examResult === 'PASSED' && applicant.reportInStatus === 'NOT_YET' && (
            reportInRejecting ? (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setReportInRejecting(false); setReportInReason(''); }}
                  className="py-3 px-5 rounded-2xl border-2 border-gray-100 text-gray-400 font-bold hover:bg-gray-50 transition-all text-sm uppercase tracking-widest"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  disabled={!reportInReason.trim() || updateReportIn.isPending}
                  onClick={handleConfirmReportInReject}
                  className="flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-red-500 text-white font-black hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-red-500/20 transition-all text-sm uppercase tracking-widest"
                >
                  {updateReportIn.isPending ? <><Loader2 size={16} className="animate-spin" /> กำลังยืนยัน...</> : 'ยืนยันปฏิเสธรายงานตัว'}
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={updateReportIn.isPending}
                  onClick={() => setReportInRejecting(true)}
                  className="py-3 px-5 rounded-2xl border-2 border-red-100 text-red-500 font-black hover:bg-red-50 transition-all text-sm uppercase tracking-widest"
                >
                  ปฏิเสธรายงานตัว
                </button>
                <button
                  type="button"
                  disabled={updateReportIn.isPending}
                  onClick={handleConfirmReportIn}
                  className="flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-emerald-500 text-white font-black hover:bg-emerald-600 disabled:opacity-40 shadow-xl shadow-emerald-500/20 transition-all text-sm uppercase tracking-widest"
                >
                  {updateReportIn.isPending ? <><Loader2 size={16} className="animate-spin" /> กำลังยืนยัน...</> : 'อนุมัติรายงานตัว'}
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
