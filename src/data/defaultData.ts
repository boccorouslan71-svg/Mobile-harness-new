import { DevStackInfo, ProviderKindMeta, Project, WorkspaceEntry, ProjectChat, ChatMessage, CustomOpenAIProvider } from '../types';

export const PROVIDER_KINDS: Record<string, ProviderKindMeta> = {
  CLAUDE: {
    kind: 'CLAUDE',
    title: 'Claude subscription',
    subtitle: 'Pro, Max, Team or Enterprise',
    protocol: 'CLAUDE_LOGIN',
    defaultBaseUrl: '',
    defaultModel: 'default',
  },
  ANTHROPIC: {
    kind: 'ANTHROPIC',
    title: 'Anthropic API',
    subtitle: 'Usage billed through Console',
    protocol: 'ANTHROPIC',
    defaultBaseUrl: 'https://api.anthropic.com',
    defaultModel: 'claude-3-7-sonnet-latest',
  },
  LLM_ROUTER: {
    kind: 'LLM_ROUTER',
    title: 'OpenRouter',
    subtitle: 'Use your OpenRouter API key',
    protocol: 'OPENROUTER',
    defaultBaseUrl: 'https://openrouter.ai/api',
    defaultModel: 'anthropic/claude-3.7-sonnet',
  },
  DEEPSEEK: {
    kind: 'DEEPSEEK',
    title: 'DeepSeek',
    subtitle: 'Use your DeepSeek API key',
    protocol: 'ANTHROPIC_GATEWAY',
    defaultBaseUrl: 'https://api.deepseek.com/anthropic',
    defaultModel: 'deepseek-v4-flash',
  },
  KIMI: {
    kind: 'KIMI',
    title: 'Kimi',
    subtitle: 'Anthropic-compatible endpoint',
    protocol: 'ANTHROPIC_GATEWAY',
    defaultBaseUrl: 'https://api.moonshot.ai/anthropic',
    defaultModel: 'kimi-k2.6',
    experimental: true,
  },
  CUSTOM: {
    kind: 'CUSTOM',
    title: 'Custom API (Anthropic)',
    subtitle: 'Anthropic-compatible gateway',
    protocol: 'ANTHROPIC_GATEWAY',
    defaultBaseUrl: '',
    defaultModel: '',
    experimental: true,
  },
  CUSTOM_OPENAI: {
    kind: 'CUSTOM_OPENAI',
    title: 'Custom OpenAI',
    subtitle: 'OpenAI-compatible endpoints (Ollama, vLLM, Groq, OpenAI, etc.)',
    protocol: 'OPENAI_CHAT',
    defaultBaseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o',
    experimental: false,
  },
};

export const INITIAL_CUSTOM_OPENAI_PROVIDERS: CustomOpenAIProvider[] = [
  {
    id: 'openai-gpt4o',
    name: 'OpenAI (GPT-4o)',
    baseUrl: 'https://api.openai.com/v1',
    apiKey: '',
    model: 'gpt-4o',
    createdAtMillis: 1710000000000,
  },
  {
    id: 'ollama-local',
    name: 'Ollama (Local)',
    baseUrl: 'http://localhost:11434/v1',
    apiKey: '',
    model: 'llama3:latest',
    createdAtMillis: 1710000001000,
  },
];

export const DEV_STACKS: DevStackInfo[] = [
  {
    id: 'WEB',
    label: 'Web (JavaScript / TypeScript)',
    description: 'Websites and web apps with HTML, CSS, and modern JS frameworks.',
    installsSummary: 'Node.js 22, npm, Vite, TypeScript, Tailwind (already active)',
    sizeMb: 45,
    command: 'node -v && npm -v',
  },
  {
    id: 'PYTHON',
    label: 'Python',
    description: 'Scripts, automation, data science, and Python web backends.',
    installsSummary: 'python3.11, pip, virtualenv, and essential scientific C-extensions',
    sizeMb: 140,
    command: 'python3 --version && pip --version',
  },
  {
    id: 'ANDROID',
    label: 'Android (Java / Kotlin)',
    description: 'Build Android app projects and install them directly on this device.',
    installsSummary: 'JDK 17, ARM64 Android SDK 36, Build Tools 35, Gradle 8.14.3',
    sizeMb: 360,
    command: 'java -version && ./gradlew --version',
  },
  {
    id: 'CPP',
    label: 'C / C++',
    description: 'Fast compiled programs, algorithms, systems code, and native libs.',
    installsSummary: 'gcc, g++, make, cmake, gdb for ARM64',
    sizeMb: 110,
    command: 'gcc --version && cmake --version',
  },
  {
    id: 'PHP',
    label: 'PHP',
    description: 'Websites and apps with PHP — classic sites and Laravel projects.',
    installsSummary: 'php-cli 8.3, common extensions, and Composer',
    sizeMb: 85,
    command: 'php -v && composer --version',
  },
];

