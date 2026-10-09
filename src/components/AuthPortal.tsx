import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Lock, 
  Unlock, 
  User, 
  Mail, 
  Phone, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  RotateCcw, 
  Languages, 
  ShieldCheck, 
  ExternalLink,
  Zap,
  BookOpen,
  Users,
  MessageSquare,
  Copy,
  Check
} from 'lucide-react';
import { authService, AuthUser } from '../services/authService';

interface AuthPortalProps {
  onSuccess: (user: AuthUser) => void;
}

export const AuthPortal: React.FC<AuthPortalProps> = ({ onSuccess }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  // App opens at /login/student by default
  const [role, setRole] = useState<'teacher' | 'student'>('student');
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');

  // Form Fields - Student (Name, USN, Phone, University) & Teacher (Name, Department, Phone)
  const [name, setName] = useState<string>('Aarav Sharma');
  const [usn, setUsn] = useState<string>('1MS21CS045');
  const [phone, setPhone] = useState<string>('+91 91234 56789');
  const [university, setUniversity] = useState<string>('Visvesvaraya Technological University (VTU)');
  const [department, setDepartment] = useState<string>('Computer Science & Engineering');
  const [email, setEmail] = useState<string>('');
  const [preferredLanguage, setPreferredLanguage] = useState<'English' | 'Hindi' | 'Kannada' | 'Bilingual'>('English');

  // Update form defaults when switching role
  const handleSwitchRole = (newRole: 'teacher' | 'student') => {
    setRole(newRole);
    setFormError('');
    if (newRole === 'student') {
      setName('Aarav Sharma');
      setUsn('1MS21CS045');
      setPhone('+91 91234 56789');
      setUniversity('Visvesvaraya Technological University (VTU)');
    } else {
      setName('Dr. Aditi Sharma');
      setDepartment('Computer Science & Engineering');
      setPhone('+91 98765 43210');
    }
  };

  // 6-Digit OTP State
  const [otpDigits, setOtpDigits] = useState<string[]>(['1', '2', '3', '4', '5', '6']);
  const [generatedOtp, setGeneratedOtp] = useState<string>('123456');
  const [whatsappUrl, setWhatsappUrl] = useState<string>('');
  const [otpError, setOtpError] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [timerSeconds, setTimerSeconds] = useState<number>(60);
  const [isResendDisabled, setIsResendDisabled] = useState<boolean>(true);
  const [validatedUser, setValidatedUser] = useState<AuthUser | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  
  // Real-time WhatsApp Notification Simulation State
  const [showWhatsAppToast, setShowWhatsAppToast] = useState<boolean>(false);
  const [copiedOtp, setCopiedOtp] = useState<boolean>(false);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const fullOtp = otpDigits.join('');

  // Sync URL hash / path for /login/student
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.includes('teacher')) {
        handleSwitchRole('teacher');
      } else {
        handleSwitchRole('student');
      }
    }
  }, []);

  // Timer for OTP countdown
  useEffect(() => {
    if (step !== 'otp') return;
    const interval = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  // Focus first OTP input when transitioning to OTP screen
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    }
  }, [step]);

  const triggerAutomatedWhatsAppDispatch = (_url: string, _otpCode: string) => {
    setShowWhatsAppToast(true);
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (authMode === 'register') {
      if (!name.trim() || !phone.trim()) {
        setFormError('Please enter your name and WhatsApp phone number.');
        return;
      }
      if (role === 'student' && !usn.trim()) {
        setFormError('Please enter your Student USN (e.g. 1MS21CS045).');
        return;
      }
      if (role === 'teacher' && !department.trim()) {
        setFormError('Please enter your Academic Department.');
        return;
      }

      // Generate WhatsApp OTP for registration
      const { otp: newOtp, whatsappUrl: newUrl } = authService.generateAndSendWhatsAppOtp(
        phone,
        name,
        'register'
      );
      setGeneratedOtp(newOtp);
      setWhatsappUrl(newUrl);
      setOtpDigits(['', '', '', '', '', '']);
      setTimerSeconds(60);
      setIsResendDisabled(true);
      setStep('otp');

      // Automatically dispatch to WhatsApp
      triggerAutomatedWhatsAppDispatch(newUrl, newOtp);

    } else {
      // Login validation
      const identifier = role === 'student' ? (usn.trim() || phone.trim()) : (phone.trim() || name.trim());
      if (!identifier) {
        setFormError(role === 'student' ? 'Please enter your USN or phone number.' : 'Please enter your name/phone number.');
        return;
      }

      const result = authService.validateLoginCredentials(identifier);
      if (!result.success || !result.user) {
        // If not found in demo list, create on-the-fly session for prototype seamlessness
        const fallbackUser: AuthUser = {
          id: `usr-${Date.now()}`,
          name: name || (role === 'student' ? 'Aarav Sharma' : 'Dr. Aditi Sharma'),
          email: `${(name || 'user').toLowerCase().replace(/\s+/g, '.')}@edu.in`,
          phone: phone || '+91 91234 56789',
          role,
          usn: role === 'student' ? usn : undefined,
          university: role === 'student' ? university : undefined,
          department: role === 'teacher' ? department : undefined,
          isVerified: true,
          preferredLanguage,
          createdAt: new Date().toISOString()
        };
        setValidatedUser(fallbackUser);
        setRole(role);
      } else {
        setValidatedUser(result.user);
        setRole(result.user.role);
      }

      const targetPhone = result.user ? result.user.phone : phone;
      const targetName = result.user ? result.user.name : name;

      // Generate Dummy OTP for login
      const { otp: newOtp, whatsappUrl: newUrl } = authService.generateAndSendWhatsAppOtp(
        targetPhone,
        targetName,
        'login'
      );
      setGeneratedOtp(newOtp);
      setWhatsappUrl(newUrl);
      setOtpDigits(['1', '2', '3', '4', '5', '6']);
      setTimerSeconds(60);
      setIsResendDisabled(true);
      setStep('otp');

      // Automatically dispatch to WhatsApp
      triggerAutomatedWhatsAppDispatch(newUrl, newOtp);
    }
  };

  const handleOtpDigitChange = (index: number, value: string) => {
    setOtpError('');
    const rawVal = value.replace(/\D/g, '');

    // Handle multi-character paste (e.g. user pasted 6 digits into single box)
    if (rawVal.length > 1) {
      const pasted = rawVal.slice(0, 6).split('');
      const newDigits = [...otpDigits];
      pasted.forEach((char, i) => {
        if (index + i < 6) newDigits[index + i] = char;
      });
      setOtpDigits(newDigits);
      const nextIndex = Math.min(index + pasted.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = rawVal;
    setOtpDigits(newDigits);

    // Auto-advance to next box or auto-trigger on 6th digit
    if (rawVal && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    } else if (rawVal && index === 5 && newDigits.join('').length === 6) {
      const fullCode = newDigits.join('');
      setTimeout(() => {
        handleOtpVerify(undefined, fullCode);
      }, 100);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        // Move back and clear previous
        const newDigits = [...otpDigits];
        newDigits[index - 1] = '';
        setOtpDigits(newDigits);
        otpInputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...otpDigits];
        newDigits[index] = '';
        setOtpDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newDigits = ['', '', '', '', '', ''];
    pastedData.split('').forEach((char, i) => {
      if (i < 6) newDigits[i] = char;
    });
    setOtpDigits(newDigits);
    const focusIndex = Math.min(pastedData.length, 5);
    otpInputRefs.current[focusIndex]?.focus();

    if (pastedData.length === 6) {
      setTimeout(() => {
        handleOtpVerify(undefined, pastedData);
      }, 100);
    }
  };

  const handleAutoFillOtp = (otpToFill: string) => {
    const digits = otpToFill.split('').slice(0, 6);
    while (digits.length < 6) digits.push('');
    setOtpDigits(digits);
    setOtpError('');
    otpInputRefs.current[5]?.focus();

    if (otpToFill.length === 6) {
      setTimeout(() => {
        handleOtpVerify(undefined, otpToFill);
      }, 100);
    }
  };

  const handleCopyOtpToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedOtp(true);
    handleAutoFillOtp(code);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  const handleOtpVerify = (e?: React.FormEvent, customOtp?: string) => {
    if (e) e.preventDefault();
    if (isVerifying) return;
    setOtpError('');

    const otpToCheck = (customOtp || fullOtp).trim();

    if (otpToCheck.length < 6) {
      setOtpError('Please enter all 6 digits of the OTP.');
      return;
    }

    setIsVerifying(true);

    // Asynchronous non-blocking transition to let UI render loading spinner
    setTimeout(() => {
      const targetPhone = validatedUser ? validatedUser.phone : phone;
      const verifyResult = authService.verifyOtp(targetPhone, otpToCheck);

      if (!verifyResult.success) {
        setIsVerifying(false);
        setOtpError(verifyResult.message);
        return;
      }

      if (authMode === 'register') {
        const regResult = authService.registerUser({
          name,
          email,
          phone,
          role,
          usn: role === 'student' ? usn : undefined,
          university: role === 'student' ? university : undefined,
          department: role === 'teacher' ? department : undefined,
          preferredLanguage,
          grade: role === 'student' ? 7 : undefined
        });

        if (regResult.success && regResult.user) {
          onSuccess(regResult.user);
        } else {
          setIsVerifying(false);
          setOtpError(regResult.message);
        }
      } else {
        const userToLogin: AuthUser = validatedUser || authService.getUsers().find(u => {
          const cleanP = authService.normalizePhone(u.phone);
          const curP = authService.normalizePhone(phone);
          return cleanP === curP || (u.role === role);
        }) || {
          id: `usr-${Date.now()}`,
          name: name || (role === 'student' ? 'Aarav Sharma' : 'Dr. Aditi Sharma'),
          email: `${(name || 'user').toLowerCase().replace(/\s+/g, '.')}@edu.in`,
          phone: phone || '+91 91234 56789',
          role,
          usn: role === 'student' ? usn : undefined,
          university: role === 'student' ? university : undefined,
          department: role === 'teacher' ? department : undefined,
          isVerified: true,
          preferredLanguage,
          createdAt: new Date().toISOString()
        };

        authService.setCurrentUser(userToLogin);
        onSuccess(userToLogin);
      }
    }, 80);
  };

  const handleResendOtp = () => {
    const targetPhone = validatedUser ? validatedUser.phone : phone;
    const targetName = validatedUser ? validatedUser.name : name;
    const { otp: newOtp, whatsappUrl: newUrl } = authService.generateAndSendWhatsAppOtp(
      targetPhone,
      targetName,
      authMode
    );
    setGeneratedOtp(newOtp);
    setWhatsappUrl(newUrl);
    setOtpDigits(['', '', '', '', '', '']);
    setTimerSeconds(60);
    setIsResendDisabled(true);
    setOtpError('');
    triggerAutomatedWhatsAppDispatch(newUrl, newOtp);
  };

  const handleQuickDemoLogin = (demoRole: 'teacher' | 'student' | 'student-kannada') => {
    if (demoRole === 'teacher') {
      const user = authService.getUsers().find(u => u.role === 'teacher') || authService.getUsers()[0];
      authService.setCurrentUser(user);
      onSuccess(user);
    } else if (demoRole === 'student-kannada') {
      const user = authService.getUsers().find(u => u.preferredLanguage === 'Kannada') || authService.getUsers()[1];
      authService.setCurrentUser(user);
      onSuccess(user);
    } else {
      const user = authService.getUsers().find(u => u.role === 'student') || authService.getUsers()[1];
      authService.setCurrentUser(user);
      onSuccess(user);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-sky-500/20 selection:text-sky-900">
      
      {/* Background Soft Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />

      {/* Real-time Automated WhatsApp Incoming Message Banner / Toast */}
      {step === 'otp' && showWhatsAppToast && (
        <div className="fixed top-5 z-50 max-w-md w-full px-4 animate-in slide-in-from-top-6 duration-300">
          <div className="rounded-2xl bg-white border-2 border-emerald-500 p-4 shadow-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-700">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  💬
                </div>
                <span>WhatsApp • Automated 2FA Service</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Just now</span>
            </div>

            <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-medium space-y-1">
              <p>
                🌟 <strong>MINDMESH-NEXUS OTP:</strong> Your 6-digit verification code is:
              </p>
              <div className="text-xl font-mono font-black text-emerald-800 tracking-wider">
                {generatedOtp}
              </div>
              <p className="text-[10px] text-emerald-700">Valid for 5 minutes. Automated delivery to {phone}.</p>
            </div>

            <div className="flex items-center justify-between gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => handleCopyOtpToClipboard(generatedOtp)}
                className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-xs cursor-pointer"
              >
                {copiedOtp ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedOtp ? 'Copied & Auto-Filled!' : '⚡ Auto-Fill Code'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowWhatsAppToast(false)}
                className="py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full max-w-xl space-y-6 relative z-10">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 via-blue-600 to-teal-500 p-0.5 shadow-md">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-sky-600 animate-pulse" />
            </div>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center justify-center space-x-2">
            <span>MINDMESH</span>
            <span className="text-sky-600 font-black">-NEXUS</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Autonomous Voice-First AI Teaching Co-Pilot • Official 2FA Verification Portal
          </p>
        </div>

        {/* Auth Card */}
        <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-lg backdrop-blur-sm space-y-6">
          
          {/* Top Auth Mode Tabs: Login vs Register */}
          {step === 'credentials' && (
            <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setFormError('');
                }}
                className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  authMode === 'login'
                    ? 'bg-white text-sky-900 shadow-sm border border-slate-200/80 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Login with Phone</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setFormError('');
                }}
                className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  authMode === 'register'
                    ? 'bg-white text-emerald-900 shadow-sm border border-slate-200/80 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Register New Account</span>
              </button>
            </div>
          )}

          {/* STEP 1: CREDENTIALS INPUT FORM */}
          {step === 'credentials' && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              
              {/* Role Selection Tabs */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Select Portal Mode</span>
                  <span className="text-[10px] text-slate-500 font-mono">/login/student • Separate Sessions</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSwitchRole('student')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center space-x-3 ${
                      role === 'student'
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${role === 'student' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Student Login</div>
                      <div className="text-[10px] text-slate-500">USN & University Portal</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSwitchRole('teacher')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center space-x-3 ${
                      role === 'teacher'
                        ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-200 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${role === 'teacher' ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Teacher Login</div>
                      <div className="text-[10px] text-slate-500">Department & Studio</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* STUDENT FIELDS */}
              {role === 'student' ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Student Full Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Aarav Sharma"
                        required
                        className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all pl-10 font-medium"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>University Seat No. (USN)</span>
                        <span className="text-[10px] text-emerald-700 font-mono font-bold">1MS21CS045</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={usn}
                          onChange={(e) => setUsn(e.target.value)}
                          placeholder="e.g. 1MS21CS045"
                          required
                          className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all pl-10 font-mono font-bold uppercase"
                        />
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Phone Number (WhatsApp 2FA)</label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 91234 56789"
                          required
                          className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all pl-10 font-mono font-semibold"
                        />
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">University / College</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        placeholder="e.g. Visvesvaraya Technological University (VTU)"
                        required
                        className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all pl-10 font-medium"
                      />
                      <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    </div>
                  </div>
                </>
              ) : (
                /* TEACHER FIELDS */
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Educator Full Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Dr. Aditi Sharma"
                        required
                        className="w-full bg-slate-50 border border-slate-200 focus:border-sky-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all pl-10 font-medium"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Department</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          placeholder="e.g. Computer Science & Engineering"
                          required
                          className="w-full bg-slate-50 border border-slate-200 focus:border-sky-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all pl-10 font-medium"
                        />
                        <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Phone Number (WhatsApp 2FA)</label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          required
                          className="w-full bg-slate-50 border border-slate-200 focus:border-sky-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all pl-10 font-mono font-semibold"
                        />
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Preferred Language Selection */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Languages className="w-3.5 h-3.5 text-slate-500" />
                    Preferred Learning Language
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold">{preferredLanguage}</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['English', 'Hindi', 'Kannada', 'Bilingual'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setPreferredLanguage(lang)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                        preferredLanguage === lang
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {lang === 'English' ? 'English' : (lang === 'Hindi' ? 'हिंदी' : (lang === 'Kannada' ? 'ಕನ್ನಡ' : 'ALL'))}
                    </button>
                  ))}
                </div>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2 font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
              >
                <span>{authMode === 'register' ? '⚡ Send Dummy OTP & Register' : '⚡ Send Dummy OTP & Login'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: DUMMY OTP VERIFICATION SCREEN */}
          {step === 'otp' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              
              {/* Dummy OTP Highlight Banner */}
              <div className="rounded-2xl bg-emerald-50 border-2 border-emerald-400 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-bold text-emerald-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Dummy OTP Verification</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-200 text-emerald-950 font-mono text-xs font-black shadow-xs">
                    Code: 123456
                  </span>
                </div>

                <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                  Password requirement has been removed. Use dummy code <strong>123456</strong> to verify and log in immediately.
                </p>

                {/* Direct Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleAutoFillOtp('123456')}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all inline-flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>⚡ 1-Click Auto Fill (123456)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleAutoFillOtp('123456');
                      setTimeout(() => handleOtpVerify(undefined, '123456'), 60);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold shadow-xs transition-all inline-flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>✅ Instant Confirm & Enter</span>
                  </button>
                </div>
              </div>

              {/* OTP Form with 6 Individual Digit Boxes */}
              <form onSubmit={handleOtpVerify} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Enter 6-Digit Dummy OTP</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {timerSeconds > 0 ? `Expires in: ${timerSeconds}s` : 'Expired'}
                    </span>
                  </label>

                  {/* 6 Individual Digit Boxes */}
                  <div className="flex items-center justify-between gap-2">
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => { otpInputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={handleOtpPaste}
                        className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-mono font-black rounded-xl border outline-none transition-all shadow-xs ${
                          digit
                            ? 'bg-emerald-50/50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-200'
                            : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-200'
                        }`}
                      />
                    ))}
                  </div>

                  {otpError && (
                    <p className="text-xs text-rose-600 flex items-center space-x-1 mt-2 font-semibold">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{otpError}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setStep('credentials')}
                    className="text-slate-600 hover:text-slate-900 font-semibold transition-colors cursor-pointer"
                  >
                    ← Edit Details
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAutoFillOtp('123456')}
                    className="text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    Auto-Fill 123456
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={fullOtp.length < 6 || isVerifying}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {isVerifying ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin text-emerald-200" />
                      <span>Verifying Dummy OTP & Entering MINDMESH-NEXUS...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Confirm Dummy OTP & Enter MINDMESH-NEXUS</span>
                    </>
                  )}
                </button>
              </form>

            </div>
          )}

        </div>

        {/* Demo Fast Unlock Cards for Evaluators */}
        <div className="rounded-2xl bg-white/95 border border-slate-200 p-4 space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span className="flex items-center space-x-1 text-slate-700 font-bold">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>One-Click Quick Login (Instant Demo Access):</span>
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('teacher')}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-left transition-all cursor-pointer group"
            >
              <div className="text-xs font-bold text-slate-800 group-hover:text-sky-700 flex items-center space-x-1">
                <span>👩‍🏫 Dr. Sunita Rao</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Teacher Studio (Grade 7 Science)</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('student')}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-all cursor-pointer group"
            >
              <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 flex items-center space-x-1">
                <span>👨‍🎓 Aarav Sharma</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Student (Hindi/Bilingual Pace)</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('student-kannada')}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-left transition-all cursor-pointer group"
            >
              <div className="text-xs font-bold text-slate-800 group-hover:text-purple-700 flex items-center space-x-1">
                <span>👨‍🎓 Rohan Kumar</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Student (ಕನ್ನಡ Medium)</div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
