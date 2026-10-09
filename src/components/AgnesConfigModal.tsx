import React, { useState, useEffect } from 'react';
import { 
  X, 
  Key, 
  Server, 
  Cpu, 
  Activity, 
  CheckCircle2, 
  ExternalLink, 
  ShieldCheck, 
  Zap,
  Gauge
} from 'lucide-react';
import { agnesService, AgnesSystemMetrics } from '../services/agnesService';

interface AgnesConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AgnesConfigModal: React.FC<AgnesConfigModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [saved, setSaved] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<AgnesSystemMetrics>(agnesService.getMetrics());

  useEffect(() => {
    setApiKey(agnesService.getApiKey());
    const timer = setInterval(() => {
      setMetrics(agnesService.getMetrics());
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    agnesService.setApiKey(apiKey.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-brand-50 text-brand-700 border border-brand-200">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">
                  Official Agnes AI Specifications & API Gateway
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-brand-50 text-brand-700 font-bold border border-brand-200">
                  HR26-AI-01
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Configured strictly for Agnes 3.0 Flash 512K context & 10 RPM Token Bucket Queuing
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors border border-slate-200 cursor-pointer shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 max-h-[80vh]">
          
          {/* Official Specifications Table */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Official Model & API Registry</span>
              <a 
                href="https://platform.agnes-ai.com" 
                target="_blank" 
                rel="noreferrer" 
                className="text-[11px] text-brand-700 font-semibold flex items-center space-x-1 hover:underline"
              >
                <span>platform.agnes-ai.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-sm">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">API Base Endpoint</span>
                <span className="text-brand-700 font-mono font-semibold text-xs">https://apihub.agnes-ai.com/v1</span>
              </div>

              <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-sm">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Primary LLM</span>
                <span className="text-slate-900 font-mono font-semibold text-xs">agnes-3.0-flash (512K Context)</span>
              </div>

              <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-sm">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Visual Generator</span>
                <span className="text-blue-700 font-mono font-semibold text-xs">agnes-image-2.5-flash (1024x1024)</span>
              </div>

              <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-sm">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Video Generator</span>
                <span className="text-purple-700 font-mono font-semibold text-xs">agnes-video-2.5 (1 RPM)</span>
              </div>
            </div>
          </div>

          {/* Token Bucket Rate Limiter Telemetry */}
          <div className="rounded-xl bg-emerald-50/60 border border-emerald-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Gauge className="w-4 h-4 text-emerald-700" />
                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                  In-Memory Token Bucket Queue (10 RPM Free Plan)
                </h4>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                Interval: 6.0s spacing
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-lg bg-white border border-emerald-200 shadow-sm">
                <div className="text-lg font-black text-emerald-700">{metrics.currentTokens}/10</div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Available Tokens</div>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-emerald-200 shadow-sm">
                <div className="text-lg font-black text-blue-700">{metrics.textRpmLimit} RPM</div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Enforced Ceiling</div>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-emerald-200 shadow-sm">
                <div className="text-lg font-black text-amber-700">{metrics.totalRequestsServed}</div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Requests Handled</div>
              </div>
            </div>

            <p className="text-[11px] text-emerald-900 font-medium">
              ✓ Guarantees 0% rate-limit rejections (HTTP 429) by serializing requests through an async lock.
            </p>
          </div>

          {/* API Key Input Form */}
          <form onSubmit={handleSave} className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <Key className="w-3.5 h-3.5 text-brand-600" />
                  <span>Agnes AI API Key (Bearer Token)</span>
                </span>
                <span className="text-[10px] text-slate-500 font-normal">Optional: Falls back to high-fidelity local simulator if blank</span>
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="e.g. agnes_sk_xxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-slate-50 border border-slate-300 focus:border-brand-500 focus:bg-white text-xs text-slate-900 placeholder-slate-400 rounded-xl px-3.5 py-2.5 outline-none font-mono transition-all"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-600">
                {saved && (
                  <span className="text-emerald-700 font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Key saved to local session securely!</span>
                  </span>
                )}
              </span>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Save Configuration
              </button>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
};
