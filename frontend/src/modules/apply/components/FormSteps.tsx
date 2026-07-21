import React, { useEffect } from 'react';
import { useFormikContext } from 'formik';
import { PremiumInput, PremiumSelect, ThaiDatePicker } from '../../../components/ui/FormControls';
import { Smartphone, Mail, Hash, MapPin, GraduationCap, Info, User, LucideIcon } from 'lucide-react';
import { getProvinceOptions, getDistrictOptions, getSubDistrictOptions, getPostalCode } from '@/lib/thai-address';

// ฟังก์ชันช่วยจัดการอินพุตพิเศษ
const useFormHelpers = () => {
  const { setFieldValue } = useFormikContext<Record<string, unknown>>();

  const handleDisplayChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string, filter: 'number' | 'gpa', maxLength?: number) => {
    let value = e.target.value;

    if (filter === 'number') {
      value = value.replace(/\D/g, '');
    } else if (filter === 'gpa') {
      value = value.replace(/[^0-9.]/g, '');
      const parts = value.split('.');
      if (parts.length > 2) value = parts[0] + '.' + parts.slice(1).join('');
      if (parts[1] && parts[1].length > 2) value = parts[0] + '.' + parts[1].substring(0, 2);
      if (parseFloat(value) > 4) value = "4.00";
    }

    if (maxLength && value.length > maxLength) value = value.substring(0, maxLength);
    setFieldValue(fieldName, value);
  };

  return { handleDisplayChange };
};

const SectionHeader = ({ icon: Icon, title, desc }: { icon: LucideIcon, title: string, desc?: string }) => (
  <div className="mb-6 pt-2 text-navy">
    <div className="flex items-center gap-3 mb-1">
      <div className="w-8 h-8 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
        <Icon size={18} />
      </div>
      <h3 className="text-sm font-black text-navy uppercase tracking-widest">{title}</h3>
    </div>
    {desc && <p className="text-[12px] font-bold text-navy/30 ml-11">{desc}</p>}
  </div>
);

