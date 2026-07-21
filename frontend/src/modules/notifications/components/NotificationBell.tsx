'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Bell, UserPlus, Inbox } from 'lucide-react';
import { formatThaiDateTime } from '@/lib/date';
import { ApplicantDetailModal } from '@/modules/applicants/components/ApplicantDetailModal';
import { useApplicantNotifications } from '../hooks/use-applicant-notifications';

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewingApplicantId, setViewingApplicantId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { notifications, unreadCount, readAt, markAllRead } = useApplicantNotifications(
    (applicantId) => {
      setViewingApplicantId(applicantId);
      setIsOpen(false);
    }
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOpen = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) markAllRead();
      return next;
    });
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={toggleOpen}
        aria-label="การแจ้งเตือน"
        className="relative p-2 text-gray-400 bg-gray-50/80 rounded-lg border border-gray-100 hover:bg-gray-100 transition-all"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-brand text-white text-[10px] font-black rounded-full border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute z-50 right-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-[380px] bg-white border border-gray-100 rounded-2xl shadow-2xl shadow-navy/10 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-black text-navy">การแจ้งเตือน</p>
            {unreadCount > 0 && (
              <span className="text-[11px] font-bold text-brand">{unreadCount} ใหม่</span>
            )}
          </div>

          <div className="max-h-[70vh] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-5 py-8 flex flex-col items-center gap-2 text-navy/30">
                <Inbox size={22} />
                <p className="text-sm font-bold">ยังไม่มีการแจ้งเตือน</p>
              </div>
            ) : (
              notifications.map((n) => {
                const isUnread = !readAt || new Date(n.submittedAt) > new Date(readAt);
                return (
                  <button
                    key={n.key}
                    type="button"
                    onClick={() => {
                      setViewingApplicantId(n.applicantId);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                  >
                    <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${isUnread ? 'bg-brand/10 text-brand' : 'bg-gray-50 text-gray-300'}`}>
                      <UserPlus size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black text-navy truncate">{n.fullName}</p>
                      <p className="text-[12px] text-gray-400 font-bold truncate">{n.applicationNumber}</p>
                      <p className="text-[11px] text-gray-300 font-semibold mt-0.5">{formatThaiDateTime(n.submittedAt)}</p>
                    </div>
                    {isUnread && <span className="shrink-0 w-2 h-2 mt-1.5 bg-brand rounded-full" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      <ApplicantDetailModal applicantId={viewingApplicantId} onClose={() => setViewingApplicantId(null)} />
    </div>
  );
};