export function generateQuickChatIdentity(usedSlugs: Set<string> = new Set()): { displayName: string; slug: string } {
  const adjectives = ['bright', 'calm', 'clever', 'curious', 'gentle', 'nimble', 'quiet', 'swift', 'wise', 'bold'];
  const pioneers = ['turing', 'lovelace', 'hopper', 'tesla', 'curie', 'ramanujan', 'bose', 'kalam', 'faraday', 'darwin'];

  for (let i = 0; i < 20; i++) {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const pio = pioneers[Math.floor(Math.random() * pioneers.length)];
    const slug = `${adj}-${pio}`;
    if (!usedSlugs.has(slug)) {
      const displayName = slug
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      return { displayName, slug };
    }
  }

  const base = `${adjectives[0]}-${pioneers[0]}`;
  let suffix = 2;
  while (usedSlugs.has(`${base}-${suffix}`)) {
    suffix++;
  }
  const slug = `${base}-${suffix}`;
  const displayName = slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  return { displayName, slug };
}

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-ecommerce-harness',
    name: 'Nimbus Storefront',
    description: 'High-performance ecommerce web application with Vite and Tailwind',
    language: 'TypeScript',
    slug: 'nimbus-storefront',
    rootPath: '',
    updatedAtMillis: Date.now() - 1000 * 60 * 18,
    kind: 'PROJECT',
  },
  {
    id: 'proj-crypto-agent',
    name: 'Curious Turing',
    description: 'Autonomous quick project exploring real-time market telemetry',
    language: 'Python',
    slug: 'curious-turing',
    rootPath: '',
    updatedAtMillis: Date.now() - 1000 * 60 * 60 * 2,
    kind: 'QUICK_PROJECT',
  },
  {
    id: 'proj-android-weather',
    name: 'Pulse Android Native',
    description: 'Jetpack Compose native weather tracking app with local SQLite cache',
    language: 'Kotlin',
    slug: 'pulse-android-native',
    rootPath: '',
    updatedAtMillis: Date.now() - 1000 * 60 * 60 * 26,
    kind: 'PROJECT',
  },
];

export const INITIAL_FILES: Record<string, WorkspaceEntry[]> = {
  'proj-ecommerce-harness': [
    {
      path: 'package.json',
      name: 'package.json',
      isDirectory: false,
      depth: 0,
      sizeBytes: 864,
      content: `{\n  "name": "nimbus-storefront",\n  "version": "0.1.0",\n  "type": "module",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build",\n    "preview": "vite preview"\n  },\n  "dependencies": {\n    "react": "^18.3.1",\n    "react-dom": "^18.3.1",\n    "lucide-react": "^0.475.0"\n  }\n}`,
    },
    {
      path: 'src',
      name: 'src',
      isDirectory: true,
      depth: 0,
      sizeBytes: 0,
    },
    {
      path: 'src/App.tsx',
      name: 'App.tsx',
      isDirectory: false,
      depth: 1,
      sizeBytes: 1940,
      content: `import React, { useState } from 'react';\nimport { ShoppingBag, Sparkles, Zap, Shield } from 'lucide-react';\n\nexport default function App() {\n  const [cart, setCart] = useState<number>(0);\n\n  return (\n    <div className="min-h-screen bg-[#0b0e14] text-white p-6 font-sans">\n      <header className="flex justify-between items-center py-4 border-b border-gray-800">\n        <div className="flex items-center gap-2">\n          <Sparkles className="text-orange-400 w-6 h-6" />\n          <h1 className="text-xl font-bold tracking-tight">Nimbus Shop</h1>\n        </div>\n        <button onClick={() => setCart(c => c + 1)} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg text-sm font-medium">\n          <ShoppingBag className="w-4 h-4" /> Cart ({cart})\n        </button>\n      </header>\n      <main className="max-w-4xl mx-auto mt-12 text-center">\n        <h2 className="text-4xl font-extrabold mb-4">Autonomous Mobile Commerce</h2>\n        <p className="text-gray-400 max-w-lg mx-auto mb-8">Crafted inside Mobile Harness directly on ARM64 Linux PRoot runtime.</p>\n      </main>\n    </div>\n  );\n}`,
    },
    {
      path: 'src/index.css',
      name: 'index.css',
      isDirectory: false,
      depth: 1,
      sizeBytes: 310,
      content: `@import "tailwindcss";\n\nbody {\n  margin: 0;\n  background: #0b0e14;\n  color: #e6edf3;\n}`,
    },
    {
      path: 'README.md',
      name: 'README.md',
      isDirectory: false,
      depth: 0,
      sizeBytes: 420,
      content: `# Nimbus Storefront\n\nDeveloped in Mobile Harness on Android PRoot.\n\n### Running:\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n`,
    },
  ],
  'proj-crypto-agent': [
    {
      path: 'agent.py',
      name: 'agent.py',
      isDirectory: false,
      depth: 0,
      sizeBytes: 1120,
      content: 'import sys\nimport time\nimport math\n\ndef run_pipeline():\n    print("Starting market telemetry agent...")\n    for i in range(5):\n        val = 45000 + math.sin(i) * 500\n        print(f"[{time.strftime(\'%H:%M:%S\')}] BTC/USD: ${val:.2f} | Status: Healthy")\n        time.sleep(0.5)\n    print("Pipeline run completed successfully.")\n\nif __name__ == "__main__":\n    run_pipeline()\n',
    },
    {
      path: 'requirements.txt',
      name: 'requirements.txt',
      isDirectory: false,
      depth: 0,
      sizeBytes: 52,
      content: `requests>=2.31.0\nnumpy>=1.26.0\n`,
    },
  ],
  'proj-android-weather': [
    {
      path: 'app/build.gradle.kts',
      name: 'build.gradle.kts',
      isDirectory: false,
      depth: 1,
      sizeBytes: 780,
      content: `plugins {\n    id("com.android.application")\n    id("org.jetbrains.kotlin.android")\n}\n\nandroid {\n    namespace = "com.pulse.weather"\n    compileSdk = 35\n}`,
    },
    {
      path: 'MainActivity.kt',
      name: 'MainActivity.kt',
      isDirectory: false,
      depth: 0,
      sizeBytes: 940,
      content: `package com.pulse.weather\n\nimport android.os.Bundle\nimport androidx.activity.ComponentActivity\nimport androidx.activity.compose.setContent\n\nclass MainActivity : ComponentActivity() {\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n        setContent {\n            WeatherApp()\n        }\n    }\n}`,
    },
  ],
};

