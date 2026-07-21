'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import Bars3Icon from '@iconify-react/heroicons/bars-3';
import XMarkIcon from '@iconify-react/heroicons/x-mark';

export const SiteNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
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
          <Link href="/#programs" className="hidden md:inline-flex px-5 py-2.5 text-sm font-semibold text-navy/70 hover:text-brand transition-colors rounded-xl">หลักสูตร</Link>
          <Link href="/status" className="hidden md:inline-flex px-5 py-2.5 text-sm font-semibold text-navy/70 hover:text-brand transition-colors rounded-xl">ตรวจสอบสถานะ</Link>
          <a href="https://lanna.mbu.ac.th/" target="_blank" rel="noopener noreferrer" className="hidden md:inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-navy/70 hover:text-brand transition-colors rounded-xl">
            เว็บมหาวิทยาลัย <ExternalLink size={13} />
          </a>
          <Link href="/admin/login" className="hidden md:inline-flex px-5 py-2.5 text-sm font-semibold text-navy/60 bg-navy/5 hover:bg-navy/10 rounded-xl transition-all">เจ้าหน้าที่</Link>
          <Link href="/apply" className="hidden md:inline-flex px-6 py-2.5 bg-brand text-white text-sm font-bold rounded-xl shadow-brand-sm hover:shadow-brand transition-all hover:-translate-y-0.5">สมัครเรียน</Link>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
            className="md:hidden relative w-11 h-11 flex items-center justify-center rounded-xl text-navy/70 hover:bg-navy/5 transition-colors"
          >
            <Bars3Icon width="24" height="24" className={`absolute transition-all duration-300 ${menuOpen ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'}`} />
            <XMarkIcon width="24" height="24" className={`absolute transition-all duration-300 ${menuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'}`} />
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div className={`md:hidden grid transition-[grid-template-rows] duration-300 ease-out ${menuOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden bg-cream shadow-lg">
          <div className="flex flex-col gap-1 px-6 pb-6 pt-2 border-t border-navy/10">
            <Link href="/#programs" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-sm font-semibold text-navy/70 hover:text-brand hover:bg-navy/5 rounded-xl transition-colors">หลักสูตร</Link>
            <Link href="/status" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-sm font-semibold text-navy/70 hover:text-brand hover:bg-navy/5 rounded-xl transition-colors">ตรวจสอบสถานะ</Link>
            <a href="https://lanna.mbu.ac.th/" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} className="flex items-center gap-1.5 px-4 py-3 text-sm font-semibold text-navy/70 hover:text-brand hover:bg-navy/5 rounded-xl transition-colors">
              เว็บมหาวิทยาลัย <ExternalLink size={13} />
            </a>
            <Link href="/admin/login" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-sm font-semibold text-navy/60 bg-navy/5 hover:bg-navy/10 rounded-xl transition-all">เจ้าหน้าที่</Link>
            <Link href="/apply" onClick={() => setMenuOpen(false)} className="px-4 py-3 mt-1 text-center bg-brand text-white text-sm font-bold rounded-xl shadow-brand-sm">สมัครเรียน</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
