import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Mail,
  Key,
  Lock,
  User,
  Building2,
  CheckCircle2,
  AlertCircle,
  Package,
  Layers,
  Sparkles,
  UserPlus,
} from 'lucide-react';

export const RoleSelectScreen: React.FC = () => {
  const { loginStudent, loginTeacher, registerTeacher, settings } = useAuth();

  const [selectedRole, setSelectedRole] = useState<'none' | 'student' | 'teacher'>('none');
  const [teacherMode, setTeacherMode] = useState<'login' | 'register'>('login');

  // Student Form State
  const [studentEmail, setStudentEmail] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState(
    settings?.availableClasses[0] || 'Grade 10A'
  );

  // Teacher Login State
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [facultyCode, setFacultyCode] = useState('');

  // Teacher Self-Registration State
  const [regName, setRegName] = useState('');
  const [regDepartment, setRegDepartment] = useState('P.T. Department');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regFacultyCode, setRegFacultyCode] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await loginStudent(studentEmail, studentClass, studentName);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in as student.');
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
    } catch (err: any) {
      setError(err.message || 'Failed to sign in as faculty.');
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
      setSuccessMsg('Teacher account created successfully! Entering portal...');
    } catch (err: any) {
      setError(err.message || 'Failed to create teacher account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillStudent = (email: string, name: string, cls: string) => {
    setStudentEmail(email);
    setStudentName(name);
    setStudentClass(cls);
  };

  const fillTeacher = (email: string, pass: string, code: string) => {
    setTeacherEmail(email);
    setTeacherPassword(pass);
    setFacultyCode(code);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Top School Bar */}
      <header className="relative z-10 border-b border-slate-800 bg-slate-950/60 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-900 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-blue-700/20 border border-blue-400/20">
              CHS
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-tight block">
                {settings?.schoolName || 'Cathedral High School'}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Lost &amp; Found &amp; Donations Center • Collection Point: P.T. Department (School Ground)
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Campus System Active
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-5xl w-full mx-auto px-4 py-8 sm:py-12 flex-1 flex flex-col justify-center">
        {selectedRole === 'none' && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Header text */}
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400">
                Cathedral High School Portal
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
                Select Your Role to Continue
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                Choose your role to access property recovery, ownership verification, and school ground P.T. Department collection services.
              </p>
            </div>

            {/* The Two Main Option Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Option 1: Student */}
              <div
                onClick={() => {
                  setSelectedRole('student');
                  setError(null);
                }}
                className="group relative bg-slate-800/80 hover:bg-slate-800 border-2 border-slate-700 hover:border-blue-500 rounded-3xl p-6 sm:p-8 cursor-pointer transition-all duration-200 hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-8 h-8" />
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 block mb-1">
                      Learners &amp; Pupils
                    </span>
                    <h2 className="text-2xl font-black text-white">I am a Student</h2>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Browse items found on campus, submit reports for your lost property, claim items by providing ownership evidence, and request free donated textbooks.
                  </p>

                  <div className="space-y-2 pt-2 border-t border-slate-700/60 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                      <span>Enter with your Gmail or school email</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                      <span>Select or switch class sections anytime</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                      <span>Receive P.T. Department collection voucher</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="button"
                    className="w-full py-3 px-4 bg-blue-600 group-hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition"
                  >
                    <span>Continue as Student</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Option 2: Teacher / Faculty */}
              <div
                onClick={() => {
                  setSelectedRole('teacher');
                  setError(null);
                }}
                className="group relative bg-slate-800/80 hover:bg-slate-800 border-2 border-slate-700 hover:border-emerald-500 rounded-3xl p-6 sm:p-8 cursor-pointer transition-all duration-200 hover:shadow-2xl hover:shadow-emerald-500/10 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-8 h-8" />
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                      Faculty &amp; Staff Members
                    </span>
                    <h2 className="text-2xl font-black text-white">I am a Teacher / Faculty</h2>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Log found property, review student ownership claims, manage the 15-day unclaimed rule, and sign off on handovers at the school ground P.T. Department.
                  </p>

                  <div className="space-y-2 pt-2 border-t border-slate-700/60 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>Sign in or create your own faculty account</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>Faculty Verification Code required</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>Full control of P.T. Dept collection desk</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="button"
                    className="w-full py-3 px-4 bg-emerald-700 group-hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-700/30 flex items-center justify-center gap-2 transition"
                  >
                    <span>Continue as Teacher / Staff</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2A: STUDENT LOGIN FORM */}
        {selectedRole === 'student' && (
          <div className="max-w-md w-full mx-auto bg-slate-800/90 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-200">
            <button
              onClick={() => {
                setSelectedRole('none');
                setError(null);
              }}
              className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 mb-5 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Role Selection
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Student Sign In</h2>
                <p className="text-xs text-slate-400">Enter your Gmail and class to open the portal</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Gmail or School Email <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. jaedonpj13@gmail.com"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Select Your Current Class <span className="text-rose-400">*</span>
                </label>
                <select
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                <p className="text-[11px] text-slate-400 mt-1">
                  You can switch classes anytime from your profile without losing your claims.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Student Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jaedon P."
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-600/30 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isSubmitting ? 'Signing In...' : 'Sign In & Open Student Portal'}
              </button>

              {/* Sample Student Accounts with DIFFERENT details */}
              <div className="pt-4 border-t border-slate-700/60">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Sample Student Accounts (Different details):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => fillStudent('jaedonpj13@gmail.com', 'Jaedon P.', 'Grade 10A')}
                    className="p-2 bg-blue-950/80 hover:bg-blue-900 text-blue-200 border border-blue-800 rounded-xl text-[11px] font-semibold transition text-left"
                  >
                    <span className="block font-bold text-white">Jaedon P.</span>
                    <span className="text-[10px] text-blue-300">Grade 10A</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillStudent('ananya.rao@gmail.com', 'Ananya Rao', 'Grade 9B')}
                    className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 rounded-xl text-[11px] font-semibold transition text-left"
                  >
                    <span className="block font-bold text-white">Ananya Rao</span>
                    <span className="text-[10px] text-slate-300">Grade 9B</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillStudent('liam.chen@cathedral.edu', 'Liam Chen', 'Grade 12A')}
                    className="p-2 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 border border-indigo-800 rounded-xl text-[11px] font-semibold transition text-left"
                  >
                    <span className="block font-bold text-white">Liam Chen</span>
                    <span className="text-[10px] text-indigo-300">Grade 12A</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2B: TEACHER PORTAL (SIGN IN OR SELF-REGISTRATION) */}
        {selectedRole === 'teacher' && (
          <div className="max-w-lg w-full mx-auto bg-slate-800/90 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-200">
            <button
              onClick={() => {
                setSelectedRole('none');
                setError(null);
                setSuccessMsg(null);
              }}
              className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 mb-5 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Role Selection
            </button>

            {/* Sub-Tabs: Sign In vs Self-Registration */}
            <div className="flex p-1 bg-slate-900 rounded-2xl mb-6 border border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setTeacherMode('login');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                  teacherMode === 'login'
                    ? 'bg-emerald-700 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Sign In to Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setTeacherMode('register');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                  teacherMode === 'register'
                    ? 'bg-emerald-700 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                Create New Faculty Account
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* TAB 1: TEACHER SIGN IN */}
            {teacherMode === 'login' ? (
              <form onSubmit={handleTeacherSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Teacher School Email <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. s.jenkins@cathedral.edu"
                      value={teacherEmail}
                      onChange={(e) => setTeacherEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="Enter your personal teacher password"
                      value={teacherPassword}
                      onChange={(e) => setTeacherPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Faculty Verification Code <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. CHS-2026"
                      value={facultyCode}
                      onChange={(e) => setFacultyCode(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none uppercase"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Official faculty code for Cathedral High School is <strong>CHS-2026</strong>.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-700/30 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {isSubmitting ? 'Authenticating...' : 'Sign In to Faculty Portal'}
                </button>

                {/* Diverse Sample Accounts with DIFFERENT passwords & departments */}
                <div className="pt-4 border-t border-slate-700/60">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Sample Faculty Accounts (Different Passwords &amp; Departments):
                  </span>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => fillTeacher('s.jenkins@cathedral.edu', 'Jenkins#PT26', 'CHS-2026')}
                      className="w-full p-2.5 bg-slate-900 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-xs text-left transition flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-white block">Ms. Sarah Jenkins (P.T. Dept Head)</span>
                        <span className="text-[11px] text-slate-400">s.jenkins@cathedral.edu</span>
                      </div>
                      <span className="font-mono text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">
                        Jenkins#PT26
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fillTeacher('d.carter@cathedral.edu', 'Carter!Sci88', 'CHS-2026')}
                      className="w-full p-2.5 bg-slate-900 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-xs text-left transition flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-white block">Mr. David Carter (Senior Physics)</span>
                        <span className="text-[11px] text-slate-400">d.carter@cathedral.edu</span>
                      </div>
                      <span className="font-mono text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded">
                        Carter!Sci88
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fillTeacher('r.thorne@cathedral.edu', 'Thorne$Bio26', 'CHS-2026')}
                      className="w-full p-2.5 bg-slate-900 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-xs text-left transition flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-white block">Mrs. Rebecca Thorne (Biology)</span>
                        <span className="text-[11px] text-slate-400">r.thorne@cathedral.edu</span>
                      </div>
                      <span className="font-mono text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded">
                        Thorne$Bio26
                      </span>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* TAB 2: TEACHER SELF-REGISTRATION WITH FACULTY CODE */
              <form onSubmit={handleTeacherRegister} className="space-y-4">
                <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-xs text-emerald-200">
                  <span className="font-bold block">Faculty Self-Registration:</span>
                  Any teacher at Cathedral High School can register their own official account by entering the faculty verification code.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Teacher Full Name <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Mr. Robert Evans"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Department / Subject <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. P.T. Department, Chemistry"
                        value={regDepartment}
                        onChange={(e) => setRegDepartment(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    School Email Address <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. r.evans@cathedral.edu"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Create Personal Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="Create your own secure password (min 6 chars)"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Faculty Verification Code <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="Enter the official faculty code (CHS-2026)"
                      value={regFacultyCode}
                      onChange={(e) => setRegFacultyCode(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none uppercase"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Enter <strong>CHS-2026</strong> to authorize and create your faculty account.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-700/30 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  {isSubmitting ? 'Registering Account...' : 'Register Teacher Account & Open App'}
                </button>
              </form>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 px-6 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {settings?.schoolName || 'Cathedral High School'}. Collection Point: P.T. Department (School Ground).
      </footer>
    </div>
  );
};
