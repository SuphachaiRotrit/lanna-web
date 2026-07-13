'use client';

import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Image from 'next/image';
import { Lock, Mail, ChevronRight, ShieldCheck, GraduationCap } from 'lucide-react';
import Turnstile from '@/components/Turnstile';
import { ExtraCompactInput } from '../components/ExtraCompactInput';
import { useAuth } from '../hooks/use-auth';
import { LoginCredentials } from '@/services/auth.service';

// Validation Schema
const loginSchema = Yup.object().shape({
  email: Yup.string().email('รูปแบบอีเมลไม่ถูกต้อง').required('กรุณาระบุอีเมล'),
  password: Yup.string().required('กรุณาระบุรหัสผ่าน'),
  turnstileToken: Yup.string().required('กรุณายืนยันตัวตน'),
});

export const LoginView = () => {
  const { loginMutation } = useAuth();
  const isSubmitting = loginMutation.isPending;

  const handleLogin = (values: LoginCredentials) => {
    loginMutation.mutate(values);
  };

  return (
    <div className="h-screen w-full bg-white flex overflow-hidden font-sans">
      {/* Side Branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-navy relative flex-col justify-center px-16">
        <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #FF613E 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-2 shadow-2xl">
              <Image src="/img/logo.png" alt="MBU Logo" width={24} height={24} />
            </div>
            <div>
              <h1 className="text-white text-lg font-black tracking-tighter leading-none uppercase">MBU<span className="text-brand">LANNA</span></h1>
              <span className="text-[8px] text-white/40 font-bold uppercase tracking-[0.3em]">เจ้าหน้าที่รับสมัครสารสนเทศ</span>
            </div>
          </div>

          <h2 className="text-white text-4xl font-black leading-tight mb-6 tracking-tighter">
            ระบบจัดการ <br />
            <span className="text-brand">ข้อมูลผู้สมัคร</span> เรียน
          </h2>

          <div className="space-y-4 max-w-sm">
            <div className="flex items-center gap-3">
               <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-brand">
                  <GraduationCap size={16} />
               </div>
               <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest leading-none">Admission Control Authority</p>
            </div>
            <div className="flex items-center gap-3">
               <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-blue-400">
                  <ShieldCheck size={16} />
               </div>
               <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest leading-none">ความปลอดภัยข้อมูลผู้สมัคร</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-16 text-[8px] font-bold text-white/5 uppercase tracking-[0.4em]">
          University Student Admission System
        </div>
      </div>

      {/* Login Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gray-50/20 overflow-hidden">
        <div className="w-full max-w-[320px]">
          <div className="mb-6">
             <h3 className="text-2xl font-black text-navy mb-1 tracking-tight">เข้าสู่ระบบ</h3>
             <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">ระบบจัดการการรับสมัครนักศึกษา</p>
          </div>

          <Formik
            initialValues={{ email: '', password: '', turnstileToken: '' }}
            validationSchema={loginSchema}
            onSubmit={handleLogin}
          >
            {({ setFieldValue, values }) => (
              <Form>
                <ExtraCompactInput name="email" type="email" label="อีเมลผู้ใช้งาน" icon={Mail} placeholder="name@mbu-lanna.ac.th" />
                <ExtraCompactInput name="password" type="password" label="รหัสผ่าน" icon={Lock} placeholder="••••••••" />

                <div className="my-4">
                   <div className="rounded-xl border border-gray-100 bg-white p-1.5 flex justify-center overflow-hidden min-h-[70px] shadow-sm">
                      <Turnstile
                        onVerify={(token) => setFieldValue('turnstileToken', token)}
                        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                      />
                   </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !values.turnstileToken}
                  className="w-full py-4 bg-brand text-white rounded-xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-brand-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand/20 active:scale-[0.98]"
                >
                  {isSubmitting ? 'กำลังตรวจสอบ...' : 'ลงชื่อเข้าใช้งาน'}
                  <ChevronRight size={14} strokeWidth={3} />
                </button>
              </Form>
            )}
          </Formik>

          <footer className="mt-8 pt-6 border-t border-gray-100 text-center">
             <div className="flex items-center justify-between text-[9px] font-bold text-gray-300 uppercase tracking-widest mb-4">
                <div className="flex items-center gap-1.5">
                   <ShieldCheck size={12} className="text-brand/30" />
                   <span>เฉพาะเจ้าหน้าที่แอดมิน</span>
                </div>
                <span>ปลอดภัย</span>
             </div>
             
             <p className="text-[8px] text-gray-200 font-medium leading-relaxed px-4">
                ระบบจัดการผู้สมัครเรียน มมร. วิทยาเขตล้านนา <br />
                สงวนสิทธิ์การเข้าถึงเฉพาะบุคคลที่ได้รับอนุญาต
             </p>
          </footer>
        </div>
      </div>
    </div>
  );
};
