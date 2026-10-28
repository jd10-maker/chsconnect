import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Compass,
  Search,
  Bell,
  GraduationCap,
  ShieldCheck,
  ChevronDown,
  LogOut,
  User as UserIcon,
  PlusCircle,
  Package,
  HeartHandshake,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenLogin: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenLogin,
  searchQuery,
  setSearchQuery,
}) => {
  const { user, isTeacher, switchClass, logout, settings } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Compass },
    { id: 'lost-found', label: 'Lost & Found', icon: Package },
    { id: 'report-lost', label: 'Report Lost Item', icon: PlusCircle },
    { id: 'donations', label: 'Donations', icon: HeartHandshake },
    { id: 'my-claims', label: 'My Reports & Claims', icon: Layers },
    { id: 'pe-desk', label: 'P.T. Collection Desk', icon: Clock },
  ];

  const handleClassChange = async (newClass: string) => {
    await switchClass(newClass);
    setShowClassDropdown(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top utility bar */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium text-slate-200">
            {settings?.schoolName || 'Cathedral High School'} — Lost & Found & Donations Center
          </span>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="hidden md:inline text-slate-400">
            Collection Point: {settings?.collectionPointName} ({settings?.collectionPointLocation})
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 hidden sm:inline">Holding Period: <strong className="text-amber-300">{settings?.holdingPeriodDays || 15} Days</strong></span>
          {isTeacher ? (
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-800/80 px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Faculty Mode
            </span>
          ) : user ? (
            <span className="bg-blue-950 text-blue-300 border border-blue-800/80 px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1">
              <GraduationCap className="w-3 h-3 text-blue-400" /> Student: {user.currentClass}
            </span>
          ) : null}
          <button
            onClick={() => logout()}
            className="text-[11px] font-semibold text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 transition"
            title="Switch between Student and Teacher accounts"
          >
            Switch Role ⇄
          </button>
        </div>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & School Branding */}
          <div
            className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
            onClick={() => onNavigate('home')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-900 text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-700/20 group-hover:scale-105 transition-transform">
              LF
            </div>
            <div>
              <div className="font-extrabold text-slate-900 tracking-tight leading-tight flex items-center gap-1.5">
                <span>Lost &amp; Found</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                  School
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium truncate max-w-[160px] sm:max-w-none">
                {settings?.schoolName || 'Cathedral High'}
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-xs relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search items, categories, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100/90 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-800 border border-blue-200/80 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}

            {/* Teacher Dashboard Tab */}
            {isTeacher ? (
              <button
                onClick={() => onNavigate('teacher-dashboard')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ml-1 ${
                  currentView === 'teacher-dashboard'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Teacher Dashboard
              </button>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:text-emerald-700 hover:bg-emerald-50/60 transition ml-1"
                title="Faculty Portal Sign In"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                Faculty Login
              </button>
            )}
          </nav>

          {/* Right Controls: Notifications & Profile */}
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-slate-700" />
                      <span className="font-bold text-xs text-slate-900">Notifications &amp; Activity</span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[11px] font-medium text-blue-600 hover:text-blue-800"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No notifications yet. You'll receive updates here about claims, lost matches, and collection notices.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markAsRead(notif.id);
                            if (notif.linkTarget) {
                              onNavigate(notif.linkTarget);
                              setShowNotifications(false);
                            }
                          }}
                          className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition ${
                            !notif.isRead ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-slate-900">{notif.title}</span>
                            {!notif.isRead && (
                              <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-1"></span>
                            )}
                          </div>
                          <p className="text-slate-600 mt-1 leading-snug">{notif.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1.5 block">
                            {new Date(notif.createdAt).toLocaleDateString()} at{' '}
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile / Class Switcher */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[100px]">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      {isTeacher ? 'Faculty' : user.currentClass || 'Student'}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Profile & Switch Class Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in">
                    <div className="p-3.5 bg-slate-50 border-b border-slate-200">
                      <p className="text-xs font-bold text-slate-900">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">
                        {isTeacher ? 'Authorized Staff' : 'Student Account'}
                      </span>
                    </div>

                    {/* Class Switcher for Students */}
                    {!isTeacher && (
                      <div className="p-3 border-b border-slate-100">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                          <span className="flex items-center gap-1.5">
                            <GraduationCap className="w-4 h-4 text-blue-600" /> Current Class
                          </span>
                          <span className="text-blue-700 font-bold">{user.currentClass}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mb-2">
                          Switching classes retains your reports & claims.
                        </p>
                        <select
                          value={user.currentClass || ''}
                          onChange={(e) => handleClassChange(e.target.value)}
                          className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        >
                          {(settings?.availableClasses || [
                            'Grade 9A',
                            'Grade 9B',
                            'Grade 10A',
                            'Grade 10B',
                            'Grade 11A',
                            'Grade 11B',
                            'Grade 12A',
                            'Grade 12B',
                          ]).map((cls) => (
                            <option key={cls} value={cls}>
                              {cls}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="p-1">
                      <button
                        onClick={() => {
                          onNavigate('profile');
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        My Profile &amp; Verification
                      </button>
                      <button
                        onClick={() => {
                          onNavigate('my-claims');
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2"
                      >
                        <Layers className="w-4 h-4 text-slate-400" />
                        My Reports &amp; Claims
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="px-3.5 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs shadow-md shadow-blue-700/20 transition flex items-center gap-1.5"
              >
                <UserIcon className="w-3.5 h-3.5" />
                Sign In
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 md:hidden hover:bg-slate-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
          <div className="relative mb-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 rounded-xl"
            />
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left ${
                  isActive ? 'bg-blue-50 text-blue-800' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4 text-slate-400" />
                {item.label}
              </button>
            );
          })}
          {isTeacher && (
            <button
              onClick={() => {
                onNavigate('teacher-dashboard');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Teacher Dashboard
            </button>
          )}
        </div>
      )}
    </header>
  );
};
