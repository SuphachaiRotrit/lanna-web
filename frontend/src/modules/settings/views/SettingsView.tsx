'use client';

import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { KeyRound, Lock, ShieldCheck } from 'lucide-react';
import { ExtraCompactInput } from '@/modules/auth/components/ExtraCompactInput';
import { changePasswordApi, ChangePasswordPayload } from '@/services/auth.service';
import { getErrorMessage } from '@/lib/call-api';

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
          <span className="text-[10px] font-bold text-brand uppercase tracking-[0.2em] bg-brand/5 px-2.5 py-1 rounded-md">Settings</span>
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
              className="w-full mt-2 py-3.5 bg-brand text-white rounded-xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-brand-dark transition-all active:scale-[0.98] disabled:opacity-60"
            >
              {changePasswordMutation.isPending ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
            </button>
          </Form>
        </Formik>
      </div>
    </div>
  );
};
