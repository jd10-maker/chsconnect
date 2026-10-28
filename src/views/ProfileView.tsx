import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User as UserIcon,
  GraduationCap,
  ShieldCheck,
  Mail,
  CheckCircle2,
  Calendar,
  Layers,
  FileText,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface ProfileViewProps {
  onNavigate: (view: string) => void;
  onOpenLogin: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onNavigate,
  onOpenLogin,
}) => {
  const { user, isTeacher, switchClass, logout, settings } = useAuth();
  const [selectedClass, setSelectedClass] = useState(user?.currentClass || 'Grade 10A');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Sign In to View Profile</h2>
        <p className="text-xs text-slate-600">
          Sign in with your Gmail or school account to view your claims, reports, and class information.
        </p>
        <button
          onClick={onOpenLogin}
          className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md transition"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setSuccessMessage(null);
    try {
      await switchClass(selectedClass);
      setSuccessMessage('Class updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update class.');
    } finally {
      setIsUpdating(false);
    }
  };

  const isSchoolDomain = user.email.toLowerCase().endsWith('@' + (settings?.schoolDomain || 'cathedral.edu').toLowerCase());

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Account Profile &amp; Settings
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Manage your verified student credentials, class section, and notification preferences.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-900 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-blue-700/20">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    isTeacher ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {isTeacher ? 'Authorized Faculty' : 'Student Account'}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5" /> {user.email}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="self-start sm:self-auto px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>

        {/* Verification Status Banner */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                {isSchoolDomain ? 'Official School Email Verified' : 'Registered Gmail Account'}
              </span>
              <p className="text-[11px] text-slate-500">
                {isSchoolDomain
                  ? `Authenticated through @${settings?.schoolDomain} domain rules.`
                  : 'Authenticated through student Gmail access.'}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            Active
          </span>
        </div>

        {/* Student Class Switcher */}
        {!isTeacher && (
          <form onSubmit={handleClassSubmit} className="space-y-4 pt-2">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  Select / Switch Current Class
                </label>
                <span className="text-xs text-blue-700 font-bold">
                  Current: {user.currentClass || 'Unassigned'}
                </span>
              </div>

              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
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

              <p className="text-[11px] text-slate-400 mt-1.5">
                <strong>Privacy Guarantee:</strong> Switching your class does not erase or grant access to another student's private ownership evidence or teacher-only features.
              </p>
            </div>

            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {successMessage}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isUpdating || selectedClass === user.currentClass}
                className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
              >
                {isUpdating ? 'Updating...' : 'Save Class Change'}
              </button>
            </div>
          </form>
        )}

        {/* Quick Links */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-3">
          <button
            onClick={() => onNavigate('my-claims')}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition text-xs font-semibold text-slate-800 flex items-center justify-between"
          >
            <span>My Submitted Claims &amp; Reports</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={() => onNavigate('report-lost')}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition text-xs font-semibold text-slate-800 flex items-center justify-between"
          >
            <span>Report a Lost Belonging</span>
            <FileText className="w-4 h-4 text-indigo-600" />
          </button>
        </div>
      </div>
    </div>
  );
};
