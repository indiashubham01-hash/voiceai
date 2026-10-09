import React, { useState } from 'react';
import { 
  ShieldCheck, 
  KeyRound, 
  AlertCircle, 
  X, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface TeacherAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticate: () => void;
}

export const TeacherAuthModal: React.FC<TeacherAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthenticate,
}) => {
  const [otp, setOtp] = useState<string>('123456');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (otp.trim() === '123456' || otp.trim().length === 6) {
      setError('');
      setOtp('123456');
      onAuthenticate();
      onClose();
    } else {
      setError('Please enter the 6-digit dummy OTP (123456).');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-5">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-6 h-6 text-sky-600" />
          </div>
          
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Educator Dummy OTP Verification
          </h3>
          <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
            Password authentication removed. Confirm with dummy code <strong>123456</strong> to unlock supervisory lesson controls & analytics.
          </p>
        </div>

        {/* Dummy OTP Highlight */}
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300 flex items-center justify-between text-xs">
          <span className="font-bold text-emerald-900">🌟 Dummy Access OTP:</span>
          <span className="font-mono font-black text-emerald-950 px-2.5 py-0.5 rounded-lg bg-emerald-200">123456</span>
        </div>

        {/* OTP Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Enter 6-Digit Dummy OTP</span>
              <span className="text-[10px] text-sky-700 font-bold">Role: Supervisor</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value);
                  setError('');
                }}
                maxLength={6}
                placeholder="123456"
                autoFocus
                className="w-full bg-slate-50 border border-slate-300 focus:border-sky-500 focus:bg-white rounded-xl px-4 py-2.5 text-center text-lg tracking-widest text-slate-900 placeholder-slate-400 outline-none transition-all font-mono font-black"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
            
            {error && (
              <p className="text-xs text-rose-600 flex items-center space-x-1 mt-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{error}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm Dummy OTP & Unlock</span>
          </button>
        </form>

        {/* Quick 1-Click Access */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Instant Access:
          </span>
          <button
            type="button"
            onClick={() => {
              setOtp('123456');
              onAuthenticate();
              onClose();
            }}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs text-emerald-800 font-bold transition-all cursor-pointer"
          >
            ⚡ 1-Click Unlock
          </button>
        </div>

      </div>
    </div>
  );
};
