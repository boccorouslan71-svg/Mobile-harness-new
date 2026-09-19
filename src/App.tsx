import React, { useState, useEffect } from 'react';
import {
  Project,
  ProjectChat,
  ChatMessage,
  WorkspaceEntry,
  TopLevelScreen,
  AppThemeMode,
  DevStackId,
  ProviderProfile,
  ProviderKind,
} from './types';
import { StorageService } from './services/storage';
import { generateQuickChatIdentity, INITIAL_PROJECTS, PROVIDER_KINDS } from './data/defaultData';
import { AppHeader } from './components/AppHeader';
import { BottomNavBar } from './components/BottomNavBar';
import { ProjectsScreen } from './components/ProjectsScreen';
import { WorkspaceView } from './components/WorkspaceView';
import { StandaloneTerminal } from './components/StandaloneTerminal';
import { SettingsScreen } from './components/SettingsScreen';
import { OnboardingModal } from './components/OnboardingModal';
import { NewProjectModal } from './components/NewProjectModal';

export const App: React.FC = () => {
  // Navigation State
  const [currentScreen, setCurrentScreen] = useState<TopLevelScreen>('PROJECTS');
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeChatId, setActiveChatId] = useState<string>('');

  // Core Data State
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeFiles, setActiveFiles] = useState<WorkspaceEntry[]>([]);
  const [activeChats, setActiveChats] = useState<ProjectChat[]>([]);
  const [activeMessages, setActiveMessages] = useState<ChatMessage[]>([]);
  const [provider, setProvider] = useState<ProviderProfile>(StorageService.getProvider());
  const [themeMode, setThemeMode] = useState<AppThemeMode>(StorageService.getThemeMode());
  const [selectedStacks, setSelectedStacks] = useState<DevStackId[]>(StorageService.getSelectedStacks());

  // Modal State
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    const loadedProjects = StorageService.getProjects();
    setProjects(loadedProjects);

    // If onboarding hasn't been completed before, show it
    if (!StorageService.getOnboardingComplete()) {
      setShowOnboarding(true);
    }
  }, []);

  // When activeProject changes, load its files, chats, and messages
  useEffect(() => {
    if (activeProject) {
      const files = StorageService.getFiles(activeProject.id);
      setActiveFiles(files);

      const chats = StorageService.getProjectChats(activeProject.id);
      setActiveChats(chats);

      const targetChatId = chats[0]?.id || `chat-${Date.now()}`;
      setActiveChatId(targetChatId);

      const msgs = StorageService.getMessages(targetChatId);
      setActiveMessages(msgs);
    }
  }, [activeProject]);

  // When activeChatId changes, load messages for that chat
  useEffect(() => {
    if (activeChatId) {
      const msgs = StorageService.getMessages(activeChatId);
      setActiveMessages(msgs);
    }
  }, [activeChatId]);

  // Apply theme class to document
  useEffect(() => {
    if (themeMode === 'DARK' || (themeMode === 'SYSTEM' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#0B0E14';
      document.body.style.color = '#FFFFFF';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#F6F8FA';
      document.body.style.color = '#1F2328';
    }
  }, [themeMode]);

  // Handler: Open Project
  const handleOpenProject = (project: Project) => {
    setActiveProject(project);
    setCurrentScreen('PROJECTS');
  };

  // Handler: Back from Workspace
  const handleBackToProjects = () => {
    setActiveProject(null);
  };

  // Handler: Quick Project
  const handleQuickProject = () => {
    const { displayName, slug } = generateQuickChatIdentity();
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: displayName,
      description: `Rapid ad-hoc autonomous coding session in ARM64 sandbox.`,
      slug,
      rootPath: '',
      language: 'TypeScript',
      kind: 'QUICK_PROJECT',
      updatedAtMillis: Date.now(),
    };

    const updated = [newProj, ...projects];
    setProjects(updated);
    StorageService.saveProjects(updated);
    handleOpenProject(newProj);
  };

  // Handler: Create Named Project
  const handleCreateProject = (projectData: Omit<Project, 'id' | 'updatedAtMillis'>) => {
    const newProj: Project = {
      ...projectData,
      id: `proj-${Date.now()}`,
      updatedAtMillis: Date.now(),
    };

    const updated = [newProj, ...projects];
    setProjects(updated);
    StorageService.saveProjects(updated);
    handleOpenProject(newProj);
  };

  // Handler: Delete Project
  const handleDeleteProject = (projectId: string) => {
    const updated = projects.filter(p => p.id !== projectId);
    setProjects(updated);
    StorageService.saveProjects(updated);
    if (activeProject?.id === projectId) {
      setActiveProject(null);
    }
  };

  // Handler: Create New Chat in Active Project
  const handleCreateChat = () => {
    if (!activeProject) return;
    const newChat: ProjectChat = {
      id: `chat-${Date.now()}`,
      title: `Session ${activeChats.length + 1}`,
      createdAtMillis: Date.now(),
      updatedAtMillis: Date.now(),
    };
    const updatedChats = [...activeChats, newChat];
    setActiveChats(updatedChats);
    StorageService.saveProjectChats(activeProject.id, updatedChats);
    setActiveChatId(newChat.id);
  };

  // Handler: Update Files in Active Project
  const handleUpdateFiles = (updatedFiles: WorkspaceEntry[]) => {
    setActiveFiles(updatedFiles);
    if (activeProject) {
      StorageService.saveFiles(activeProject.id, updatedFiles);
    }
  };

  // Handler: Update Messages in Active Chat
  const handleUpdateMessages = (chatId: string, updatedMessages: ChatMessage[]) => {
    setActiveMessages(updatedMessages);
    StorageService.saveMessages(chatId, updatedMessages);
  };

  // Handler: Toggle Theme
  const handleToggleTheme = () => {
    const nextTheme: AppThemeMode = themeMode === 'DARK' ? 'LIGHT' : 'DARK';
    setThemeMode(nextTheme);
    StorageService.setThemeMode(nextTheme);
  };

  // Handler: Finish Onboarding
  const handleCompleteOnboarding = (stacks: DevStackId[], providerKind: ProviderKind, apiKey: string) => {
    StorageService.setOnboardingComplete(true);
    StorageService.setSelectedStacks(stacks);
    setSelectedStacks(stacks);

    if (apiKey) {
      StorageService.saveSecret(providerKind, apiKey);
    }

    const meta = PROVIDER_KINDS[providerKind];
    let customProviderId: string | undefined;
    let customName: string | undefined;
    let baseUrl = meta?.defaultBaseUrl || '';
    let model = meta?.defaultModel || '';

    if (providerKind === 'CUSTOM_OPENAI') {
      const customList = StorageService.getCustomOpenAIProviders();
      if (customList.length > 0) {
        customProviderId = customList[0].id;
        customName = customList[0].name;
        baseUrl = customList[0].baseUrl;
        model = customList[0].model;
        if (apiKey) {
          StorageService.updateCustomOpenAIProvider(customList[0].id, { apiKey });
        }
      }
    }

    const newProvider: ProviderProfile = {
      kind: providerKind,
      baseUrl,
      model,
      customProviderId,
      customName,
      hasSecret: !!apiKey,
    };
    setProvider(newProvider);
    StorageService.saveProvider(newProvider);
    setShowOnboarding(false);
  };

  // Handler: Reset Workspace
  const handleResetWorkspace = () => {
    localStorage.clear();
    StorageService.saveProjects(INITIAL_PROJECTS);
    setProjects(INITIAL_PROJECTS);
    setActiveProject(null);
    setProvider(StorageService.getProvider());
    setSelectedStacks(['WEB', 'PYTHON']);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0E14] text-[#E6EDF3] selection:bg-[#F28C52]/30 selection:text-white">
      {/* Top Header */}
      <AppHeader
        currentScreen={currentScreen}
        themeMode={themeMode}
        onSelectScreen={(screen) => {
          setActiveProject(null);
          setCurrentScreen(screen);
        }}
        onToggleTheme={handleToggleTheme}
        onOpenWizard={() => setShowOnboarding(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-20 md:pb-8">
        {activeProject ? (
          <WorkspaceView
            project={activeProject}
            chats={activeChats}
            activeChatId={activeChatId}
            files={activeFiles}
            messages={activeMessages}
            provider={provider}
            onUpdateProvider={(newProfile) => {
              setProvider(newProfile);
              StorageService.saveProvider(newProfile);
            }}
            onBack={handleBackToProjects}
            onSelectChat={setActiveChatId}
            onCreateChat={handleCreateChat}
            onUpdateFiles={handleUpdateFiles}
            onUpdateMessages={handleUpdateMessages}
            onRunBuild={() => {
              // Trigger build command in workspace
              const newMsg: ChatMessage = {
                id: `msg-build-${Date.now()}`,
                fromUser: true,
                text: 'Run npm run build',
                createdAt: new Date().toISOString(),
              };
              handleUpdateMessages(activeChatId, [...activeMessages, newMsg]);
            }}
          />
        ) : (
          <>
            {currentScreen === 'PROJECTS' && (
              <ProjectsScreen
                projects={projects}
                onOpenProject={handleOpenProject}
                onNewProject={() => setShowNewProjectModal(true)}
                onQuickProject={handleQuickProject}
                onDeleteProject={handleDeleteProject}
              />
            )}

            {currentScreen === 'TERMINAL' && <StandaloneTerminal />}

            {currentScreen === 'SETTINGS' && (
              <SettingsScreen
                provider={provider}
                themeMode={themeMode}
                selectedStacks={selectedStacks}
                onUpdateProvider={(newProfile) => {
                  setProvider(newProfile);
                  StorageService.saveProvider(newProfile);
                }}
                onUpdateTheme={(mode) => {
                  setThemeMode(mode);
                  StorageService.setThemeMode(mode);
                }}
                onUpdateStacks={(newStacks) => {
                  setSelectedStacks(newStacks);
                  StorageService.setSelectedStacks(newStacks);
                }}
                onRestartWizard={() => setShowOnboarding(true)}
                onResetWorkspace={handleResetWorkspace}
              />
            )}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNavBar
        currentScreen={currentScreen}
        onSelectScreen={(screen) => {
          setActiveProject(null);
          setCurrentScreen(screen);
        }}
      />

      {/* Onboarding Wizard Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={handleCompleteOnboarding}
        onClose={() => setShowOnboarding(false)}
      />

      {/* New Project Dialog */}
      <NewProjectModal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        onCreate={handleCreateProject}
      />
    </div>
  );
};

export default App;
