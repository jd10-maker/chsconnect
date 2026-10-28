import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  GraduationCap,
  X,
  AlertCircle,
  Key,
  Mail,
  UserCheck,
  Lock,
  User,
  Building2,
  UserPlus,
  CheckCircle2,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'student' | 'teacher';
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, defaultTab = 'student' }) => {
  const { loginStudent, loginTeacher, registerTeacher, settings } = useAuth();
  const [activeTab, setActiveTab] = useState<'student' | 'teacher'>(defaultTab);
  const [teacherSubTab, setTeacherSubTab] = useState<'login' | 'register'>('login');

  // Student Form
  const [studentEmail, setStudentEmail] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState(settings?.availableClasses[0] || 'Grade 10A');

  // Teacher Login Form
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [facultyCode, setFacultyCode] = useState('');

  // Teacher Registration Form
  const [regName, setRegName] = useState('');
  const [regDepartment, setRegDepartment] = useState('P.T. Department');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regFacultyCode, setRegFacultyCode] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await loginStudent(studentEmail, studentClass, studentName);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await loginTeacher(teacherEmail, teacherPassword, facultyCode);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTeacherRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await registerTeacher(regName, regEmail, regPassword, regDepartment, regFacultyCode);
      setSuccessMsg('Teacher account registered! Opening portal...');
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Failed to create teacher account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillTeacher = (email: string, pass: string, code: string) => {
    setTeacherEmail(email);
    setTeacherPassword(pass);
    setFacultyCode(code);
  };

  const fillStudent = (email: string, name: string, cls: string) => {
    setStudentEmail(email);
    setStudentName(name);
    setStudentClass(cls);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                {activeTab === 'student' ? <GraduationCap className="w-5 h-5 text-amber-300" /> : <ShieldCheck className="w-5 h-5 text-emerald-400" />}
              </div>
              <div>
                <h3 className="text-xl font-bold">{settings?.schoolName || 'Cathedral High School'}</h3>
                <p className="text-xs text-blue-200">Lost &amp; Found and Donations Portal</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Role Tabs */}
          <div className="flex gap-2 mt-5 bg-black/20 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setActiveTab('student');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition ${
                activeTab === 'student'
                  ? 'bg-white text-blue-900 shadow-md'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Student Login
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('teacher');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition ${
                activeTab === 'teacher'
                  ? 'bg-white text-blue-900 shadow-md'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Faculty / Staff
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
              <div>
                <p className="font-medium text-xs">Error</p>
                <p className="text-xs mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {activeTab === 'student' ? (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Gmail or School Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. jaedonpj13@gmail.com"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Current Class
                </label>
                <select
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
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

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Student Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jaedon P."
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-semibold text-sm transition shadow-md shadow-blue-700/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Signing In...' : 'Enter Student Portal'}
              </button>

              {/* Sample Student Accounts */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Sample Student Accounts:
                </span>
                <div className="grid grid-cols-3 gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => fillStudent('jaedonpj13@gmail.com', 'Jaedon P.', 'Grade 10A')}
                    className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition border border-blue-200 text-left text-xs"
                  >
                    <span className="font-bold block">Jaedon P.</span>
                    <span className="text-[10px] text-blue-600">Grade 10A</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillStudent('ananya.rao@gmail.com', 'Ananya Rao', 'Grade 9B')}
                    className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition text-left text-xs"
                  >
                    <span className="font-bold block">Ananya Rao</span>
                    <span className="text-[10px] text-slate-500">Grade 9B</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillStudent('liam.chen@cathedral.edu', 'Liam Chen', 'Grade 12A')}
                    className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition text-left text-xs border border-indigo-200"
                  >
                    <span className="font-bold block">Liam Chen</span>
                    <span className="text-[10px] text-indigo-600">Grade 12A</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div>
              {/* Teacher Sub-tabs: Sign In vs Self Registration */}
              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-4 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setTeacherSubTab('login');
                    setError(null);
                  }}
                  className={`flex-1 py-1.5 font-bold rounded-lg transition ${
                    teacherSubTab === 'login' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTeacherSubTab('register');
                    setError(null);
                  }}
                  className={`flex-1 py-1.5 font-bold rounded-lg transition ${
                    teacherSubTab === 'register' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Create Account (Code)
                </button>
              </div>

              {teacherSubTab === 'login' ? (
                <form onSubmit={handleTeacherSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Teacher School Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. s.jenkins@cathedral.edu"
                      value={teacherEmail}
                      onChange={(e) => setTeacherEmail(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={teacherPassword}
                      onChange={(e) => setTeacherPassword(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Faculty Verification Code
                    </label>
                    <div className="relative">
                      <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. CHS-2026"
                        value={facultyCode}
                        onChange={(e) => setFacultyCode(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono tracking-wider focus:ring-2 focus:ring-emerald-600 focus:outline-none uppercase"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold text-sm transition shadow-md shadow-emerald-700/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <UserCheck className="w-4 h-4" />
                    {isSubmitting ? 'Authenticating...' : 'Sign In as Faculty'}
                  </button>

                  {/* Diverse Sample Faculty Accounts */}
                  <div className="pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Sample Faculty Credentials (Distinct Passwords):
                    </span>
                    <div className="space-y-1.5">
                      <button
                        type="button"
                        onClick={() => fillTeacher('s.jenkins@cathedral.edu', 'Jenkins#PT26', 'CHS-2026')}
                        className="w-full p-2 bg-slate-50 hover:bg-emerald-50 rounded-lg text-left text-xs border border-slate-200 transition flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-slate-900 block">Ms. Jenkins (P.T. Dept)</span>
                          <span className="text-[10px] text-slate-500">s.jenkins@cathedral.edu</span>
                        </div>
                        <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          Jenkins#PT26
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fillTeacher('d.carter@cathedral.edu', 'Carter!Sci88', 'CHS-2026')}
                        className="w-full p-2 bg-slate-50 hover:bg-blue-50 rounded-lg text-left text-xs border border-slate-200 transition flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-slate-900 block">Mr. Carter (Science)</span>
                          <span className="text-[10px] text-slate-500">d.carter@cathedral.edu</span>
                        </div>
                        <span className="font-mono text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                          Carter!Sci88
                        </span>
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                /* SELF-REGISTRATION FORM */
                <form onSubmit={handleTeacherRegister} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Teacher Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mr. Robert Evans"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Department / Subject <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. P.T. Department, Chemistry"
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      School Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. r.evans@cathedral.edu"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Create Password (min 6 chars) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="Choose a personal password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Faculty Verification Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter CHS-2026"
                      value={regFacultyCode}
                      onChange={(e) => setRegFacultyCode(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold text-xs transition shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" />
                    {isSubmitting ? 'Registering...' : 'Create Account & Sign In'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
