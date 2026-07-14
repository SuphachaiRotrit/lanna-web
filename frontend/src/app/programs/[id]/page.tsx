'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useHomePrograms } from '@/modules/home/hooks/use-home';
import { ProgramDetailContent } from '@/modules/home/components/ProgramDetailContent';

export default function ProgramDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: res, isLoading } = useHomePrograms();
  const program = res?.data.find((p) => p.id === id);

  return (
    <div className="min-h-screen bg-cream py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/#programs" className="inline-flex items-center gap-2 text-sm font-bold text-navy/50 hover:text-brand transition-colors mb-6">
          <ArrowLeft size={16} /> กลับหน้าแรก
        </Link>

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-navy/5 p-8 sm:p-10">
          {isLoading && (
            <div className="flex flex-col items-center gap-3 py-16 text-navy/30">
              <Loader2 size={28} className="animate-spin" />
              <p className="text-sm font-bold">กำลังโหลดข้อมูลสาขาวิชา...</p>
            </div>
          )}
          {!isLoading && !program && (
            <p className="text-center py-16 text-navy/40 font-bold">ไม่พบสาขาวิชานี้</p>
          )}
          {!isLoading && program && <ProgramDetailContent program={program} />}
        </div>
      </div>
    </div>
  );
}
