import React from 'react';
import { Field, ErrorMessage } from 'formik';
import { Upload, AlertCircle, CheckCircle, FileCheck, X } from 'lucide-react';
import Turnstile from '@/components/Turnstile';

interface Step4Props {
  files: Record<string, File | File[] | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>, type: string) => void;
  removeFile: (type: string, index?: number) => void;
  setFieldValue: (field: string, value: string) => void;
}

export const Step4Documents: React.FC<Step4Props> = ({ files, onFileChange, removeFile, setFieldValue }) => {
  const documents = [
    { key: 'PHOTO', label: 'รูปถ่ายหน้าตรง 1 นิ้ว (1 รูป)', accept: 'image/*', required: true, multiple: false },
    { key: 'TRANSCRIPT', label: 'สำเนาวุฒิการศึกษา/Transcript (3 ฉบับ)', accept: 'image/*,application/pdf', required: true, multiple: true },
    { key: 'ID_CARD', label: 'สำเนาบัตรประชาชน / ใบสุทธิ (1 ฉบับ)', accept: 'image/*,application/pdf', required: true, multiple: false },
    { key: 'HOUSE_REGISTRATION', label: 'สำเนาทะเบียนบ้าน (1 ฉบับ)', accept: 'image/*,application/pdf', required: true, multiple: false },
    { key: 'NAME_CHANGE', label: 'สำเนาการเปลี่ยนชื่อ-นามสกุล (ถ้ามี)', accept: 'image/*,application/pdf', required: false, multiple: false },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-amber-50 border border-amber-200/60 p-5 rounded-2xl flex gap-4 items-start">
        <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
        <p className="text-sm text-amber-800 leading-relaxed font-medium">
          กรุณาอัปโหลดเอกสารให้ครบถ้วน (JPG, PNG หรือ PDF) ไฟล์ต้องไม่เกิน <strong>5 MB</strong>
          <br /><span className="text-xs opacity-75">* สำหรับ Transcript สามารถอัปโหลดได้สูงสุด ๓ ไฟล์</span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {documents.map(doc => {
          const isMultiple = doc.multiple;
          const currentFiles = isMultiple ? (files[doc.key] as File[]) : (files[doc.key] ? [files[doc.key] as File] : []);
          const hasFiles = currentFiles.length > 0;

          return (
            <div key={doc.key} className={doc.key === 'TRANSCRIPT' ? 'sm:col-span-2' : ''}>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-navy/70 uppercase tracking-tight">
                  {doc.label} {doc.required && <span className="text-red-500">*</span>}
                </label>
                {hasFiles && (
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-100">
                    <FileCheck size={12} />
                    {currentFiles.length} File(s)
                  </span>
                )}
              </div>

              {/* รายการไฟล์ที่อัปโหลดแล้ว */}
              {hasFiles && (
                <div className="mb-3 space-y-2">
                  {currentFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white border border-gray-100 p-2.5 rounded-xl shadow-sm">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-brand/5 flex items-center justify-center shrink-0">
                          <Upload size={14} className="text-brand" />
                        </div>
                        <span className="text-xs font-bold text-navy/60 truncate">{file.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(doc.key, isMultiple ? idx : undefined)}
                        className="p-1.5 hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors rounded-lg"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* ช่องอัปโหลด (ซ่อนถ้าไม่ใช่ Multiple และมีไฟล์แล้ว) */}
              {(!hasFiles || isMultiple) && currentFiles.length < 3 && (
                <div className={`relative h-32 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center p-4 transition-all cursor-pointer hover:border-brand/40 hover:bg-brand/5 border-gray-200 bg-gray-50/30`}>
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept={doc.accept}
                    multiple={doc.multiple}
                    onChange={(e) => onFileChange(e, doc.key)}
                  />
                  <Upload className="text-gray-300 group-hover:text-brand" size={24} />
                  <p className="mt-2 text-[11px] font-bold text-gray-400">
                    คลิกเพื่อเพิ่มไฟล์ {doc.multiple && `(สูงสุด ๓)`}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-8 bg-brand/5 rounded-3xl border-2 border-brand/10 space-y-4">
        <h3 className="text-sm font-bold text-navy flex items-center gap-2">
          <CheckCircle size={18} className="text-brand" />
          การรับรองข้อมูลและความถูกต้อง
        </h3>
        <label className="flex items-start gap-4 cursor-pointer group">
          <Field type="checkbox" name="pdpaConsent" className="mt-1 w-5 h-5 accent-brand shrink-0 rounded-lg" />
          <span className="text-sm text-navy/60 leading-relaxed group-hover:text-navy transition-colors italic font-medium">
            &ldquo;ข้าพเจ้าขอรับรองว่า ข้อความที่แสดงไว้และเอกสารที่อัปโหลดเป็นความจริงทุกประการ หากข้าพเจ้าได้เป็นนักศึกษาของมหาวิทยาลัยฯ ข้าพเจ้ายินดีปฏิบัติตามกฎระเบียบข้อบังคับของมหาวิทยาลัยทุกประการ&rdquo;
          </span>
        </label>
        <ErrorMessage name="pdpaConsent" component="div" className="text-red-500 text-xs mt-2 ml-9 font-bold" />
      </div>

      <Turnstile
        onVerify={(token) => setFieldValue('turnstileToken', token)}
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
      />
    </div>
  );
};
