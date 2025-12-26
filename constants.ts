
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
    { id: 'gemini-3-flash-preview', name: 'Gemini  3 Flash Preview', provider: 'google', endpoint: 'gemini-3-flash-preview' },
    { id: 'gemini-3-pro-preview', name: 'Gemini  3 Pro Preview', provider: 'google', endpoint: 'gemini-3-pro-preview' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'google', endpoint: 'gemini-2.5-flash' },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'google', endpoint: 'gemini-2.0-flash' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'google', endpoint: 'gemini-2.5-pro' },
    { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', provider: 'google', endpoint: 'gemini-2.5-flash-lite' },
    { id: 'gemma-3-27b', name: 'Gemma 3 27B', provider: 'google', endpoint: 'gemma-3-27b' },
  ],
  cerebras: [
    { id: 'cerebras-llama-3.3-70b', name: 'Llama 3.3 70b', provider: 'cerebras', endpoint: 'llama3.3-70b' },
    { id: 'cerebras-llama-3.1-8b', name: 'Llama 3.1 8b', provider: 'cerebras', endpoint: 'llama3.1-8b' },
    { id: 'cerebras-gpt-oss-120b', name: 'GPT OSS 120b', provider: 'cerebras', endpoint: 'gpt-oss-120b' },
    { id: 'cerebras-qwen-3-32b', name: 'Qwen 3 32b', provider: 'cerebras', endpoint: 'qwen-3-32b' },
  ],
  groq: [
    { id: 'groq-llama-70b', name: 'Groq Llama 70b', provider: 'groq', endpoint: 'llama-3.3-70b-versatile' },
    { id: 'groq-compound', name: 'Groq Compound', provider: 'groq', endpoint: 'groq/compound' },
    { id: 'groq-gpt-oss-120b', name: 'Groq GPT OSS 120b', provider: 'groq', endpoint: 'openai/gpt-oss-120b' },
    { id: 'groq-llama-3.1-8b-instant', name: 'Groq Llama 3.1 8b instant', provider: 'groq', endpoint: 'llama-3.1-8b-instant' },
  ],
  deepseek: [
    { id: 'deepseek-v2', name: 'DeepSeek V2', provider: 'deepseek', endpoint: 'deepseek-chat' },
  ],
  mistral: [
    { id: 'mistral-large', name: 'Mistral Large', provider: 'mistral', endpoint: 'mistral-large-latest' },
    { id: 'mistral-small', name: 'Mistral Small', provider: 'mistral', endpoint: 'mistral-small-latest' },
    { id: 'mistral-tiny', name: 'Mistral Tiny', provider: 'mistral', endpoint: 'mistral-tiny-latest' },
    { id: 'magistral-medium', name: 'Magistral Medium', provider: 'mistral', endpoint: 'magistral-medium-latest' },
    { id: 'magistral-small', name: 'MAgistral Small', provider: 'mistral', endpoint: 'magistral-small-latest' },
  ],
  alibaba: [
    { id: 'alibaba-qwen-turbo', name: 'Alibaba Qwen Turbo', provider: 'alibaba', endpoint: 'qwen-turbo' },
    { id: 'alibaba-qwen-plus', name: 'Alibaba Qwen Plus', provider: 'alibaba', endpoint: 'qwen-plus' },
  ]
};

export const allModels: Model[] = Object.values(modelsByProvider).flat();
