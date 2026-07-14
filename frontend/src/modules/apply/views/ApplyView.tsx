'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Formik, Form, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { useApply } from '../hooks/use-apply';
import { resizeToPhotoSize } from '@/lib/resize-photo';
import { Step1Personal, Step2Education } from '../components/FormSteps';
import { Step0Intro } from '../components/Step0Intro';
import { Step3Program } from '../components/Step3Program';
import { Step4Documents } from '../components/Step4Documents';
import { CheckCircle } from 'lucide-react';

const applicationSchema = Yup.object().shape({
  prefixName: Yup.string().required('กรุณาระบุคำนำหน้าชื่อ'),
  firstName: Yup.string().required('กรุณาระบุชื่อ'),
  lastName: Yup.string().required('กรุณาระบุนามสกุล'),
  nationalId: Yup.string()
    .matches(/^[0-9]{13}$/, 'เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก')
    .required('กรุณาระบุเลขบัตรประชาชน'),
  phone: Yup.string()
    .matches(/^0[0-9]{9}$/, 'เบอร์โทรศัพท์ต้องเริ่มด้วย 0 และมี 10 หลัก')
    .required('กรุณาระบุเบอร์โทรศัพท์'),
  email: Yup.string().email('อีเมลไม่ถูกต้อง').required('กรุณาระบุอีเมล'),
  birthDate: Yup.string().required('กรุณาระบุวันเกิด'),
  address: Yup.string().required('กรุณาระบุที่อยู่'),
  subDistrict: Yup.string().required('กรุณาระบุตำบล'),
  district: Yup.string().required('กรุณาระบุอำเภอ'),
  province: Yup.string().required('กรุณาระบุจังหวัด'),
  postalCode: Yup.string()
    .matches(/^[0-9]{5}$/, 'รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก')
    .required('กรุณาระบุรหัสไปรษณีย์'),
  previousSchool: Yup.string().required('กรุณาระบุสถานศึกษาเดิม'),
  previousEducation: Yup.string().required('กรุณาระบุวุฒิการศึกษา'),
  graduationYear: Yup.string()
    .matches(/^[0-9]{4}$/, 'ปีที่จบต้องเป็นตัวเลข 4 หลัก (พ.ศ.)')
    .required('กรุณาระบุปีที่จบ'),
  gpa: Yup.string().required('กรุณาระบุเกรดเฉลี่ย'),
  programId: Yup.string().required('กรุณาเลือกหลักสูตรที่ต้องการสมัคร'),
  pdpaConsent: Yup.boolean().oneOf([true], 'กรุณายอมรับเงื่อนไขการรับรองข้อมูล'),
  turnstileToken: Yup.string().required('Security validation failed'),
});

const initialValues = {
  prefixName: '',
  firstName: '',
  lastName: '',
  aliasName: '',
  firstNameEn: '',
  lastNameEn: '',
  nationalId: '',
  gender: 'MALE',
  birthDate: '',
  ethnicity: 'ไทย',
  nationality: 'ไทย',
  religion: 'พุทธ',
  bloodType: '',
  phone: '',
  email: '',
  lineId: '',
  address: '',
  subDistrict: '',
  district: '',
  province: '',
  postalCode: '',
  previousSchool: '',
  schoolProvince: '',
  previousEducation: '',
  gpa: '',
  graduationYear: '',
  applicationReason: '',
  programId: '',
  pdpaConsent: false,
  turnstileToken: '',
};