export const INITIAL_CHATS: Record<string, ProjectChat[]> = {
  'proj-ecommerce-harness': [
    {
      id: 'chat-main',
      title: 'Storefront Setup & Hero',
      createdAtMillis: Date.now() - 1000 * 60 * 60,
      updatedAtMillis: Date.now() - 1000 * 60 * 18,
    },
    {
      id: 'chat-cart',
      title: 'Cart Drawer Implementation',
      createdAtMillis: Date.now() - 1000 * 60 * 120,
      updatedAtMillis: Date.now() - 1000 * 60 * 95,
    },
  ],
  'proj-crypto-agent': [
    {
      id: 'chat-telemetry',
      title: 'Telemetry loop setup',
      createdAtMillis: Date.now() - 1000 * 60 * 150,
      updatedAtMillis: Date.now() - 1000 * 60 * 120,
    },
  ],
  'proj-android-weather': [
    {
      id: 'chat-compose',
      title: 'Compose architecture setup',
      createdAtMillis: Date.now() - 1000 * 60 * 200,
      updatedAtMillis: Date.now() - 1000 * 60 * 160,
    },
  ],
};

export const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'chat-main': [
    {
      id: 'm-1',
      fromUser: true,
      text: 'Create a clean, responsive mobile storefront with cart counter and Tailwind dark theme.',
      createdAt: new Date(Date.now() - 1000 * 60 * 19).toISOString(),
    },
    {
      id: 'm-2',
      fromUser: false,
      text: "I've structured the Nimbus storefront with high-contrast typography, interactive state hooks, and simulated a live dev preview on port 3000.",
      createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      thinkingSummary: 'Examined requirements -> Created src/App.tsx with Lucide icons -> Checked preview URL',
      workItems: [
        { title: 'Write File', detail: 'src/App.tsx (62 lines created)', isComplete: true, isCommand: false },
        { title: 'Run Command', detail: 'npm run build', isComplete: true, isCommand: true },
        { title: 'Live Preview', detail: 'Dev server ready at http://localhost:3000', isComplete: true, isCommand: false },
      ],
      workedMillis: 4200,
      tokensCount: 540,
    },
  ],
  'chat-telemetry': [
    {
      id: 'm-3',
      fromUser: true,
      text: 'Write a python script that logs mock BTC telemetry with timestamps.',
      createdAt: new Date(Date.now() - 1000 * 60 * 121).toISOString(),
    },
    {
      id: 'm-4',
      fromUser: false,
      text: "Created `agent.py` and verified execution inside the Ubuntu PRoot sandbox with python3.",
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      workItems: [
        { title: 'Write File', detail: 'agent.py', isComplete: true, isCommand: false },
        { title: 'Run Command', detail: 'python3 agent.py', isComplete: true, isCommand: true },
      ],
      workedMillis: 2300,
    },
  ],
  'chat-compose': [
    {
      id: 'm-5',
      fromUser: true,
      text: 'Setup the base Gradle files for the Android Compose Weather app.',
      createdAt: new Date(Date.now() - 1000 * 60 * 162).toISOString(),
    },
    {
      id: 'm-6',
      fromUser: false,
      text: "Scaffolded `MainActivity.kt` and `build.gradle.kts` targeting Android 35 with Compose BOM.",
      createdAt: new Date(Date.now() - 1000 * 60 * 160).toISOString(),
    },
  ],
};
