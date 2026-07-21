'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Settings,
  BookOpen,
  Building2,
  Shield,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  CircleUser,
  UserCog,
  Images
} from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks/use-auth';
import { GlobalApplicantSearch } from '@/modules/applicants/components/GlobalApplicantSearch';
import { NotificationBell } from '@/modules/notifications/components/NotificationBell';

const menuItems = [
  { title: 'ภาพรวม', icon: LayoutDashboard, href: '/admin/dashboard', badge: null, superAdminOnly: false },
  { title: 'จัดการผู้สมัคร', icon: Users, href: '/admin/applicants', badge: 'hot', superAdminOnly: false },
  { title: 'จัดการสาขาวิชา', icon: BookOpen, href: '/admin/programs', badge: null, superAdminOnly: false },
  { title: 'จัดการคณะ', icon: Building2, href: '/admin/faculties', badge: null, superAdminOnly: false },
  { title: 'จัดการสไลด์โชว์', icon: Images, href: '/admin/banners', badge: null, superAdminOnly: false },
  { title: 'จัดการผู้ใช้', icon: UserCog, href: '/admin/users', badge: null, superAdminOnly: true },
  { title: 'ตั้งค่า', icon: Settings, href: '/admin/settings', badge: null, superAdminOnly: false },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, isLoading, logout, isLoggingOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [user, isLoading, pathname, router]);

  const handleLogout = async () => {
    await logout();
  };

  const visibleMenuItems = menuItems.filter(
    (item) => !item.superAdminOnly || user?.role === 'SUPER_ADMIN'
  );

  // Get current page title
  const currentPage = menuItems.find(
    item => pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href))
  );

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (isLoading && pathname !== '/admin/login') {
    return (
      <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <div className="animate-spin rounded-full h-14 w-14 border-[3px] border-gray-200 border-t-brand"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield size={18} className="text-brand animate-pulse" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-gray-800 font-bold text-sm">กำลังตรวจสอบสิทธิ์</p>
            <p className="text-gray-400 text-xs mt-1">Authenticating session...</p>
          </div>
        </div>
      </div>
    );
  }

  const sidebarWidth = isCollapsed ? 'w-[80px]' : 'w-[260px]';

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex">
      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-40 ${sidebarWidth} bg-[#0C1425] transition-all duration-300 flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className={`h-[72px] flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-6'} border-b border-white/[0.06]`}>
          {isCollapsed ? (
            <div className="w-9 h-9 bg-brand/10 rounded-xl flex items-center justify-center">
              <Image src="/img/logo.png" alt="MBU" width={20} height={20} className="brightness-0 invert opacity-90" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-brand/10 rounded-xl flex items-center justify-center">
                <Image src="/img/logo.png" alt="MBU" width={20} height={20} className="brightness-0 invert opacity-90" />
              </div>
              <div>
                <h1 className="text-[13px] font-extrabold text-white leading-none tracking-tight">
                  MBU <span className="text-brand">LANNA</span>
                </h1>
                <span className="text-[12px] text-white/25 font-bold uppercase tracking-[0.2em]">Admin Console</span>
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile - Moved to top */}
        <div className={`${isCollapsed ? 'p-2' : 'p-3'} border-b border-white/[0.06]`}>
          <div className={`${isCollapsed ? 'p-2 flex justify-center' : 'p-3'} rounded-xl bg-white/[0.03]`}>
            {isCollapsed ? (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand/30 to-brand/10 flex items-center justify-center font-bold text-brand text-xs">
                {user?.fullName?.charAt(0) || 'A'}
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand/30 to-brand/10 flex items-center justify-center font-bold text-brand text-xs">
                    {user?.fullName?.charAt(0) || 'A'}
                  </div>
                  <div className="overflow-hidden flex-1">
                    <p className="text-[12px] font-bold text-white truncate">{user?.fullName || 'Administrator'}</p>
                    <p className="text-[12px] text-white/25 font-semibold uppercase tracking-wider">
                      {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Staff'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full py-2 bg-white/[0.04] text-red-400/80 text-[13px] font-bold rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <LogOut size={13} className={isLoggingOut ? 'animate-spin' : undefined} />
                  {isLoggingOut ? 'กำลังออกจากระบบ...' : 'ออกจากระบบ'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Menu Label */}
        {!isCollapsed && (
          <div className="px-6 pt-6 pb-2">
            <p className="text-[12px] font-bold text-white/20 uppercase tracking-[0.25em]">เมนูหลัก</p>
          </div>
        )}

        {/* Nav */}
        <nav className={`flex-1 ${isCollapsed ? 'px-2' : 'px-3'} space-y-0.5 ${isCollapsed ? 'pt-4' : ''} overflow-y-auto`}>
          {visibleMenuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.title : undefined}
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} ${isCollapsed ? 'px-0 py-3' : 'px-4 py-3'} rounded-xl transition-all duration-200 text-[13px] font-semibold group relative ${
                  isActive 
                  ? 'bg-brand text-white shadow-lg shadow-brand/20' 
                  : 'text-white/35 hover:bg-white/[0.04] hover:text-white/70'
                }`}
              >
                <div className={`flex items-center ${isCollapsed ? '' : 'gap-3'}`}>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  {!isCollapsed && <span>{item.title}</span>}
                </div>
                {!isCollapsed && isActive && <ChevronRight size={14} className="opacity-50" />}
                {!isCollapsed && item.badge === 'hot' && !isActive && (
                  <span className="w-1.5 h-1.5 bg-brand rounded-full animate-pulse"></span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle - Desktop Only */}
        <div className={`hidden lg:flex ${isCollapsed ? 'justify-center' : 'justify-end px-4'} py-3 border-t border-white/[0.04]`}>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 text-white/20 hover:text-white/50 hover:bg-white/[0.04] rounded-lg transition-all"
            title={isCollapsed ? 'ขยายเมนู' : 'ย่อเมนู'}
          >
            {isCollapsed ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-warm-gray">ขยาย</span>
                <PanelLeftOpen size={16}/>
              </div>
            )  : (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-warm-gray">หุบ</span>
                <PanelLeftClose size={16} />
              </div>
            )}
          </button>
        </div>

      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top Header */}
        <header className="h-[72px] bg-white/80 backdrop-blur-xl border-b border-gray-200/60 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            {/* Breadcrumb */}
            <div className="hidden md:flex items-center gap-2 text-sm">
              <span className="text-gray-300 font-medium">Admin</span>
              <ChevronRight size={12} className="text-gray-300" />
              <span className="text-gray-800 font-bold">{currentPage?.title || 'ภาพรวม'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <GlobalApplicantSearch />

            {/* Notification */}
            <NotificationBell />

            {/* Divider */}
            <div className="hidden lg:block w-px h-8 bg-gray-100 mx-1"></div>

            {/* Profile Quick */}
            <div className="hidden lg:flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-all cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand/20 to-brand/5 flex items-center justify-center">
                <CircleUser size={16} className="text-brand" />
              </div>
              <div className="text-right">
                <p className="text-[13px] font-bold text-gray-700 leading-none">{user?.fullName || 'Admin'}</p>
                <p className="text-[12px] text-gray-400 font-medium mt-0.5">{user?.email || ''}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-5 lg:p-8">
          {children}
        </div>

        {/* Footer */}
        <footer className="px-8 py-4 border-t border-gray-100 flex items-center justify-between text-[12px] text-gray-300 font-medium">
          <span>© {new Date().getFullYear()} MBU Lanna Admin Portal</span>
          <span className="flex items-center gap-1">
            <Sparkles size={10} />
            Version 1.0.0
          </span>
        </footer>
      </main>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}
    </div>
  );
}
