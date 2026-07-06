import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Key, 
  ShieldCheck, 
  Info,
  CheckCircle2
} from 'lucide-react';
import { ApiKeys } from '../types/types';

interface SettingsProps {
  apiKeys: ApiKeys;
  onUpdateKeys: (keys: ApiKeys) => void;
}

export default function Settings({ apiKeys, onUpdateKeys }: SettingsProps) {
  const [google, setGoogle] = useState(apiKeys.google);
  const [openai, setOpenai] = useState(apiKeys.openai);
  const [anthropic, setAnthropic] = useState(apiKeys.anthropic);
  const [groq, setGroq] = useState(apiKeys.groq);
  const [openrouter, setOpenrouter] = useState(apiKeys.openrouter);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateKeys({
      google,
      openai,
      anthropic,
      groq,
      openrouter
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">API Configurations</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Configure your model credentials. Keys are saved locally on your browser.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Columns: Key inputs */}
        <div className="lg:col-span-2">
          <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0f] rounded-xl shadow-sm p-6 space-y-6">
            
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-xs font-bold text-zinc-950 dark:text-white flex items-center gap-1.5">
                <Key className="h-4.5 w-4.5 text-blue-600" />
                <span>Secure API Keys Vault</span>
              </h3>
              
              {isSaved && (
                <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold font-mono">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>UPDATED SUCCESSFULLY</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Google API Key */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">Google Gemini API Key (Direct CORS Support)</label>
                  <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 hover:underline">Get Key</a>
                </div>
                <input 
                  type="password"
                  value={google} 
                  onChange={e => setGoogle(e.target.value)} 
                  placeholder="AIzaSy..."
                  className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono font-medium"
                />
                <span className="block text-[10px] text-zinc-400">Used for direct client-side multi-agent routing loops. Natively supports CORS.</span>
              </div>

              {/* OpenAI API Key */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">OpenAI API Key (Proxied via Backend)</label>
                  <a href="https://platform.openai.com/" target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 hover:underline">Get Key</a>
                </div>
                <input 
                  type="password"
                  value={openai} 
                  onChange={e => setOpenai(e.target.value)} 
                  placeholder="sk-proj-..."
                  className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono font-medium"
                />
                <span className="block text-[10px] text-zinc-400">Routed through the FastAPI backend proxy to prevent browser CORS blockages.</span>
              </div>

              {/* Anthropic API Key */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">Anthropic API Key</label>
                  <a href="https://console.anthropic.com/" target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 hover:underline">Get Key</a>
                </div>
                <input 
                  type="password"
                  value={anthropic} 
                  onChange={e => setAnthropic(e.target.value)} 
                  placeholder="sk-ant-..."
                  className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono font-medium"
                />
              </div>

              {/* Groq Key */}
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">Groq API Key (Optional)</label>
                <input 
                  type="password"
                  value={groq} 
                  onChange={e => setGroq(e.target.value)} 
                  placeholder="gsk_..."
                  className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono font-medium"
                />
              </div>

              <div className="pt-4 border-t border-zinc-150 dark:border-zinc-800/80 flex items-center justify-end">
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold shadow cursor-pointer transition-colors"
                >
                  Save Configurations
                </button>
              </div>

            </form>
          </div>
        </div>

        {/* Right Column: Key Security Info */}
        <div className="space-y-6">
          <div className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0f] rounded-xl shadow-sm space-y-4">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Key Protection Policies</span>
            </h4>
            <div className="space-y-3 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
              <p><strong>1. Direct Model Streaming:</strong> All Gemini key requests are dispatched straight to Google Generative AI endpoints. Your credentials never traverse AgentHub servers.</p>
              <p><strong>2. Local Sandbox storage:</strong> Values reside strictly in your browser's internal `localStorage` cache. Logging out or clearing browser cookies instantly destroys the keys.</p>
            </div>
          </div>

          <div className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0f] rounded-xl shadow-sm space-y-3 text-xs">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Model Status Check</h4>
            <div className="space-y-2 font-mono text-[10px]">
              <div className="flex items-center justify-between">
                <span>Gemini Flash</span>
                {google ? (
                  <span className="text-emerald-500 font-bold">READY (DIRECT)</span>
                ) : (
                  <span className="text-zinc-400">NOT CONFIGURED</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span>GPT-4o</span>
                {openai ? (
                  <span className="text-emerald-500 font-bold">READY (PROXY)</span>
                ) : (
                  <span className="text-zinc-400">NOT CONFIGURED</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span>Claude 3.5 Sonnet</span>
                {anthropic ? (
                  <span className="text-emerald-500 font-bold">READY (PROXY)</span>
                ) : (
                  <span className="text-zinc-400">NOT CONFIGURED</span>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
