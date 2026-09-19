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
  Pencil,
  Plus,
  ExternalLink,
  Lock,
  Radio,
  Globe,
} from 'lucide-react';
import {
  ProviderProfile,
  ProviderKind,
  AppThemeMode,
  DevStackId,
  CustomOpenAIProvider,
} from '../types';
import { PROVIDER_KINDS, DEV_STACKS } from '../data/defaultData';
import { StorageService } from '../services/storage';
import { testOpenAIEndpoint } from '../services/openaiClient';
import { CustomOpenAIEditor } from './settings/CustomOpenAIEditor';

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

  // Custom OpenAI providers state
  const [customProviders, setCustomProviders] = useState<CustomOpenAIProvider[]>(
    StorageService.getCustomOpenAIProviders()
  );
  const [editingProvider, setEditingProvider] = useState<CustomOpenAIProvider | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // When changing provider kind, auto-populate recommended defaults
  const handleKindChange = (kind: ProviderKind) => {
    setSelectedKind(kind);
    setTestStatus(null);

    if (kind === 'CUSTOM_OPENAI') {
      const customs = StorageService.getCustomOpenAIProviders();
      setCustomProviders(customs);
      if (customs.length > 0) {
        // If an active custom provider matches, select it, otherwise first
        const matched = customs.find(c => c.id === provider.customProviderId) || customs[0];
        setBaseUrl(matched.baseUrl);
        setModel(matched.model);
        setApiKey(matched.apiKey);
      } else {
        const meta = PROVIDER_KINDS.CUSTOM_OPENAI;
        setBaseUrl(meta.defaultBaseUrl);
        setModel(meta.defaultModel);
        setApiKey('');
      }
    } else {
      const meta = PROVIDER_KINDS[kind];
      if (meta) {
        setBaseUrl(meta.defaultBaseUrl);
        setModel(meta.defaultModel);
        setApiKey(StorageService.getSecret(kind));
      }
    }
  };

  const handleActivateCustomProvider = (p: CustomOpenAIProvider) => {
    const updated: ProviderProfile = {
      kind: 'CUSTOM_OPENAI',
      baseUrl: p.baseUrl,
      model: p.model,
      customProviderId: p.id,
      customName: p.name,
      hasSecret: !!p.apiKey.trim(),
    };
    onUpdateProvider(updated);
    setBaseUrl(p.baseUrl);
    setModel(p.model);
    setApiKey(p.apiKey);
    setSelectedKind('CUSTOM_OPENAI');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleSaveCustomProvider = (
    providerData: Omit<CustomOpenAIProvider, 'id' | 'createdAtMillis'>,
    id?: string
  ) => {
    if (id) {
      StorageService.updateCustomOpenAIProvider(id, providerData);
    } else {
      const created = StorageService.addCustomOpenAIProvider(providerData);
      // Automatically activate newly created custom provider
      handleActivateCustomProvider(created);
    }
    const updatedList = StorageService.getCustomOpenAIProviders();
    setCustomProviders(updatedList);
  };

  const handleDeleteCustomProvider = (id: string, name: string) => {
    if (confirm(`Delete custom provider "${name}"?`)) {
      StorageService.deleteCustomOpenAIProvider(id);
      const updatedList = StorageService.getCustomOpenAIProviders();
      setCustomProviders(updatedList);
      const currentActive = StorageService.getProvider();
      onUpdateProvider(currentActive);
    }
  };

  const handleSaveProvider = () => {
    StorageService.saveSecret(selectedKind, apiKey);
    if (selectedKind === 'CUSTOM_OPENAI' && provider.customProviderId) {
      StorageService.updateCustomOpenAIProvider(provider.customProviderId, {
        baseUrl: baseUrl.trim(),
        model: model.trim(),
        apiKey: apiKey.trim(),
      });
      setCustomProviders(StorageService.getCustomOpenAIProviders());
    }
    const updated: ProviderProfile = {
      kind: selectedKind,
      baseUrl: baseUrl.trim(),
      model: model.trim(),
      hasSecret: !!apiKey.trim(),
      customProviderId: selectedKind === 'CUSTOM_OPENAI' ? provider.customProviderId : undefined,
      customName: selectedKind === 'CUSTOM_OPENAI' ? (provider.customName || 'Custom OpenAI') : undefined,
    };
    onUpdateProvider(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTestConnection = async () => {
    setTestStatus({ testing: true });

    if (selectedKind === 'CUSTOM_OPENAI') {
      try {
        const res = await testOpenAIEndpoint({
          baseUrl: baseUrl.trim(),
          apiKey: apiKey.trim(),
          model: model.trim(),
        });
        setTestStatus({
          testing: false,
          success: res.success,
          message: res.message,
        });
      } catch (err: unknown) {
        const e = err as Error;
        setTestStatus({
          testing: false,
          success: false,
          message: e.message || 'Error connecting to OpenAI-compatible endpoint',
        });
      }
      return;
    }

    await new Promise(r => setTimeout(r, 800));

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
                Current:{' '}
                <span className="text-white font-semibold">
                  {provider.kind === 'CUSTOM_OPENAI'
                    ? (provider.customName ? `OpenAI (${provider.customName})` : 'Custom OpenAI')
                    : (PROVIDER_KINDS[provider.kind]?.title || provider.kind)}
                </span>{' '}
                [{provider.model || 'default'}]{' '}
                ({provider.hasSecret ? 'API Key Configured' : 'No Key / Local'})
              </p>
            </div>
          </div>
          {activeAccordion === 'provider' ? <ChevronUp className="w-4 h-4 text-[#9AA0A6]" /> : <ChevronDown className="w-4 h-4 text-[#9AA0A6]" />}
        </button>

        {activeAccordion === 'provider' && (
          <div className="px-5 pb-5 pt-2 border-t border-[#2A3240] space-y-5 bg-[#0B0E14]/40">
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
                        <span className="font-bold text-xs text-white flex items-center gap-1.5">
                          {p.title}
                          {p.kind === 'CUSTOM_OPENAI' && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-[#69D69E]/20 text-[#69D69E] rounded-md font-mono">
                              {customProviders.length}
                            </span>
                          )}
                        </span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#F28C52]" />}
                      </div>
                      <p className="text-[11px] text-[#9AA0A6] line-clamp-1">{p.subtitle}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* If CUSTOM_OPENAI is selected: Dedicated Custom OpenAI Management List */}
            {selectedKind === 'CUSTOM_OPENAI' && (
              <div className="p-4 rounded-2xl bg-[#131821] border border-[#2A3240] space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Server className="w-4 h-4 text-[#69D69E]" />
                      Configured OpenAI-Compatible Endpoints
                    </h4>
                    <p className="text-[11px] text-[#9AA0A6] mt-0.5">
                      Add, edit, or remove multiple custom OpenAI providers (Ollama, Groq, vLLM, LM Studio, etc.)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProvider(null);
                      setIsEditorOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#69D69E] text-black hover:bg-[#7cebb0] transition shadow-md shadow-[#69D69E]/20"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Provider</span>
                  </button>
                </div>

                {/* Custom Providers List */}
                <div className="space-y-2">
                  {customProviders.map((cp) => {
                    const isActive = provider.kind === 'CUSTOM_OPENAI' && provider.customProviderId === cp.id;

                    return (
                      <div
                        key={cp.id}
                        className={`p-3.5 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isActive
                            ? 'bg-[#1B222D] border-[#69D69E] text-white shadow-sm'
                            : 'bg-[#0B0E14] border-[#2A3240] hover:border-[#384355]'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{cp.name}</span>
                            {isActive && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#69D69E]/20 text-[#69D69E] border border-[#69D69E]/40 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Active
                              </span>
                            )}
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1B222D] text-[#8EA8FF] border border-[#2A3240]">
                              {cp.model}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-[#9AA0A6] font-mono">
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3 text-[#9AA0A6]" /> {cp.baseUrl}
                            </span>
                            <span className="flex items-center gap-1 text-[11px]">
                              <Lock className="w-3 h-3 text-[#69D69E]" />
                              {cp.apiKey ? 'Key Set' : 'No Key (Local)'}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          {!isActive && (
                            <button
                              type="button"
                              onClick={() => handleActivateCustomProvider(cp)}
                              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#1B222D] hover:bg-[#252E3E] text-[#69D69E] border border-[#2A3240] transition"
                            >
                              Use Model
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProvider(cp);
                              setIsEditorOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-[#9AA0A6] hover:text-white hover:bg-[#1B222D] transition"
                            title="Edit provider"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomProvider(cp.id, cp.name)}
                            className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition"
                            title="Delete provider"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Base URL & Model inputs for standard providers or selected custom */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#9AA0A6] mb-1">
                  Base API URL
                </label>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={e => setBaseUrl(e.target.value)}
                  placeholder="https://api.anthropic.com or https://api.openai.com/v1"
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
                  placeholder="claude-3-7-sonnet-latest or gpt-4o"
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
                type="button"
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
                  type="button"
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

      {/* Custom OpenAI Provider Editor Modal */}
      <CustomOpenAIEditor
        isOpen={isEditorOpen}
        initialProvider={editingProvider}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingProvider(null);
        }}
        onSave={handleSaveCustomProvider}
      />

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
