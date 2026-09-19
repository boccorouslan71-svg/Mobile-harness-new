import React, { useState } from 'react';
import {
  X,
  Lock,
  Eye,
  EyeOff,
  Server,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Radio,
} from 'lucide-react';
import { CustomOpenAIProvider } from '../../types';
import { testOpenAIEndpoint, TestConnectionResult } from '../../services/openaiClient';

interface CustomOpenAIEditorProps {
  isOpen: boolean;
  initialProvider?: CustomOpenAIProvider | null;
  onClose: () => void;
  onSave: (providerData: Omit<CustomOpenAIProvider, 'id' | 'createdAtMillis'>, id?: string) => void;
}

const POPULAR_PRESETS = [
  {
    name: 'OpenAI Cloud',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o',
    hint: 'Standard OpenAI API',
  },
  {
    name: 'Ollama (Local)',
    baseUrl: 'http://localhost:11434/v1',
    model: 'llama3:latest',
    hint: 'Local LLM on port 11434',
  },
  {
    name: 'Groq Cloud',
    baseUrl: 'https://api.groq.com/openai/v1',
    model: 'llama-3.3-70b-versatile',
    hint: 'Ultra fast inference',
  },
  {
    name: 'LM Studio / vLLM',
    baseUrl: 'http://localhost:1234/v1',
    model: 'local-model',
    hint: 'Local OpenAI server',
  },
];

export const CustomOpenAIEditor: React.FC<CustomOpenAIEditorProps> = ({
  isOpen,
  initialProvider,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(initialProvider?.name || '');
  const [baseUrl, setBaseUrl] = useState(initialProvider?.baseUrl || 'https://api.openai.com/v1');
  const [apiKey, setApiKey] = useState(initialProvider?.apiKey || '');
  const [model, setModel] = useState(initialProvider?.model || 'gpt-4o');
  const [showKey, setShowKey] = useState(false);
  const [testResult, setTestResult] = useState<TestConnectionResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof POPULAR_PRESETS[0]) => {
    setName(preset.name);
    setBaseUrl(preset.baseUrl);
    setModel(preset.model);
    setTestResult(null);
    setErrorMsg('');
  };

  const handleTest = async () => {
    if (!baseUrl.trim()) {
      setErrorMsg('Please specify a Base URL');
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    setErrorMsg('');

    try {
      const res = await testOpenAIEndpoint({
        baseUrl: baseUrl.trim(),
        apiKey: apiKey.trim(),
        model: model.trim() || 'gpt-4o',
      });
      setTestResult(res);
    } catch (err: unknown) {
      const e = err as Error;
      setTestResult({
        success: false,
        message: e.message || 'Failed to connect to endpoint',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please provide a provider name or label');
      return;
    }
    if (!baseUrl.trim()) {
      setErrorMsg('Please provide a valid Base URL');
      return;
    }
    if (!model.trim()) {
      setErrorMsg('Please provide a model identifier');
      return;
    }

    onSave(
      {
        name: name.trim(),
        baseUrl: baseUrl.trim(),
        apiKey: apiKey.trim(),
        model: model.trim(),
      },
      initialProvider?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#131821] border border-[#2A3240] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-4">
        {/* Header */}
        <div className="p-5 border-b border-[#2A3240] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#69D69E]/15 text-[#69D69E] flex items-center justify-center border border-[#69D69E]/30">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                {initialProvider ? 'Edit Custom OpenAI Provider' : 'Add Custom OpenAI Provider'}
              </h3>
              <p className="text-xs text-[#9AA0A6]">
                Configure an endpoint compatible with the OpenAI chat completions API
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9AA0A6] hover:text-white hover:bg-[#1B222D] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="px-5">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9AA0A6] mb-2">
            Quick Templates
          </label>
          <div className="grid grid-cols-2 gap-2">
            {POPULAR_PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="p-2 rounded-xl bg-[#0B0E14] border border-[#2A3240] hover:border-[#69D69E]/50 text-left transition group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white group-hover:text-[#69D69E] transition">
                    {p.name}
                  </span>
                  <Radio className="w-3 h-3 text-[#9AA0A6] group-hover:text-[#69D69E]" />
                </div>
                <p className="text-[10px] text-[#9AA0A6] truncate">{p.hint}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-3.5">
          {/* Label / Name */}
          <div>
            <label className="block text-xs font-semibold text-[#9AA0A6] mb-1">
              Provider Name / Label <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ollama Local, Groq Llama 3, OpenAI Work"
              className="w-full bg-[#0B0E14] border border-[#2A3240] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-[#69D69E]"
              required
            />
          </div>

          {/* Base URL */}
          <div>
            <label className="block text-xs font-semibold text-[#9AA0A6] mb-1">
              Base API URL <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.openai.com/v1 or http://localhost:11434/v1"
              className="w-full bg-[#0B0E14] border border-[#2A3240] rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder:text-gray-600 focus:outline-none focus:border-[#69D69E]"
              required
            />
            <p className="text-[10px] text-[#9AA0A6] mt-1">
              Endpoint path `/chat/completions` will be resolved automatically.
            </p>
          </div>

          {/* Model Identifier */}
          <div>
            <label className="block text-xs font-semibold text-[#9AA0A6] mb-1">
              Model Identifier <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. gpt-4o, llama3:latest, deepseek-r1"
              className="w-full bg-[#0B0E14] border border-[#2A3240] rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder:text-gray-600 focus:outline-none focus:border-[#69D69E]"
              required
            />
          </div>

          {/* API Key */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#9AA0A6] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#69D69E]" /> API Key
              </label>
              <span className="text-[10px] text-[#9AA0A6]">Leave empty for local Ollama / LM Studio</span>
            </div>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-... or optional if local"
                className="w-full bg-[#0B0E14] border border-[#2A3240] rounded-xl pl-3 pr-10 py-2 text-xs font-mono text-white placeholder:text-gray-600 focus:outline-none focus:border-[#69D69E]"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9AA0A6] hover:text-white"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Live Test Status */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                testResult.success
                  ? 'bg-[#69D69E]/10 border-[#69D69E]/30 text-[#69D69E]'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <div className="leading-snug">
                <span className="font-semibold block">
                  {testResult.success ? 'Endpoint Reachable' : 'Connection Failed'}
                </span>
                <span className="font-mono text-[11px] opacity-90">{testResult.message}</span>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleTest}
              disabled={isTesting}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#1B222D] hover:bg-[#252E3E] text-[#69D69E] border border-[#2A3240] transition disabled:opacity-50"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Testing...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" /> Test Handshake
                </>
              )}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#9AA0A6] hover:text-white hover:bg-[#1B222D] transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#69D69E] text-black hover:bg-[#7cebb0] transition shadow-md shadow-[#69D69E]/20"
              >
                {initialProvider ? 'Save Changes' : 'Create Provider'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
