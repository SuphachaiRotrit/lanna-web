'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Search, Loader2, Calendar } from 'lucide-react';
import { PremiumInput } from '@/components/ui/FormControls';
import Turnstile from '@/components/Turnstile';
import { getErrorMessage } from '@/lib/call-api';
import { useCheckStatus } from '../hooks/use-check-status';
import {
  STATUS_LABELS,
  STATUS_STYLES,
  EXAM_RESULT_LABELS,
  EXAM_RESULT_STYLES,
  REPORT_IN_LABELS,
  REPORT_IN_STYLES,
} from '@/constants/applicant-status';

const maskNationalId = (id: string) =>
  id.length === 13 ? `${id[0]}-${id.slice(1, 5)}-XXXXX-${id.slice(10, 12)}-${id[12]}` : id;

const StageRow = ({ label, value, style }: { label: string; value: string; style: string }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm font-bold text-navy/60">{label}</span>
    <span className={`px-3 py-1 rounded-full text-[12px] font-black uppercase ${style}`}>{value}</span>
  </div>
);

export const StatusView = () => {
  const searchParams = useSearchParams();
  const justSubmitted = searchParams.get('submitted') === '1';
  const submittedApplicationNumber = searchParams.get('app') || '';
  const [nationalId, setNationalId] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const { mutate, data, isPending, error } = useCheckStatus();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({ nationalId, birthDate, turnstileToken });
  };

  return (
    <div className="min-h-screen bg-cream">
      <nav className="border-b border-navy/5">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/img/logo.png" alt="ตราสัญลักษณ์ มมร" width={40} height={40} />
            <span className="font-bold text-navy">มมร. วิทยาเขตล้านนา</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-16">
        <h1 className="text-2xl font-black text-navy text-center mb-2">ตรวจสอบสถานะใบสมัคร</h1>
        <p className="text-navy/50 text-center text-sm mb-10">กรอกเลขบัตรประชาชนและวันเดือนปีเกิดเพื่อตรวจสอบสถานะ</p>

        {justSubmitted && (
          <div className="mb-8 p-5 bg-emerald-50 border border-emerald-100 rounded-2xl text-center">
            <p className="text-emerald-700 font-bold text-sm">ส่งใบสมัครสำเร็จ! เลขที่ใบสมัครของคุณคือ</p>
            <p className="text-emerald-800 font-black text-xl mt-1">{submittedApplicationNumber}</p>
            <p className="text-emerald-600 text-xs mt-2">โปรดจดไว้เป็นหลักฐาน หากติดต่อเจ้าหน้าที่ (ไม่จำเป็นต้องใช้ตรวจสอบสถานะด้านล่าง)</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-3xl shadow-sm border border-navy/5">
          <PremiumInput
            label="เลขบัตรประชาชน"
            required
            maxLength={13}
            value={nationalId}
            onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ''))}
            placeholder="กรอกเลข 13 หลัก"
          />
          <PremiumInput
            label="วันเดือนปีเกิด"
            type="date"
            required
            prefixIcon={<Calendar size={18} />}
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
          <Turnstile onVerify={setTurnstileToken} />
          <button
            type="submit"
            disabled={isPending || nationalId.length !== 13 || !birthDate || !turnstileToken}
            className="w-full py-3.5 bg-brand text-white rounded-xl font-black text-sm uppercase tracking-wider hover:bg-brand-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            ตรวจสอบสถานะ
          </button>
          {error && (
            <p className="text-red-500 text-sm font-bold text-center">{getErrorMessage(error, 'ไม่พบข้อมูลใบสมัคร')}</p>
          )}
        </form>

        {data && (
          <div className="mt-8 bg-white p-6 rounded-3xl shadow-sm border border-navy/5 space-y-5 animate-in fade-in slide-in-from-top-2">
            <div>
              <p className="text-sm text-navy/40 font-bold">{data.applicationNumber}</p>
              <h3 className="text-lg font-black text-navy">{data.fullName}</h3>
              <p className="text-sm text-navy/50">{data.program?.name}</p>
              <p className="text-[12px] text-navy/30 font-bold mt-1 tracking-wider">เลขที่ค้นหา: {maskNationalId(nationalId)}</p>
            </div>

            <div className="space-y-3 pt-2 border-t border-navy/5">
              <StageRow label="สถานะใบสมัคร" value={STATUS_LABELS[data.status]} style={STATUS_STYLES[data.status]} />
              {data.status === 'APPROVED' && (
                <StageRow label="ผลสอบ" value={EXAM_RESULT_LABELS[data.examResult]} style={EXAM_RESULT_STYLES[data.examResult]} />
              )}
              {data.examResult === 'PASSED' && (
                <StageRow label="การรายงานตัว" value={REPORT_IN_LABELS[data.reportInStatus]} style={REPORT_IN_STYLES[data.reportInStatus]} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