export const ApplyView = () => {
  const router = useRouter();
  const { currentStep, nextStep, prevStep, programsQuery, applyMutation } = useApply();

  // สถานะสำหรับเก็บไฟล์แยกตามประเภท (Transcript รองรับหลายไฟล์)
  const [files, setFiles] = useState<Record<string, File | File[] | null>>({
    PHOTO: null,
    ID_CARD: null,
    TRANSCRIPT: [],
    HOUSE_REGISTRATION: null,
    NAME_CHANGE: null
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    // ตรวจสอบขนาดไฟล์ (ไม่เกิน 4MB)
    const largeFile = selectedFiles.find(f => f.size > 4 * 1024 * 1024);
    if (largeFile) {
      toast.error(`ไฟล์ "${largeFile.name}" มีขนาดใหญ่เกิน 4MB`);
      return;
    }

    if (type === 'TRANSCRIPT') {
      setFiles(prev => {
        const current = (prev[type] as File[]) || [];
        const combined = [...current, ...selectedFiles].slice(0, 3);
        return { ...prev, [type]: combined };
      });
    } else if (type === 'PHOTO') {
      const resized = await resizeToPhotoSize(selectedFiles[0]);
      setFiles(prev => ({ ...prev, [type]: resized }));
    } else {
      setFiles(prev => ({ ...prev, [type]: selectedFiles[0] }));
    }
  };

  const removeFile = (type: string, index?: number) => {
    setFiles(prev => {
      if (type === 'TRANSCRIPT' && typeof index === 'number') {
        const current = (prev[type] as File[]) || [];
        return { ...prev, [type]: current.filter((_, i) => i !== index) };
      }
      return { ...prev, [type]: null };
    });
  };

  const handleSubmit = (values: typeof initialValues, { setSubmitting }: FormikHelpers<typeof initialValues>) => {
    const transcriptFiles = (files.TRANSCRIPT as File[]) || [];
    const requiredFiles = ['PHOTO', 'ID_CARD', 'HOUSE_REGISTRATION'];
    const missingFields = requiredFiles.filter(key => !files[key]);

    if (missingFields.length > 0 || transcriptFiles.length === 0) {
      toast.error('กรุณาอัปโหลดเอกสารที่จำเป็นให้ครบถ้วน');
      setSubmitting(false);
      return;
    }

    const finalValues = {
      ...values,
      hasPhoto: !!files.PHOTO,
      hasIdCard: !!files.ID_CARD,
      hasTranscript: transcriptFiles.length > 0,
      hasHouseRegistration: !!files.HOUSE_REGISTRATION,
      hasNameChange: !!files.NAME_CHANGE,
    };

    // ponytail: applyMutation.isPending already drives the loading UI; reset Formik's own
    // isSubmitting immediately since it never resolves on its own for a fire-and-forget mutate().
    applyMutation.mutate({ values: finalValues, files });
    setSubmitting(false);
  };

  const stepTitles = [
    'ข้อมูลส่วนตัว',
    'ประวัติการศึกษา',
    'เลือกหลักสูตร',
    'อัปโหลดเอกสาร'
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-navy/5 border border-navy/5 overflow-hidden">
        {/* Header - More Compact */}
        <div className="px-8 py-8 sm:px-10 border-b border-gray-50 bg-gray-50/30 text-center">
          <h1 className="text-3xl font-black text-navy mb-1 tracking-tight">ใบสมัครเข้าศึกษาต่อ</h1>
          <p className="text-brand font-bold text-xs uppercase tracking-[0.2em]">มหาวิทยาลัยมหามกุฏราชวิทยาลัย วิทยาเขตล้านนา</p>
        </div>

        <div className="p-6 sm:p-10">
          {/* Progress Stepper - Named Steps (Hide on Step 0) */}
          {currentStep > 0 && (
            <div className="flex items-center justify-between mb-12 relative max-w-2xl mx-auto">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100/50 -z-10 rounded-full"></div>
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex flex-col items-center bg-white px-2">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all duration-500 shadow-xl ${currentStep >= step
                    ? 'bg-brand text-white scale-110 shadow-brand/25'
                    : 'bg-white text-gray-200 border-2 border-gray-50'
                    }`}>
                    {currentStep > step ? <CheckCircle size={20} strokeWidth={3} /> : step}
                  </div>
                  <span className={`text-[12px] font-black mt-3 uppercase tracking-wider text-center max-w-[80px] leading-tight ${currentStep >= step ? 'text-navy' : 'text-gray-300'}`}>
                    {stepTitles[step - 1]}
                  </span>
                </div>
              ))}
            </div>
          )}

          <Formik
            initialValues={initialValues}
            validationSchema={applicationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, setFieldValue, isSubmitting }) => (
              <Form className="space-y-8">
                {currentStep === 0 && <Step0Intro onStart={nextStep} />}
                {currentStep === 1 && <Step1Personal />}
                {currentStep === 2 && <Step2Education />}
                {currentStep === 3 && <Step3Program programs={programsQuery.data?.data || []} selectedProgramId={values.programId} />}
                {currentStep === 4 && <Step4Documents files={files} onFileChange={handleFileChange} removeFile={removeFile} setFieldValue={setFieldValue} />}

                {currentStep > 0 && (
                  <div className="mt-10 pt-8 border-t border-gray-100 flex justify-between">
                    <button
                      type="button"
                      onClick={() => currentStep === 1 ? router.push('/') : prevStep()}
                      disabled={isSubmitting}
                      className="px-8 py-4 text-sm font-bold text-navy bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-300 flex items-center gap-2"
                    >
                      {currentStep === 1 ? 'ยกเลิก' : 'ย้อนกลับ'}
                    </button>
                    {currentStep < 4 ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="px-10 py-4 text-sm font-bold text-white bg-navy rounded-2xl hover:bg-navy/90 hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-navy/20 transition-all duration-300"
                      >
                        ถัดไป
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting || applyMutation.isPending}
                        className="px-12 py-4 text-sm font-bold text-navy bg-brand rounded-2xl hover:bg-brand/90 hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-brand/30 transition-all duration-300 disabled:opacity-50"
                      >
                        {applyMutation.isPending ? 'กำลังส่งข้อมูล...' : 'ส่งใบสมัครเรียน'}
                      </button>
                    )}
                  </div>
                )}
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};
