
import type { Provider, Model } from './types';

export const ADMIN_EMAIL = 'jasimd931@gmail.com';
export const INVITE_CODE = 'FAMILY2024';

export const providers: Provider[] = [
  { id: 'google', name: 'Google', color: '#4285f4' },
  { id: 'cerebras', name: 'Cerebras', color: '#8b5cf6' },
  { id: 'groq', name: 'Groq', color: '#ec4899' },
  { id: 'deepseek', name: 'DeepSeek', color: '#10b981' },
  { id: 'mistral', name: 'Mistral', color: '#ff6b35' },
  { id: 'alibaba', name: 'Alibaba', color: '#ff9500' }
];

export const modelsByProvider: { [key: string]: Model[] } = {
  google: [
    { id: 'gemini-pro', name: 'Gemini Pro', provider: 'google', endpoint: 'gemini-3-pro-preview' },
    { id: 'gemini-flash', name: 'Gemini Flash', provider: 'google', endpoint: 'gemini-flash-latest' },
  ],
  cerebras: [
    { id: 'cerebras-llama', name: 'Cerebras Llama', provider: 'cerebras', endpoint: 'llama3.3-70b' },
  ],
  groq: [
    { id: 'groq-llama-70b', name: 'Groq Llama 70b', provider: 'groq', endpoint: 'llama-3.3-70b-versatile' },
    { id: 'groq-llama-8b', name: 'Groq Llama 8b', provider: 'groq', endpoint: 'llama3-8b-8192' },
  ],
  deepseek: [
    { id: 'deepseek-v2', name: 'DeepSeek V2', provider: 'deepseek', endpoint: 'deepseek-chat' },
  ],
  mistral: [
    { id: 'mistral-large', name: 'Mistral Large', provider: 'mistral', endpoint: 'mistral-large-latest' },
    { id: 'mistral-small', name: 'Mistral Small', provider: 'mistral', endpoint: 'mistral-small-latest' },
  ],
  alibaba: [
    { id: 'alibaba-qwen-turbo', name: 'Alibaba Qwen Turbo', provider: 'alibaba', endpoint: 'qwen-turbo' },
    { id: 'alibaba-qwen-plus', name: 'Alibaba Qwen Plus', provider: 'alibaba', endpoint: 'qwen-plus' },
  ]
};

export const allModels: Model[] = Object.values(modelsByProvider).flat();
