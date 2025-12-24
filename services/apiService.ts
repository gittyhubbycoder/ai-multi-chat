
import type { Model } from '../types';

interface HistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const callGenericApi = async (model: Model, apiKey: string, history: HistoryMessage[]): Promise<string> => {
  let endpoint = '';
  let body: object = {};
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` };

  switch (model.provider) {
    case 'cerebras':
      endpoint = 'https://api.cerebras.ai/v1/chat/completions';
      body = { model: model.endpoint, messages: history, max_tokens: 4096 };
      break;
    case 'groq':
      endpoint = 'https://api.groq.com/openai/v1/chat/completions';
      body = { model: model.endpoint, messages: history, max_tokens: 4096 };
      break;
    case 'deepseek':
      endpoint = 'https://api.deepseek.com/chat/completions';
      body = { model: model.endpoint, messages: history, max_tokens: 4096 };
      break;
    case 'mistral':
      endpoint = 'https://api.mistral.ai/v1/chat/completions';
      body = { model: model.endpoint, messages: history, max_tokens: 4096 };
      break;
    case 'alibaba':
      endpoint = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
      body = { model: model.endpoint, input: { messages: history }, parameters: { max_tokens: 4096 } };
      break;
    default:
      throw new Error(`Unsupported provider: ${model.provider}`);
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(`API Error from ${model.provider}: ${errorData.error?.message || res.statusText}`);
  }

  const data = await res.json();

  if (model.provider === 'alibaba') {
    return data.output.text;
  }
  
  if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
  }

  throw new Error(`Unexpected response structure from ${model.provider}`);
};
