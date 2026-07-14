import addressData from '@/data/thai-address.json';

interface Option {
  label: string;
  value: string;
}

export const getProvinceOptions = (): Option[] =>
  addressData.map((p) => ({ label: p.name, value: p.name }));

export const getDistrictOptions = (province: string): Option[] =>
  (addressData.find((p) => p.name === province)?.districts ?? []).map((d) => ({ label: d.name, value: d.name }));

export const getSubDistrictOptions = (province: string, district: string): Option[] =>
  (addressData.find((p) => p.name === province)?.districts.find((d) => d.name === district)?.subDistricts ?? [])
    .map((s) => ({ label: s.name, value: s.name }));

export const getPostalCode = (province: string, district: string, subDistrict: string): string | undefined =>
  addressData
    .find((p) => p.name === province)?.districts
    .find((d) => d.name === district)?.subDistricts
    .find((s) => s.name === subDistrict)?.zipCode;
