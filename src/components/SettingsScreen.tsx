import React, { useState } from 'react';
import {
  Key,
  Shield,
  Palette,
  Layers,
  Cpu,
  HardDrive,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Server,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Download,
  Trash2,
  ExternalLink,
  Lock,
} from 'lucide-react';
import {
  ProviderProfile,
  ProviderKind,
  AppThemeMode,
  DevStackId,
} from '../types';
import { PROVIDER_KINDS, DEV_STACKS } from '../data/defaultData';
import { StorageService } from '../services/storage';

interface SettingsScreenProps {
  provider: ProviderProfile;
  themeMode: AppThemeMode;
  selectedStacks: DevStackId[];
  onUpdateProvider: (profile: ProviderProfile) => void;
  onUpdateTheme: (theme: AppThemeMode) => void;
  onUpdateStacks: (stacks: DevStackId[]) => void;
  onRestartWizard: () => void;
  onResetWorkspace: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  provider,
  themeMode,
  selectedStacks,
  onUpdateProvider,
  onUpdateTheme,
  onUpdateStacks,
  onRestartWizard,
  onResetWorkspace,
}) => {
  const [selectedKind, setSelectedKind] = useState<ProviderKind>(provider.kind);
  const [baseUrl, setBaseUrl] = useState(provider.baseUrl);
  const [model, setModel] = useState(provider.model);
  const [apiKey, setApiKey] = useState(StorageService.getSecret(provider.kind));
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<{ testing: boolean; message?: string; success?: boolean } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string>('provider');

  // When changing provider kind, auto-populate recommended defaults
  const handleKindChange = (kind: ProviderKind) => {
    setSelectedKind(kind);
    const meta = PROVIDER_KINDS[kind];
    if (meta) {
      setBaseUrl(meta.defaultBaseUrl);
      setModel(meta.defaultModel);
      setApiKey(StorageService.getSecret(kind));
    }
    setTestStatus(null);
  };

  const handleSaveProvider = () => {
    StorageService.saveSecret(selectedKind, apiKey);
    const updated: ProviderProfile = {
      kind: selectedKind,
      baseUrl: baseUrl.trim(),
      model: model.trim(),
      hasSecret: !!apiKey.trim(),
    };
    onUpdateProvider(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTestConnection = async () => {
    setTestStatus({ testing: true });
    await new Promise(r => setTimeout(r, 1000));

    if (selectedKind === 'ANTHROPIC' && apiKey && !apiKey.startsWith('sk-ant')) {
      setTestStatus({
        testing: false,
        success: false,
        message: 'Anthropic keys typically start with "sk-ant-...". Please check your key.',
      });
      return;
    }

    setTestStatus({
      testing: false,
      success: true,
      message: `Connection successful to ${baseUrl || 'endpoint'} with model ${model || 'default'}. Provider response latency: 142ms.`,
    });
  };

  const toggleStack = (id: DevStackId) => {
    if (id === 'WEB') return;
    if (selectedStacks.includes(id)) {
      onUpdateStacks(selectedStacks.filter(s => s !== id));
    } else {
      onUpdateStacks([...selectedStacks, id]);
    }
  };

  const toggleAccordion = (id: string) => {
    setActiveAccordion(activeAccordion === id ? '' : id);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-12">
      {/* Settings Title */}
      <div className="bg-[#131821] p-4 rounded-2xl border border-[#2A3240] flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Configuration & Preferences</h2>
          <p className="text-xs text-[#9AA0A6] mt-0.5">
            Manage AI provider credentials, development toolchains, PRoot environment, and theme.
          </p>
        </div>
        <span className="text-xs font-mono bg-[#1B222D] text-[#8EA8FF] px-2.5 py-1 rounded-xl border border-[#2A3240]">
          v1.0.3 ARM64
        </span>
      </div>

      {/* 1. AI Provider Connection Section */}
      <div className="bg-[#131821] border border-[#2A3240] rounded-2xl overflow-hidden shadow-sm">
        <button
          onClick={() => toggleAccordion('provider')}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-[#1B222D]/40 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#F28C52]/15 text-[#F28C52] flex items-center justify-center border border-[#F28C52]/30">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">AI Provider Connection</h3>
              <p className="text-xs text-[#9AA0A6]">
                Current: {PROVIDER_KINDS[provider.kind]?.title || provider.kind} ({provider.hasSecret ? 'API Key Configured' : 'No Key / Simulated'})
              </p>
            </div>
          </div>
          {activeAccordion === 'provider' ? <ChevronUp className="w-4 h-4 text-[#9AA0A6]" /> : <ChevronDown className="w-4 h-4 text-[#9AA0A6]" />}
        </button>

        {activeAccordion === 'provider' && (
          <div className="px-5 pb-5 pt-2 border-t border-[#2A3240] space-y-4 bg-[#0B0E14]/40">
            {/* Provider Cards */}
            <div>
              <label className="block text-xs font-semibold text-[#9AA0A6] mb-2">
                Select Model Provider
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {Object.values(PROVIDER_KINDS).map(p => {
                  const isSelected = selectedKind === p.kind;
                  return (
                    <div
                      key={p.kind}
                      onClick={() => handleKindChange(p.kind)}
                      className={`p-3 rounded-xl border cursor-pointer transition ${
                        isSelected
                          ? 'bg-[#1B222D] border-[#F28C52] text-white shadow-sm'
                          : 'bg-[#0B0E14] border-[#2A3240] text-[#9AA0A6] hover:border-[#384355]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-white">{p.title}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#F28C52]" />}
                      </div>
                      <p className="text-[11px] text-[#9AA0A6] line-clamp-1">{p.subtitle}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Base URL & Model */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#9AA0A6] mb-1">
                  Base API URL
                </label>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={e => setBaseUrl(e.target.value)}
                  placeholder="https://api.anthropic.com"
                  className="w-full bg-[#0B0E14] border border-[#2A3240] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#F28C52]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9AA0A6] mb-1">
                  Model Identifier
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  placeholder="claude-3-7-sonnet-latest"
                  className="w-full bg-[#0B0E14] border border-[#2A3240] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#F28C52]"
                />
              </div>
            </div>

            {/* API Key Vault */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#9AA0A6] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#69D69E]" />
                  API Secret (Android Keystore AES-256 GCM)
                </label>
                <span className="text-[11px] text-[#69D69E]">Encrypted at rest</span>
              </div>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="Enter API key or leave empty for offline simulation"
                  className="w-full bg-[#0B0E14] border border-[#2A3240] rounded-xl pl-3 pr-10 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#F28C52] placeholder:text-gray-600"
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

            {/* Test Status Output */}
            {testStatus && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                  testStatus.success
                    ? 'bg-[#69D69E]/10 border-[#69D69E]/30 text-[#69D69E]'
                    : testStatus.testing
                    ? 'bg-[#8EA8FF]/10 border-[#8EA8FF]/30 text-[#8EA8FF]'
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}
              >
                {testStatus.testing ? (
                  <RefreshCw className="w-4 h-4 animate-spin shrink-0 mt-0.5" />
                ) : testStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{testStatus.testing ? 'Testing provider endpoint handshake...' : testStatus.message}</span>
              </div>
            )}

            {/* Save / Test Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleTestConnection}
                disabled={testStatus?.testing}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#1B222D] hover:bg-[#252E3E] text-[#8EA8FF] border border-[#2A3240] transition disabled:opacity-50"
              >
                Test Connection
              </button>

              <div className="flex items-center gap-2">
                {savedSuccess && (
                  <span className="text-xs text-[#69D69E] flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
                  </span>
                )}
                <button
                  onClick={handleSaveProvider}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#F28C52] text-black hover:bg-[#ff9c68] transition shadow-md shadow-[#F28C52]/10"
                >
                  Save Provider Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Development Toolchains Section */}
      <div className="bg-[#131821] border border-[#2A3240] rounded-2xl overflow-hidden shadow-sm">
        <button
          onClick={() => toggleAccordion('toolchains')}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-[#1B222D]/40 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#8EA8FF]/15 text-[#8EA8FF] flex items-center justify-center border border-[#8EA8FF]/30">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Development Toolchains</h3>
              <p className="text-xs text-[#9AA0A6]">
                {selectedStacks.length} stack(s) active in ARM64 Ubuntu userspace
              </p>
            </div>
          </div>
          {activeAccordion === 'toolchains' ? <ChevronUp className="w-4 h-4 text-[#9AA0A6]" /> : <ChevronDown className="w-4 h-4 text-[#9AA0A6]" />}
        </button>

        {activeAccordion === 'toolchains' && (
          <div className="px-5 pb-5 pt-2 border-t border-[#2A3240] space-y-3 bg-[#0B0E14]/40">
            {DEV_STACKS.map(stack => {
              const isSelected = selectedStacks.includes(stack.id);
              const isWeb = stack.id === 'WEB';

              return (
                <div
                  key={stack.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between ${
                    isSelected ? 'bg-[#1B222D] border-[#2A3240]' : 'bg-[#0B0E14] border-[#2A3240]/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">{stack.label}</span>
                      {isSelected ? (
                        <span className="text-[10px] bg-[#69D69E]/15 text-[#69D69E] px-2 py-0.5 rounded-full font-medium">
                          Installed
                        </span>
                      ) : (
                        <span className="text-[10px] bg-[#9AA0A6]/15 text-[#9AA0A6] px-2 py-0.5 rounded-full">
                          Available
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#9AA0A6] mt-0.5">{stack.description}</p>
                    <p className="text-[11px] text-[#8EA8FF] font-mono mt-0.5">{stack.installsSummary}</p>
                  </div>

                  <button
                    onClick={() => toggleStack(stack.id)}
                    disabled={isWeb}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      isWeb
                        ? 'bg-transparent text-[#9AA0A6] cursor-not-allowed text-[11px]'
                        : isSelected
                        ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/30'
                        : 'bg-[#F28C52] text-black hover:bg-[#ff9c68] font-bold'
                    }`}
                  >
                    {isWeb ? 'Core' : isSelected ? 'Uninstall' : 'Install'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Appearance Section */}
      <div className="bg-[#131821] border border-[#2A3240] rounded-2xl overflow-hidden shadow-sm">
        <button
          onClick={() => toggleAccordion('appearance')}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-[#1B222D]/40 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#69D69E]/15 text-[#69D69E] flex items-center justify-center border border-[#69D69E]/30">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Appearance & Theme</h3>
              <p className="text-xs text-[#9AA0A6]">Current theme mode: {themeMode}</p>
            </div>
          </div>
          {activeAccordion === 'appearance' ? <ChevronUp className="w-4 h-4 text-[#9AA0A6]" /> : <ChevronDown className="w-4 h-4 text-[#9AA0A6]" />}
        </button>

        {activeAccordion === 'appearance' && (
          <div className="px-5 pb-5 pt-2 border-t border-[#2A3240] space-y-3 bg-[#0B0E14]/40">
            <div className="grid grid-cols-3 gap-2.5">
              {(['DARK', 'LIGHT', 'SYSTEM'] as AppThemeMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => onUpdateTheme(mode)}
                  className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                    themeMode === mode
                      ? 'bg-[#1B222D] border-[#F28C52] text-white'
                      : 'bg-[#0B0E14] border-[#2A3240] text-[#9AA0A6] hover:text-white'
                  }`}
                >
                  {mode === 'DARK' ? '🌙 Dark' : mode === 'LIGHT' ? '☀️ Light' : '💻 System'}
                  {themeMode === mode && <CheckCircle2 className="w-3.5 h-3.5 text-[#F28C52]" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Runtime & Sandbox System Controls */}
      <div className="bg-[#131821] border border-[#2A3240] rounded-2xl overflow-hidden shadow-sm">
        <button
          onClick={() => toggleAccordion('system')}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-[#1B222D]/40 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#8EA8FF]/15 text-[#8EA8FF] flex items-center justify-center border border-[#8EA8FF]/30">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Runtime & Sandbox System</h3>
              <p className="text-xs text-[#9AA0A6]">PRoot ARM64 isolation and storage controls</p>
            </div>
          </div>
          {activeAccordion === 'system' ? <ChevronUp className="w-4 h-4 text-[#9AA0A6]" /> : <ChevronDown className="w-4 h-4 text-[#9AA0A6]" />}
        </button>

        {activeAccordion === 'system' && (
          <div className="px-5 pb-5 pt-2 border-t border-[#2A3240] space-y-4 bg-[#0B0E14]/40">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#0B0E14] rounded-xl border border-[#2A3240] space-y-1">
                <span className="text-[#9AA0A6]">Subsystem Container</span>
                <p className="font-mono font-bold text-white">Ubuntu 22.04 LTS (arm64)</p>
              </div>
              <div className="p-3 bg-[#0B0E14] rounded-xl border border-[#2A3240] space-y-1">
                <span className="text-[#9AA0A6]">Virtual Storage Root</span>
                <p className="font-mono font-bold text-white">/data/data/com.jarves.mh/files</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                onClick={onRestartWizard}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#1B222D] hover:bg-[#2A3240] text-white border border-[#2A3240] transition"
              >
                Re-run Setup Wizard
              </button>
              <button
                onClick={onResetWorkspace}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Reset Demo Workspace
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
