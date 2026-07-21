'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { signInWithCustomToken } from 'firebase/auth';
import { ref, query, orderByKey, limitToLast, startAfter, get, onChildAdded, type Unsubscribe } from 'firebase/database';
import { toast } from 'sonner';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import { getNotificationTokenApi, markNotificationsReadApi } from '@/services/notifications.service';
import { formatThaiDateTime } from '@/lib/date';
import { playNotificationSound } from '@/lib/notification-sound';
import { useAuthContext } from '@/modules/auth/providers/AuthProvider';

export interface ApplicantNotification {
  key: string;
  applicantId: string;
  applicationNumber: string;
  fullName: string;
  submittedAt: string;
}

const MAX_NOTIFICATIONS = 20;

export const useApplicantNotifications = (onView: (applicantId: string) => void) => {
  const { user } = useAuthContext();
  const [notifications, setNotifications] = useState<ApplicantNotification[]>([]);
  const [readAtOverride, setReadAtOverride] = useState<string | null>(null);
  const readAt = readAtOverride ?? user?.notificationsReadAt ?? null;
  const onViewRef = useRef(onView);

  useEffect(() => {
    onViewRef.current = onView;
  });

  useEffect(() => {
    if (!user || !firebaseDb || !firebaseAuth) return;

    let unsubscribe: Unsubscribe | undefined;
    let cancelled = false;

    (async () => {
      const [promise] = await getNotificationTokenApi();
      const res = await promise.catch(() => null);
      const token = res?.success ? res.data.token : null;
      if (!token || cancelled) return;

      await signInWithCustomToken(firebaseAuth!, token);
      if (cancelled) return;

      const notifRef = ref(firebaseDb!, 'notifications');

      // Populate the dropdown from what already happened (no toast for these).
      const initialSnap = await get(query(notifRef, orderByKey(), limitToLast(MAX_NOTIFICATIONS)));
      if (cancelled) return;

      const initial: ApplicantNotification[] = [];
      initialSnap.forEach((child) => {
        initial.push({ key: child.key!, ...child.val() });
      });
      setNotifications(initial);

      // Only genuinely new pushes (after the initial snapshot) trigger a toast.
      const lastKey = initial.length ? initial[initial.length - 1].key : null;
      const liveQuery = lastKey
        ? query(notifRef, orderByKey(), startAfter(lastKey))
        : query(notifRef, orderByKey());

      unsubscribe = onChildAdded(liveQuery, (snap) => {
        const item: ApplicantNotification = { key: snap.key!, ...snap.val() };
        setNotifications((prev) => [...prev, item].slice(-MAX_NOTIFICATIONS));
        playNotificationSound();

        toast(item.fullName, {
          description: `${item.applicationNumber} · ${formatThaiDateTime(item.submittedAt)}`,
          duration: Infinity,
          action: {
            label: 'ดูใบสมัคร',
            onClick: () => onViewRef.current(item.applicantId),
          },
        });
      });
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [user]);

  const unreadCount = notifications.filter(
    (n) => !readAt || new Date(n.submittedAt) > new Date(readAt)
  ).length;

  const markAllRead = useCallback(async () => {
    if (unreadCount > 0) {
      const [promise] = await markNotificationsReadApi();
      const res = await promise.catch(() => null);
      if (res?.success) setReadAtOverride(res.data.notificationsReadAt);
    }
  }, [unreadCount]);

  return {
    notifications: [...notifications].reverse(),
    unreadCount,
    readAt,
    markAllRead,
  };
};
