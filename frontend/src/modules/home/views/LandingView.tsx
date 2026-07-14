'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FileText, ArrowRight, Award, BookOpen, ChevronRight, MapPin, Phone, Loader2
} from 'lucide-react';
import { useState } from 'react';
import { useHomePrograms } from '../hooks/use-home';
import { ProgramDetailModal } from '../components/ProgramDetailModal';
import { Program } from '@/types';

const MAP_EMBED_SRC = 'https://www.google.com/maps?cid=11392335271996416831&output=embed';

export const LandingView = () => {
  const { data: res, isLoading } = useHomePrograms();
  const programs = res?.data || [];
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  return (
    <div className="min-h-screen bg-cream">
      {/* NAVIGATION */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4 group">
            <Image src="/img/logo.png" alt="ตราสัญลักษณ์ มมร" width={48} height={48} className="drop-shadow-md group-hover:scale-105 transition-transform" />
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-navy leading-tight tracking-tight">มหาวิทยาลัยมหามกุฏราชวิทยาลัย</h1>
              <p className="text-[13px] font-semibold text-brand tracking-widest uppercase">Lanna Campus • วิทยาเขตล้านนา</p>
            </div>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="#programs" className="hidden md:inline-flex px-5 py-2.5 text-sm font-semibold text-navy/70 hover:text-brand transition-colors rounded-xl">หลักสูตร</Link>
            <Link href="/admin/login" className="px-5 py-2.5 text-sm font-semibold text-navy/60 bg-navy/5 hover:bg-navy/10 rounded-xl transition-all">เจ้าหน้าที่</Link>
            <Link href="/apply" className="px-6 py-2.5 bg-brand text-white text-sm font-bold rounded-xl shadow-brand-sm hover:shadow-brand transition-all hover:-translate-y-0.5">สมัครเรียน</Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-28 pb-20 lg:pt-28 lg:pb-32 overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-brand/10 text-brand text-sm font-bold mb-10 border border-brand/20">
              <Award size={16} />
              <span>เปิดรับสมัครนักศึกษาใหม่ ปีการศึกษา 2570</span>
            </div>
            <h2 className="text-4xl sm:text-7xl lg:text-[4rem] font-black text-navy leading-[1.05] tracking-tight mb-8">
              <span>สมัครเรียน </span>
              <span className="text-brand">ออนไลน์</span><br />
              <span className="text-navy/30 text-2xl sm:text-3xl font-bold">ปีการศึกษา 2570</span>
            </h2>
            <p className="text-navy/50 text-lg sm:text-xl leading-relaxed mb-12 max-w-2xl">
              มหาวิทยาลัยมหามกุฏราชวิทยาลัย วิทยาเขตล้านนา เปิดรับสมัครนักศึกษาระดับปริญญาตรี ผ่านระบบรับสมัครออนไลน์
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
              <Link href="/apply" className="group w-full sm:w-auto px-12 py-5 bg-brand text-white rounded-2xl font-bold text-xl shadow-brand hover:shadow-brand transition-all duration-300 flex items-center justify-center gap-3">
                <FileText size={24} /> สมัครเรียนออนไลน์ <ArrowRight className="group-hover:translate-x-2 transition-transform" size={22} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="border-y border-navy/5 bg-white/50">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-wrap justify-center gap-x-16 gap-y-10 items-center text-center">
            <div className="flex flex-col items-center">
              <p className="text-4xl font-black text-navy">6+</p>
              <p className="text-xs font-bold text-navy/40 uppercase tracking-widest mt-1">สาขาวิชา</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-4xl font-black text-navy">1,000+</p>
              <p className="text-xs font-bold text-navy/40 uppercase tracking-widest mt-1">บัณฑิตที่ผลิตแล้ว</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-4xl font-black text-navy">A+</p>
              <p className="text-xs font-bold text-navy/40 uppercase tracking-widest mt-1">มาตรฐานสากล</p>
            </div>
        </div>
      </section>

      {/* PROGRAMS SECTION */}
      <section id="programs" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-bold text-brand uppercase tracking-widest mb-3">Programs Available</p>
            <h3 className="text-3xl lg:text-5xl font-black text-navy tracking-tight">หลักสูตรที่เปิดรับสมัคร</h3>
          </div>
          {isLoading && (
            <div className="flex flex-col items-center gap-3 py-16 text-navy/30">
              <Loader2 size={28} className="animate-spin" />
              <p className="text-sm font-bold">กำลังโหลดหลักสูตร...</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {!isLoading && programs.map((prog: Program, idx: number) => (
              <div
                key={idx}
                onClick={() => setSelectedProgram(prog)}
                className="group relative bg-white p-10 rounded-[2.5rem] border border-navy/5 hover-lift cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-brand scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                <div className="w-16 h-16 rounded-2xl bg-brand/8 flex items-center justify-center mb-8"><BookOpen size={28} className="text-brand" /></div>
                <div className="flex items-center gap-2 mb-2">
                   <h4 className="text-xl font-bold text-navy leading-snug group-hover:text-brand">{prog.name}</h4>
                   {prog.duration && (
                     <span className="text-[12px] font-black text-brand bg-brand/5 px-2 py-0.5 rounded">
                       {prog.duration} ปี
                     </span>
                   )}
                </div>
                <p className="text-sm text-navy/40 font-bold uppercase tracking-wider">{prog.faculty?.name}</p>
                {prog.description && (
                  <p className="text-[12px] text-brand font-bold mt-2 uppercase tracking-widest bg-brand/5 inline-block px-3 py-1 rounded-lg">
                    {prog.description}
                  </p>
                )}
                <div className="mt-8 pt-6 border-t border-navy/5 flex items-center justify-between">
                  <span className="text-xs font-bold text-brand bg-brand/8 px-4 py-1.5 rounded-full uppercase tracking-widest">{prog.degree}</span>
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-all"><ChevronRight size={18} /></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MAP SECTION */}
      <section className="pb-24 lg:pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-bold text-brand uppercase tracking-widest mb-3">Visit Us</p>
            <h3 className="text-3xl lg:text-5xl font-black text-navy tracking-tight">แผนที่มหาวิทยาลัย</h3>
          </div>
          <div className="rounded-[2.5rem] overflow-hidden border border-navy/5 shadow-lg">
            <iframe
              src={MAP_EMBED_SRC}
              width="100%"
              height="450"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="แผนที่มหาวิทยาลัยมหามกุฏราชวิทยาลัย วิทยาเขตล้านนา"
            />
          </div>
        </div>
      </section>

      <ProgramDetailModal program={selectedProgram} onClose={() => setSelectedProgram(null)} />

      {/* FOOTER */}
      <footer className="bg-brand text-white border-t border-white/5 py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="space-y-8">
              <div className="flex items-center gap-5">
                <Image src="/img/logo.png" alt="MBU Logo" width={56} height={56} className="brightness-0 invert opacity-70" />
                <div>
                  <p className="font-black text-white text-base leading-none">มหาวิทยาลัยมหามกุฏราชวิทยาลัย</p>
                  <p className="text-[12px] text-white/60 font-bold uppercase tracking-[0.2em] mt-1.5">วิทยาเขตล้านนา • เชียงใหม่</p>
                </div>
              </div>
            </div>
            <div className="space-y-5">
              <h4 className="font-black text-white text-xs uppercase tracking-[0.2em] opacity-60">เมนูหลัก</h4>
              <ul className="space-y-4">
                <li><Link href="/apply" className="text-sm font-bold flex items-center gap-3 hover:translate-x-2 transition-transform">สมัครเรียนออนไลน์</Link></li>
                <li><Link href="#programs" className="text-sm font-bold flex items-center gap-3 hover:translate-x-2 transition-transform">หลักสูตรที่เปิดรับ</Link></li>
                <li><Link href="/admin/login" className="text-sm font-bold flex items-center gap-3 hover:translate-x-2 transition-transform">ทางเข้าเจ้าหน้าที่</Link></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="font-black text-white text-xs uppercase tracking-[0.2em] opacity-60">ติดต่อเรา</h4>
              <p className="text-sm flex items-start gap-4"><MapPin size={20} className="shrink-0" /> 73 ถนนเลียบคลองชลประทาน จ.เชียงใหม่</p>
              <p className="text-sm flex items-center gap-4"><Phone size={20} className="shrink-0" /> 053-270-975</p>
            </div>
          </div>
          <div className="mt-20 pt-10 border-t border-white/5 text-center text-xs opacity-50 uppercase tracking-widest font-bold">
            © 2568 Mahamakut Buddhist University Lanna Campus
          </div>
        </div>
      </footer>
    </div>
  );
};
