export type ProviderProtocol =
  | 'CLAUDE_LOGIN'
  | 'ANTHROPIC'
  | 'ANTHROPIC_GATEWAY'
  | 'OPENROUTER'
  | 'OPENAI_RESPONSES'
  | 'OPENAI_CHAT';

export type ProviderKind =
  | 'CLAUDE'
  | 'ANTHROPIC'
  | 'LLM_ROUTER'
  | 'DEEPSEEK'
  | 'KIMI'
  | 'CUSTOM';

export interface ProviderKindMeta {
  kind: ProviderKind;
  title: string;
  subtitle: string;
  protocol: ProviderProtocol;
  defaultBaseUrl: string;
  defaultModel: string;
  experimental?: boolean;
}

export interface ProviderProfile {
  kind: ProviderKind;
  baseUrl: string;
  model: string;
  hasSecret: boolean;
}

export type ProjectKind = 'PROJECT' | 'QUICK_PROJECT';

export interface Project {
  id: string;
  name: string;
  description: string;
  language: string;
  slug: string;
  rootPath: string;
  updatedAtMillis: number;
  kind: ProjectKind;
}

export interface WorkspaceEntry {
  path: string;
  name: string;
  isDirectory: boolean;
  depth: number;
  sizeBytes: number;
  content?: string;
}

export type DevStackId = 'WEB' | 'PYTHON' | 'ANDROID' | 'CPP' | 'PHP';

export interface DevStackInfo {
  id: DevStackId;
  label: string;
  description: string;
  installsSummary: string;
  sizeMb: number;
  command: string;
}

export type RiskLevel = 'SAFE' | 'REVIEW' | 'HIGH';

export interface ToolRequest {
  approvalId: string;
  sessionId: string;
  toolName: string;
  explanation: string;
  affectedPaths: string[];
  commandPreview?: string;
  risk: RiskLevel;
}

export type DiffLineType = 'CONTEXT' | 'ADDITION' | 'DELETION' | 'INFO';

export interface DiffLine {
  type: DiffLineType;
  text: string;
  oldLine?: number;
  newLine?: number;
}

export interface ChangeItem {
  path: string;
  additions: number;
  deletions: number;
  diffLines: DiffLine[];
  binary?: boolean;
  accepted?: boolean | null;
}

export interface ActivityItem {
  title: string;
  detail: string;
  isComplete: boolean;
  isCommand: boolean;
}

export interface ChatAttachment {
  id: string;
  displayName: string;
  relativePath: string;
  mimeType: string;
  sizeBytes: number;
  content?: string;
}

export interface ChatMessage {
  id: string;
  fromUser: boolean;
  text: string;
  createdAt: string;
  attachments?: ChatAttachment[];
  workItems?: ActivityItem[];
  workedMillis?: number;
  thinkingSummary?: string;
  tokensCount?: number;
}

export interface ProjectChat {
  id: string;
  title: string;
  createdAtMillis: number;
  updatedAtMillis: number;
}

export interface TerminalOutputLine {
  id: string;
  command: string;
  output: string;
  exitCode: number;
  cwd?: string;
  timestamp: number;
}

export type AppThemeMode = 'DARK' | 'LIGHT' | 'SYSTEM';

export type StartupStage =
  | 'CHECKING'
  | 'SETUP_REQUIRED'
  | 'INSTALLING'
  | 'MODEL_SETUP'
  | 'INITIALIZING'
  | 'READY'
  | 'ERROR';

export type RootScreen = 'PROJECTS' | 'TERMINAL' | 'SETTINGS';
export type TopLevelScreen = RootScreen;
export type WorkspaceTab = 'CHAT' | 'FILES' | 'TERMINAL' | 'CHANGES' | 'PREVIEW';
