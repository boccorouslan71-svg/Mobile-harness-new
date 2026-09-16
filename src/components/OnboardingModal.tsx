import React, { useState } from 'react';
import { Shield, Cpu, HardDrive, CheckCircle2, ChevronRight, Terminal, Sparkles, Layers, Key } from 'lucide-react';
import { DEV_STACKS, PROVIDER_KINDS } from '../data/defaultData';
import { DevStackId, ProviderKind } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (selectedStacks: DevStackId[], providerKind: ProviderKind, apiKey: string) => void;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete, onClose }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedStacks, setSelectedStacks] = useState<DevStackId[]>(['WEB', 'PYTHON']);
  const [selectedProvider, setSelectedProvider] = useState<ProviderKind>('ANTHROPIC');
  const [apiKey, setApiKey] = useState('');

  if (!isOpen) return null;

  const toggleStack = (id: DevStackId) => {
    if (id === 'WEB') return; // Always keep Web active
    if (selectedStacks.includes(id)) {
      setSelectedStacks(selectedStacks.filter(s => s !== id));
    } else {
      setSelectedStacks([...selectedStacks, id]);
    }
  };

  const handleFinish = () => {
    onComplete(selectedStacks, selectedProvider, apiKey);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#131821] border border-[#2A3240] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#2A3240] flex items-center justify-between bg-[#1B222D]/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F28C52]/20 flex items-center justify-center border border-[#F28C52]/40 text-[#F28C52]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Mobile Harness Setup</h2>
              <p className="text-xs text-[#9AA0A6]">
                Step {step} of 3: {step === 1 ? 'System Compatibility' : step === 2 ? 'Development Stacks' : 'AI Provider'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#9AA0A6] hover:text-white text-xs px-2.5 py-1 rounded border border-[#2A3240] hover:bg-[#2A3240] transition"
          >
            Skip for now
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-[#0B0E14] h-1.5 flex">
          <div
            className="bg-[#F28C52] h-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-sm text-[#9AA0A6]">
                Mobile Harness requires an isolated userspace environment. We have verified your system specs:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-[#0B0E14] border border-[#2A3240] flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[#8EA8FF]">
                    <Cpu className="w-5 h-5" />
                    <CheckCircle2 className="w-4 h-4 text-[#69D69E]" />
                  </div>
                  <span className="text-xs text-[#9AA0A6]">CPU Architecture</span>
                  <span className="font-mono text-sm font-semibold text-white">ARM64 (aarch64)</span>
                  <span className="text-[11px] text-[#69D69E]">Native PRoot match</span>
                </div>

                <div className="p-4 rounded-xl bg-[#0B0E14] border border-[#2A3240] flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[#F28C52]">
                    <HardDrive className="w-5 h-5" />
                    <CheckCircle2 className="w-4 h-4 text-[#69D69E]" />
                  </div>
                  <span className="text-xs text-[#9AA0A6]">Available Storage</span>
                  <span className="font-mono text-sm font-semibold text-white">7.8 GB Free</span>
                  <span className="text-[11px] text-[#69D69E]">Sufficient for rootfs</span>
                </div>

                <div className="p-4 rounded-xl bg-[#0B0E14] border border-[#2A3240] flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[#69D69E]">
                    <Shield className="w-5 h-5" />
                    <CheckCircle2 className="w-4 h-4 text-[#69D69E]" />
                  </div>
                  <span className="text-xs text-[#9AA0A6]">Keystore Encryption</span>
                  <span className="font-mono text-sm font-semibold text-white">AES-256 GCM</span>
                  <span className="text-[11px] text-[#69D69E]">Hardware-backed</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#1B222D] border border-[#2A3240] flex items-start gap-3 text-xs text-[#9AA0A6]">
                <Terminal className="w-4 h-4 text-[#F28C52] shrink-0 mt-0.5" />
                <span>
                  The base environment contains Ubuntu 22.04 LTS userspace, Node.js 22, Git, OpenSSL, and Claude Code CLI.
                </span>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm text-[#9AA0A6]">
                Select the development toolchains you would like ready in your sandbox:
              </p>

              <div className="space-y-2.5">
                {DEV_STACKS.map(stack => {
                  const isSelected = selectedStacks.includes(stack.id);
                  const isWeb = stack.id === 'WEB';

                  return (
                    <div
                      key={stack.id}
                      onClick={() => !isWeb && toggleStack(stack.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#1B222D] border-[#F28C52] text-white shadow-sm'
                          : 'bg-[#0B0E14] border-[#2A3240] text-[#9AA0A6] hover:border-[#3A4557]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 p-1.5 rounded-lg ${
                            isSelected ? 'bg-[#F28C52]/20 text-[#F28C52]' : 'bg-[#2A3240] text-[#9AA0A6]'
                          }`}
                        >
                          <Layers className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-white">{stack.label}</span>
                            {isWeb && (
                              <span className="text-[10px] bg-[#69D69E]/20 text-[#69D69E] px-2 py-0.5 rounded-full font-medium">
                                Essential
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#9AA0A6] mt-0.5">{stack.description}</p>
                          <p className="text-[11px] text-[#8EA8FF] mt-1 font-mono">{stack.installsSummary}</p>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center border transition ${
                          isSelected
                            ? 'bg-[#F28C52] border-[#F28C52] text-black font-bold'
                            : 'border-[#2A3240]'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-[#9AA0A6]">
                Choose your default AI provider. You can change this at any time in Settings.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Object.values(PROVIDER_KINDS).map(p => {
                  const isSelected = selectedProvider === p.kind;
                  return (
                    <div
                      key={p.kind}
                      onClick={() => setSelectedProvider(p.kind)}
                      className={`p-3 rounded-xl border cursor-pointer transition ${
                        isSelected
                          ? 'bg-[#1B222D] border-[#F28C52] text-white'
                          : 'bg-[#0B0E14] border-[#2A3240] text-[#9AA0A6] hover:border-[#3A4557]'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-sm text-white">{p.title}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#F28C52]" />}
                      </div>
                      <span className="text-xs text-[#9AA0A6]">{p.subtitle}</span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2">
                <label className="block text-xs font-medium text-[#9AA0A6] mb-1.5 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-[#F28C52]" />
                  API Key for {PROVIDER_KINDS[selectedProvider]?.title || 'Provider'} (Optional)
                </label>
                <input
                  type="password"
                  placeholder="sk-ant-... or leave empty for offline simulation"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-[#2A3240] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#F28C52] font-mono placeholder:text-gray-600"
                />
                <p className="text-[11px] text-[#9AA0A6] mt-1">
                  Keys are stored encrypted locally via Android Keystore simulation. Never sent to intermediate servers.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#2A3240] bg-[#1B222D]/60 flex justify-between items-center">
          {step > 1 ? (
            <button
              onClick={() => setStep((step - 1) as 1 | 2)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#9AA0A6] hover:text-white border border-[#2A3240] hover:bg-[#2A3240] transition"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep((step + 1) as 2 | 3)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#F28C52] text-black hover:bg-[#ff9c68] transition"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#69D69E] text-black hover:bg-[#7ce4ad] transition shadow-lg shadow-[#69D69E]/20"
            >
              Start Developing <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
