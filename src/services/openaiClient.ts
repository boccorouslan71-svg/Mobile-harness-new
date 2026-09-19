import { CustomOpenAIProvider } from '../types';

export function normalizeChatCompletionsUrl(baseUrl: string): string {
  let clean = (baseUrl || '').trim().replace(/\/+$/, '');
  if (!clean) {
    clean = 'https://api.openai.com/v1';
  }
  if (clean.endsWith('/chat/completions')) {
    return clean;
  }
  if (clean.endsWith('/v1')) {
    return `${clean}/chat/completions`;
  }
  // For standard base hosts like http://localhost:11434 or https://api.openai.com
  return `${clean}/v1/chat/completions`;
}

export interface TestConnectionResult {
  success: boolean;
  message: string;
  latencyMs?: number;
}

export async function testOpenAIEndpoint(
  provider: Pick<CustomOpenAIProvider, 'baseUrl' | 'apiKey' | 'model'>
): Promise<TestConnectionResult> {
  const start = Date.now();
  const endpoint = normalizeChatCompletionsUrl(provider.baseUrl);
  const model = provider.model?.trim() || 'gpt-4o';
  const isReasoningModel = model.startsWith('o1') || model.startsWith('o3');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (provider.apiKey?.trim()) {
      headers['Authorization'] = `Bearer ${provider.apiKey.trim()}`;
    }

    const payload: Record<string, unknown> = {
      model,
      messages: [{ role: 'user', content: 'ping' }],
    };
    if (!isReasoningModel) {
      payload.max_tokens = 5;
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      signal: controller.signal,
      body: JSON.stringify(payload),
    });

    clearTimeout(timeoutId);
    const latency = Date.now() - start;

    if (res.ok) {
      return {
        success: true,
        latencyMs: latency,
        message: `Connection successful (${res.status} OK). Model: ${model}. Latency: ${latency}ms.`,
      };
    }

    let errorDetail = '';
    try {
      const errJson = await res.json();
      errorDetail = errJson.error?.message || errJson.message || JSON.stringify(errJson);
    } catch {
      errorDetail = await res.text().catch(() => '');
    }

    return {
      success: false,
      latencyMs: latency,
      message: `Endpoint returned HTTP ${res.status} ${res.statusText}${errorDetail ? `: ${errorDetail.slice(0, 140)}` : ''}`,
    };
  } catch (err: unknown) {
    const latency = Date.now() - start;
    const error = err as Error;
    if (error.name === 'AbortError') {
      return {
        success: false,
        message: `Connection timed out after 10s on ${endpoint}. Verify the server is running and accessible.`,
      };
    }
    return {
      success: false,
      latencyMs: latency,
      message: `Network error connecting to ${endpoint}: ${error.message || 'Check CORS or server reachability'}`,
    };
  }
}

export async function sendOpenAIChatCompletion(
  provider: Pick<CustomOpenAIProvider, 'baseUrl' | 'apiKey' | 'model'>,
  prompt: string,
  systemPrompt: string = 'You are an autonomous AI coding assistant running in Mobile Harness.'
): Promise<{ text: string; error?: string }> {
  const endpoint = normalizeChatCompletionsUrl(provider.baseUrl);
  const model = provider.model?.trim() || 'gpt-4o';
  const isReasoningModel = model.startsWith('o1') || model.startsWith('o3');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (provider.apiKey?.trim()) {
      headers['Authorization'] = `Bearer ${provider.apiKey.trim()}`;
    }

    const messages = isReasoningModel
      ? [{ role: 'user', content: `${systemPrompt}\n\nTask:\n${prompt}` }]
      : [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ];

    const bodyObj: Record<string, unknown> = {
      model,
      messages,
    };
    if (!isReasoningModel) {
      bodyObj.temperature = 0.7;
      bodyObj.max_tokens = 1500;
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      signal: controller.signal,
      body: JSON.stringify(bodyObj),
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return {
        text: '',
        error: `HTTP ${res.status}: ${errText.slice(0, 200)}`,
      };
    }

    const data = await res.json();
    const choice = data.choices?.[0];
    const reply = choice?.message?.content || choice?.text || '';
    return { text: reply };
  } catch (err: unknown) {
    const error = err as Error;
    return {
      text: '',
      error: error.message || 'Failed to communicate with OpenAI-compatible endpoint',
    };
  }
}