export const Step1Personal = () => {
  const { handleDisplayChange } = useFormHelpers();
  const { values, setFieldValue } = useFormikContext<Record<string, string>>();
  const province = values.province;
  const district = values.district;
  const subDistrict = values.subDistrict;

  // เคลียร์อำเภอเมื่อจังหวัดเปลี่ยนจนอำเภอเดิมไม่อยู่ในลิสต์แล้ว
  useEffect(() => {
    if (district && !getDistrictOptions(province).some((d) => d.value === district)) {
      setFieldValue('district', '');
    }
  }, [province]); // eslint-disable-line react-hooks/exhaustive-deps

  // เคลียร์ตำบลเมื่ออำเภอเปลี่ยนจนตำบลเดิมไม่อยู่ในลิสต์แล้ว
  useEffect(() => {
    if (subDistrict && !getSubDistrictOptions(province, district).some((s) => s.value === subDistrict)) {
      setFieldValue('subDistrict', '');
    }
  }, [province, district]); // eslint-disable-line react-hooks/exhaustive-deps

  // เติมรหัสไปรษณีย์อัตโนมัติเมื่อเลือกตำบลครบ
  useEffect(() => {
    setFieldValue('postalCode', subDistrict ? (getPostalCode(province, district, subDistrict) ?? '') : '');
  }, [province, district, subDistrict]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 1. ข้อมูลพื้นฐาน */}
      <section>
        <SectionHeader icon={User} title="ข้อมูลพื้นฐาน" desc="ระบุชื่อและข้อมูลระบุตัวตนของคุณ" />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-7">
          <div className="md:col-span-3">
            <PremiumSelect
              label="คำนำหน้า"
              name="prefixName"
              required
              placeholder="เลือกคำนำหน้า"
              options={[
                { label: 'นาย', value: 'นาย' },
                { label: 'นาง', value: 'นาง' },
                { label: 'นางสาว', value: 'นางสาว' },
                { label: 'สามเณร', value: 'สามเณร' },
                { label: 'พระ', value: 'พระ' },
              ]}
            />
          </div>
          <div className="md:col-span-4">
            <PremiumInput label="ชื่อจริง" name="firstName" required placeholder="กรอกชื่อจริง" />
          </div>
          <div className="md:col-span-5">
            <PremiumInput label="นามสกุล" name="lastName" required placeholder="กรอกนามสกุล" />
          </div>
          <div className="md:col-span-6">
            <PremiumInput
              label="เลขบัตรประชาชน"
              name="nationalId"
              required
              maxLength={13}
              placeholder="ระบุเลข 13 หลักไม่ต้องมีขีด"
              prefixIcon={<Hash size={18} />}
              onChange={(e) => handleDisplayChange(e, 'nationalId', 'number', 13)}
            />
          </div>
          <div className="md:col-span-6">
            <PremiumInput label="ฉายา (ถ้ามี)" name="aliasName" placeholder="กรอกฉายา" />
          </div>
        </div>
      </section>

      {/* 2. การติดต่อ */}
      <section>
        <SectionHeader icon={Smartphone} title="ข้อมูลการติดต่อ" desc="เบอร์โทรศัพท์และช่องทางติดต่อทางออนไลน์" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-7">
          <PremiumInput
            label="เบอร์โทรศัพท์"
            name="phone"
            required
            maxLength={10}
            placeholder="ระบุเบอร์โทรที่ติดต่อได้"
            prefixIcon={<Smartphone size={18} />}
            onChange={(e) => handleDisplayChange(e, 'phone', 'number', 10)}
          />
          <PremiumInput label="อีเมล" name="email" required type="email" placeholder="example@email.com" prefixIcon={<Mail size={18} />} />
          <PremiumInput label="Line ID" name="lineId" placeholder="ระบุไอดีไลน์เพื่อให้เจ้าหน้าที่ติดต่อ" />
        </div>
      </section>

      {/* 3. รายละเอียดส่วนตัว */}
      <section>
        <SectionHeader icon={Info} title="รายละเอียดส่วนตัว" desc="ระบุเพศและศาสนาเพื่อข้อมูลทางสถิติ" />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-x-6 gap-y-7">
          <PremiumSelect
            label="เพศ"
            name="gender"
            required
            placeholder="ระบุเพศ"
            options={[
              { label: 'ชาย', value: 'MALE' },
              { label: 'หญิง', value: 'FEMALE' },
            ]}
          />
          <div className="col-span-1 md:col-span-2">
            <ThaiDatePicker label="วันเดือนปีเกิด" name="birthDate" required />
          </div>
          <PremiumInput label="ศาสนา" name="religion" required placeholder="เช่น พุทธ" />
          <PremiumInput label="สัญชาติ" name="nationality" required placeholder="เช่น ไทย" />
        </div>
      </section>

      {/* 4. ข้อมูลที่อยู่ */}
      <section className="bg-gray-50/30 py-10 rounded-[3rem] border border-gray-100/50">
        <SectionHeader icon={MapPin} title="ข้อมูลที่อยู่ปัจจุบัน" desc="ใช้สำหรับจัดส่งเอกสารและข้อมูลการศึกษา" />
        <div className="space-y-7">
          <PremiumInput label="ที่อยู่ปัจจุบัน" name="address" required placeholder="บ้านเลขที่, หมู่ที่, ซอย, ถนน..." />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-7">
            <PremiumSelect label="จังหวัด" name="province" required placeholder="เลือกจังหวัด" options={getProvinceOptions()} />
            <PremiumSelect
              label="อำเภอ / เขต"
              name="district"
              required
              placeholder={province ? 'เลือกอำเภอ' : 'เลือกจังหวัดก่อน'}
              options={getDistrictOptions(province)}
            />
            <PremiumSelect
              label="ตำบล / แขวง"
              name="subDistrict"
              required
              placeholder={district ? 'เลือกตำบล' : 'เลือกอำเภอก่อน'}
              options={getSubDistrictOptions(province, district)}
            />
            <PremiumInput
              label="รหัสไปรษณีย์"
              name="postalCode"
              required
              readOnly
              placeholder="เลือกตำบล"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export const Step2Education = () => {
  const { handleDisplayChange } = useFormHelpers();

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section>
        <SectionHeader icon={GraduationCap} title="ประวัติการศึกษา" desc="ข้อมูลวุฒิการศึกษาเดิมที่จบการศึกษามา" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7 mb-7">
          <PremiumInput
            label="ชื่อสถานศึกษาเดิม"
            name="previousSchool"
            required
            placeholder="โรงเรียนที่จบการศึกษาสูงสุด"
            prefixIcon={<GraduationCap size={18} />}
          />
          <PremiumSelect
            label="วุฒิการศึกษาที่จบ"
            name="previousEducation"
            required
            placeholder="เลือกวุฒิการศึกษา"
            options={[
              { label: 'มัธยมศึกษาตอนปลาย (ม.6)', value: 'ม.6' },
              { label: 'ประกาศนียบัตรวิชาชีพ (ปวช.)', value: 'ปวช.' },
              { label: 'ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)', value: 'ปวส.' },
              { label: 'เทียบเท่า (กศน.)', value: 'กศน.' },
              { label: 'อื่นๆ', value: 'อื่นๆ' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-7">
          <PremiumInput label="จังหวัดของสถานศึกษา" name="schoolProvince" required placeholder="ระบุจังหวัด" />
          <PremiumInput
            label="ปีที่จบการศึกษา (พ.ศ.)"
            name="graduationYear"
            required
            placeholder="ระบุปี พ.ศ. เช่น 2566"
            onChange={(e) => handleDisplayChange(e, 'graduationYear', 'number', 4)}
          />
          <PremiumInput
            label="เกรดเฉลี่ยสะสม (GPAX)"
            name="gpa"
            required
            placeholder="เช่น 3.50"
            onChange={(e) => handleDisplayChange(e, 'gpa', 'gpa', 4)}
          />
        </div>
      </section>

      <section className="rounded-[3rem] shadow-brand/5">
        <label className="block text-xs font-black text-navy/60 uppercase ml-1 mb-4 flex items-center gap-2">
          <Info size={14} className="text-brand" />
          เหตุผลที่สนใจสมัครเรียนที่ มหาวิทยาลัยมหามกุฏราชวิทยาลัย วิทยาเขตล้านนา
        </label>
        <textarea
          name="applicationReason"
          rows={5}
          className="w-full bg-gray-100 border-2 border-transparent rounded-[2rem] px-8 py-6 text-sm font-bold text-navy transition-all duration-300 outline-none focus:border-brand/30 focus:bg-white focus:shadow-2xl focus:shadow-brand/10 hover:bg-gray-200 shadow-sm placeholder:text-navy/20"
          placeholder="อธิบายเหตุผลหรือแรงผลักดันที่ทำให้คุณสนใจศึกษาต่อในระดับอุดมศึกษากับเรา..."
        />
      </section>
    </div>
  );
};
