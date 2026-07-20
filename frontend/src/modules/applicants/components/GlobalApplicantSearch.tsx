'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2 } from 'lucide-react';
import { listApplicantsApi } from '@/services/applicant.service';
import { STATUS_LABELS, STATUS_STYLES } from '@/constants/applicant-status';
import { ApplicantDetailModal } from './ApplicantDetailModal';

export const GlobalApplicantSearch = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [viewingApplicantId, setViewingApplicantId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { data: res, isFetching } = useQuery({
    queryKey: ['applicant-search', debouncedQuery],
    queryFn: async () => {
      const [promise] = await listApplicantsApi({ search: debouncedQuery, limit: 8, page: 1 });
      return promise;
    },
    enabled: debouncedQuery.length > 0,
  });

  const results = res?.data?.rows || [];

  return (
    <div className="relative hidden lg:block" ref={containerRef}>
      <div className="flex items-center bg-gray-50/80 rounded-lg px-3 py-2 w-64 border border-gray-100 hover:border-gray-200 transition-all group focus-within:border-brand/30 focus-within:bg-white focus-within:shadow-sm">
        {isFetching ? (
          <Loader2 className="text-brand animate-spin" size={15} />
        ) : (
          <Search className="text-gray-300 group-focus-within:text-brand" size={15} />
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="ค้นหาชื่อ หรือเลข ปชช..."
          className="bg-transparent border-none outline-none px-2 text-sm w-full placeholder:text-gray-300 font-medium"
        />
        <kbd className="hidden xl:inline-flex text-[12px] font-bold text-gray-300 bg-gray-100 px-1.5 py-0.5 rounded">⌘K</kbd>
      </div>

      {isOpen && debouncedQuery.length > 0 && (
        <div className="absolute z-50 right-0 w-80 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl shadow-navy/10 py-2 animate-in fade-in zoom-in-95 duration-200 max-h-96 overflow-y-auto">
          {results.length === 0 && !isFetching && (
            <p className="px-5 py-4 text-sm font-bold text-navy/30">ไม่พบผู้สมัคร</p>
          )}
          {results.map((app) => (
            <button
              key={app.id}
              type="button"
              onClick={() => {
                setViewingApplicantId(app.id);
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="min-w-0">
                <p className="text-sm font-black text-navy truncate">{app.prefixName}{app.firstName} {app.lastName}</p>
                <p className="text-[12px] text-gray-400 font-bold truncate">{app.applicationNumber} · {app.program?.name}</p>
              </div>
              <span className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-black uppercase ${STATUS_STYLES[app.status]}`}>
                {STATUS_LABELS[app.status]}
              </span>
            </button>
          ))}
        </div>
      )}

      <ApplicantDetailModal applicantId={viewingApplicantId} onClose={() => setViewingApplicantId(null)} />
    </div>
  );
};
