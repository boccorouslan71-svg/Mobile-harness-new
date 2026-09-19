import {
  Project,
  ProjectChat,
  ChatMessage,
  WorkspaceEntry,
  ProviderProfile,
  AppThemeMode,
  DevStackId,
  CustomOpenAIProvider,
} from '../types';
import {
  INITIAL_PROJECTS,
  INITIAL_FILES,
  INITIAL_CHATS,
  INITIAL_MESSAGES,
  PROVIDER_KINDS,
  INITIAL_CUSTOM_OPENAI_PROVIDERS,
} from '../data/defaultData';

const STORAGE_KEYS = {
  ONBOARDING: 'mh_onboarding_complete',
  BACKGROUND_SETUP: 'mh_background_setup',
  THEME_MODE: 'mh_theme_mode',
  SELECTED_STACKS: 'mh_selected_stacks',
  PROJECTS: 'mh_projects',
  FILES_PREFIX: 'mh_files_',
  CHATS_PREFIX: 'mh_chats_',
  MESSAGES_PREFIX: 'mh_messages_',
  PROVIDER: 'mh_provider',
  VAULT_PREFIX: 'mh_vault_',
  CUSTOM_OPENAI_PROVIDERS: 'mh_custom_openai_providers',
};

export const StorageService = {
  getOnboardingComplete(): boolean {
    const val = localStorage.getItem(STORAGE_KEYS.ONBOARDING);
    return val ? JSON.parse(val) : true; // Default true so user directly lands on fully functional app!
  },
  setOnboardingComplete(val: boolean) {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING, JSON.stringify(val));
  },

  getBackgroundSetupComplete(): boolean {
    const val = localStorage.getItem(STORAGE_KEYS.BACKGROUND_SETUP);
    return val ? JSON.parse(val) : true;
  },
  setBackgroundSetupComplete(val: boolean) {
    localStorage.setItem(STORAGE_KEYS.BACKGROUND_SETUP, JSON.stringify(val));
  },

  getThemeMode(): AppThemeMode {
    const val = localStorage.getItem(STORAGE_KEYS.THEME_MODE);
    return (val as AppThemeMode) || 'DARK';
  },
  setThemeMode(mode: AppThemeMode) {
    localStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
  },

  getSelectedStacks(): DevStackId[] {
    const val = localStorage.getItem(STORAGE_KEYS.SELECTED_STACKS);
    if (!val) return ['WEB', 'PYTHON'];
    try {
      return JSON.parse(val);
    } catch {
      return ['WEB', 'PYTHON'];
    }
  },
  setSelectedStacks(stacks: DevStackId[]) {
    localStorage.setItem(STORAGE_KEYS.SELECTED_STACKS, JSON.stringify(stacks));
  },

  getProjects(): Project[] {
    const val = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!val) {
      this.saveProjects(INITIAL_PROJECTS);
      return INITIAL_PROJECTS;
    }
    try {
      return JSON.parse(val);
    } catch {
      return INITIAL_PROJECTS;
    }
  },
  saveProjects(projects: Project[]) {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  },

  getFiles(projectId: string): WorkspaceEntry[] {
    const val = localStorage.getItem(STORAGE_KEYS.FILES_PREFIX + projectId);
    if (!val) {
      const init = INITIAL_FILES[projectId] || [
        {
          path: 'README.md',
          name: 'README.md',
          isDirectory: false,
          depth: 0,
          sizeBytes: 120,
          content: `# ${projectId}\nWorkspace initialized in Mobile Harness.`,
        },
      ];
      this.saveFiles(projectId, init);
      return init;
    }
    try {
      return JSON.parse(val);
    } catch {
      return [];
    }
  },
  saveFiles(projectId: string, files: WorkspaceEntry[]) {
    localStorage.setItem(STORAGE_KEYS.FILES_PREFIX + projectId, JSON.stringify(files));
  },

  getProjectChats(projectId: string): ProjectChat[] {
    const val = localStorage.getItem(STORAGE_KEYS.CHATS_PREFIX + projectId);
    if (!val) {
      const init = INITIAL_CHATS[projectId] || [
        {
          id: `chat-${Date.now()}`,
          title: 'Main Chat',
          createdAtMillis: Date.now(),
          updatedAtMillis: Date.now(),
        },
      ];
      this.saveProjectChats(projectId, init);
      return init;
    }
    try {
      return JSON.parse(val);
    } catch {
      return [];
    }
  },
  saveProjectChats(projectId: string, chats: ProjectChat[]) {
    localStorage.setItem(STORAGE_KEYS.CHATS_PREFIX + projectId, JSON.stringify(chats));
  },

  getMessages(chatId: string): ChatMessage[] {
    const val = localStorage.getItem(STORAGE_KEYS.MESSAGES_PREFIX + chatId);
    if (!val) {
      const init = INITIAL_MESSAGES[chatId] || [
        {
          id: `msg-${Date.now()}`,
          fromUser: false,
          text: 'Hi! I am your autonomous AI coding agent in Mobile Harness. What would you like to build or run?',
          createdAt: new Date().toISOString(),
        },
      ];
      this.saveMessages(chatId, init);
      return init;
    }
    try {
      return JSON.parse(val);
    } catch {
      return [];
    }
  },
  saveMessages(chatId: string, messages: ChatMessage[]) {
    localStorage.setItem(STORAGE_KEYS.MESSAGES_PREFIX + chatId, JSON.stringify(messages));
  },

  getProvider(): ProviderProfile {
    const val = localStorage.getItem(STORAGE_KEYS.PROVIDER);
    if (!val) {
      const defaultKind = 'ANTHROPIC';
      const meta = PROVIDER_KINDS[defaultKind];
      return {
        kind: 'ANTHROPIC',
        baseUrl: meta.defaultBaseUrl,
        model: meta.defaultModel,
        hasSecret: !!this.getSecret('ANTHROPIC'),
      };
    }
    try {
      const parsed: ProviderProfile = JSON.parse(val);
      if (parsed.kind === 'CUSTOM_OPENAI' && parsed.customProviderId) {
        const customs = this.getCustomOpenAIProviders();
        const found = customs.find(c => c.id === parsed.customProviderId);
        if (found) {
          parsed.baseUrl = found.baseUrl;
          parsed.model = found.model;
          parsed.customName = found.name;
          parsed.hasSecret = !!found.apiKey.trim();
          return parsed;
        }
      }
      parsed.hasSecret = parsed.kind === 'CUSTOM_OPENAI'
        ? !!this.getSecret('CUSTOM_OPENAI')
        : !!this.getSecret(parsed.kind);
      return parsed;
    } catch {
      return {
        kind: 'ANTHROPIC',
        baseUrl: 'https://api.anthropic.com',
        model: 'claude-3-7-sonnet-latest',
        hasSecret: false,
      };
    }
  },
  saveProvider(profile: ProviderProfile) {
    localStorage.setItem(STORAGE_KEYS.PROVIDER, JSON.stringify(profile));
  },

  getCustomOpenAIProviders(): CustomOpenAIProvider[] {
    const val = localStorage.getItem(STORAGE_KEYS.CUSTOM_OPENAI_PROVIDERS);
    if (val === null) {
      this.saveCustomOpenAIProviders(INITIAL_CUSTOM_OPENAI_PROVIDERS);
      return INITIAL_CUSTOM_OPENAI_PROVIDERS;
    }
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return INITIAL_CUSTOM_OPENAI_PROVIDERS;
    } catch {
      return INITIAL_CUSTOM_OPENAI_PROVIDERS;
    }
  },

  saveCustomOpenAIProviders(providers: CustomOpenAIProvider[]) {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_OPENAI_PROVIDERS, JSON.stringify(providers));
  },

  addCustomOpenAIProvider(provider: Omit<CustomOpenAIProvider, 'id' | 'createdAtMillis'>): CustomOpenAIProvider {
    const current = this.getCustomOpenAIProviders();
    const newEntry: CustomOpenAIProvider = {
      ...provider,
      id: `cop-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAtMillis: Date.now(),
    };
    const updated = [...current, newEntry];
    this.saveCustomOpenAIProviders(updated);
    return newEntry;
  },

  updateCustomOpenAIProvider(id: string, updates: Partial<CustomOpenAIProvider>): CustomOpenAIProvider | null {
    const current = this.getCustomOpenAIProviders();
    const idx = current.findIndex(p => p.id === id);
    if (idx === -1) return null;
    const updatedEntry = { ...current[idx], ...updates };
    current[idx] = updatedEntry;
    this.saveCustomOpenAIProviders(current);

    // If this is currently the active provider, update the active profile as well
    const active = this.getProvider();
    if (active.kind === 'CUSTOM_OPENAI' && active.customProviderId === id) {
      this.saveProvider({
        ...active,
        baseUrl: updatedEntry.baseUrl,
        model: updatedEntry.model,
        customName: updatedEntry.name,
        hasSecret: !!updatedEntry.apiKey.trim(),
      });
    }
    return updatedEntry;
  },

  deleteCustomOpenAIProvider(id: string) {
    const current = this.getCustomOpenAIProviders();
    const filtered = current.filter(p => p.id !== id);
    this.saveCustomOpenAIProviders(filtered);

    // If deleted provider was the active one, fallback to another or Anthropic
    const active = this.getProvider();
    if (active.kind === 'CUSTOM_OPENAI' && active.customProviderId === id) {
      if (filtered.length > 0) {
        const next = filtered[0];
        this.saveProvider({
          kind: 'CUSTOM_OPENAI',
          baseUrl: next.baseUrl,
          model: next.model,
          customProviderId: next.id,
          customName: next.name,
          hasSecret: !!next.apiKey.trim(),
        });
      } else {
        const defaultKind = 'ANTHROPIC';
        const meta = PROVIDER_KINDS[defaultKind];
        this.saveProvider({
          kind: 'ANTHROPIC',
          baseUrl: meta.defaultBaseUrl,
          model: meta.defaultModel,
          hasSecret: !!this.getSecret('ANTHROPIC'),
        });
      }
    }
  },

  getSecret(kind: string): string {
    return localStorage.getItem(STORAGE_KEYS.VAULT_PREFIX + kind) || '';
  },
  saveSecret(kind: string, secret: string) {
    if (!secret.trim()) {
      localStorage.removeItem(STORAGE_KEYS.VAULT_PREFIX + kind);
    } else {
      localStorage.setItem(STORAGE_KEYS.VAULT_PREFIX + kind, secret.trim());
    }
  },
};
