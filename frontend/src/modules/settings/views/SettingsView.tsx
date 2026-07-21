'use client';

import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { KeyRound, Lock, ShieldCheck, Trash2, CalendarDays } from 'lucide-react';
import { ExtraCompactInput } from '@/modules/auth/components/ExtraCompactInput';
import { YearPicker } from '@/components/ui/FormControls';
import { changePasswordApi, ChangePasswordPayload } from '@/services/auth.service';
import { purgeApplicantsApi } from '@/services/applicant.service';
import { useAuth } from '@/modules/auth/hooks/use-auth';
import { getErrorMessage } from '@/lib/call-api';
import { toBuddhistYear } from '@/lib/date';
import { useSetting, useUpdateSetting } from '../hooks/use-settings';

const changePasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required('กรุณาระบุรหัสผ่านปัจจุบัน'),
  newPassword: Yup.string()
    .min(8, 'รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร')
    .required('กรุณาระบุรหัสผ่านใหม่'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'รหัสผ่านใหม่ไม่ตรงกัน')
    .required('กรุณายืนยันรหัสผ่านใหม่'),
});

export const SettingsView = () => {
  const { user } = useAuth();
  const currentYear = toBuddhistYear(new Date().getFullYear());
  const [purgeYear, setPurgeYear] = useState(currentYear);

  const { data: settingRes } = useSetting();
  const updateSettingMutation = useUpdateSetting();
  const [applicationYear, setApplicationYear] = useState<number | undefined>(undefined);
  const [appliedSettingYear, setAppliedSettingYear] = useState<number | undefined>(undefined);

  if (settingRes?.data && settingRes.data.currentApplicationYear !== appliedSettingYear) {
    setAppliedSettingYear(settingRes.data.currentApplicationYear);
    setApplicationYear(settingRes.data.currentApplicationYear);
  }

  const purgeMutation = useMutation({
    mutationFn: async (year: number) => {
      const [promise] = await purgeApplicantsApi(year);
      const blob = await promise;

      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `applicants_purged_${year}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      return true;
    },
    onSuccess: () => {
      toast.success('ส่งออกและลบข้อมูลเก่าสำเร็จ');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'ไม่สามารถลบข้อมูลเก่าได้'));
    },
  });

  const handlePurge = () => {
    const confirmed = window.confirm(
      `ต้องการลบข้อมูลผู้สมัครปีการศึกษา ${purgeYear} อย่างถาวรใช่หรือไม่?\nระบบจะดาวน์โหลดไฟล์ Excel สำรองให้ก่อนลบ การกระทำนี้ไม่สามารถย้อนกลับได้`,
    );
    if (!confirmed) return;
    purgeMutation.mutate(purgeYear);
  };

  const changePasswordMutation = useMutation({
    mutationFn: async (payload: ChangePasswordPayload) => {
      const [promise] = await changePasswordApi(payload);
      return promise;
    },
    onSuccess: () => {
      toast.success('เปลี่ยนรหัสผ่านสำเร็จ');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'ไม่สามารถเปลี่ยนรหัสผ่านได้'));
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[12px] font-bold text-brand uppercase tracking-[0.2em] bg-brand/5 px-2.5 py-1 rounded-md">Settings</span>
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">ตั้งค่า</h1>
        <p className="text-gray-400 text-sm font-medium mt-0.5">จัดการความปลอดภัยบัญชีผู้ใช้งานของคุณ</p>
      </div>

      <div className="max-w-md bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="p-2 rounded-lg bg-brand/5 text-brand">
            <KeyRound size={16} />
          </div>
          <h2 className="text-sm font-black text-navy uppercase tracking-wider">เปลี่ยนรหัสผ่าน</h2>
        </div>

        <Formik
          initialValues={{ currentPassword: '', newPassword: '', confirmPassword: '' }}
          validationSchema={changePasswordSchema}
          onSubmit={(values, helpers) => {
            changePasswordMutation.mutate(
              { currentPassword: values.currentPassword, newPassword: values.newPassword },
              { onSuccess: () => helpers.resetForm() },
            );
          }}
        >
          <Form>
            <ExtraCompactInput name="currentPassword" type="password" label="รหัสผ่านปัจจุบัน" icon={Lock} placeholder="••••••••" />
            <ExtraCompactInput name="newPassword" type="password" label="รหัสผ่านใหม่" icon={KeyRound} placeholder="••••••••" />
            <ExtraCompactInput name="confirmPassword" type="password" label="ยืนยันรหัสผ่านใหม่" icon={ShieldCheck} placeholder="••••••••" />

            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="w-full mt-2 py-3.5 bg-brand text-white rounded-xl font-black text-[13px] uppercase tracking-[0.2em] hover:bg-brand-dark transition-all active:scale-[0.98] disabled:opacity-60"
            >
              {changePasswordMutation.isPending ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
            </button>
          </Form>
        </Formik>
      </div>

      {user?.role === 'SUPER_ADMIN' && (
        <div className="max-w-md bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 rounded-lg bg-brand/5 text-brand">
              <CalendarDays size={16} />
            </div>
            <h2 className="text-sm font-black text-navy uppercase tracking-wider">ปีการศึกษาที่เปิดรับสมัคร</h2>
          </div>
          <p className="text-xs text-gray-400 font-bold mb-4">
            ปีนี้จะถูกบันทึกลงในใบสมัครใหม่ทุกใบ และแสดงบนหน้าแรกของเว็บไซต์
          </p>
          <YearPicker
            value={applicationYear}
            onChange={setApplicationYear}
            min={currentYear - 1}
            max={currentYear + 5}
          />
          <button
            type="button"
            disabled={updateSettingMutation.isPending || applicationYear === undefined}
            onClick={() => applicationYear !== undefined && updateSettingMutation.mutate(applicationYear)}
            className="w-full mt-4 py-3.5 bg-brand text-white rounded-xl font-black text-[13px] uppercase tracking-[0.2em] hover:bg-brand-dark transition-all active:scale-[0.98] disabled:opacity-60"
          >
            {updateSettingMutation.isPending ? 'กำลังบันทึก...' : 'บันทึกปีการศึกษา'}
          </button>
        </div>
      )}

      {user?.role === 'SUPER_ADMIN' && (
        <div className="max-w-md bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 rounded-lg bg-red-50 text-red-500">
              <Trash2 size={16} />
            </div>
            <h2 className="text-sm font-black text-navy uppercase tracking-wider">จัดการข้อมูลเก่า</h2>
          </div>
          <p className="text-xs text-gray-400 font-bold mb-4">
            ระบบเก็บข้อมูลผู้สมัคร 3 ปีล่าสุด ปีที่เก่ากว่านั้นสามารถ export เป็น Excel แล้วลบออกจากระบบได้
          </p>
          <YearPicker
            label="ปีการศึกษาที่ต้องการลบ"
            min={currentYear - 30}
            max={currentYear}
            value={purgeYear}
            onChange={setPurgeYear}
          />
          <button
            type="button"
            disabled={purgeMutation.isPending}
            onClick={handlePurge}
            className="w-full mt-4 py-3.5 bg-red-500 text-white rounded-xl font-black text-[13px] uppercase tracking-[0.2em] hover:bg-red-600 transition-all active:scale-[0.98] disabled:opacity-60"
          >
            {purgeMutation.isPending ? 'กำลังดำเนินการ...' : `Export และลบข้อมูลปี ${purgeYear}`}
          </button>
        </div>
      )}
    </div>
  );
};
