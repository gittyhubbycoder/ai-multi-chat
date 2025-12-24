import type { Model, AttachedFile } from '../types';

interface HistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const callGenericApi = async (model: Model, apiKey: string, history: HistoryMessage[], file?: AttachedFile, requestConfig?: object): Promise<string> => {
  let endpoint = '';
  let body: any = {};
  const headers: { [key: string]: string } = { 'Content-Type': 'application/json' };

  if (model.provider !== 'google') {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  switch (model.provider) {
    case 'google':
      endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model.endpoint}:generateContent?key=${apiKey}`;
      const contents = history.map((msg, index) => {
        const isLastMessage = index === history.length - 1;
        const textContent = typeof msg.content === 'string' ? msg.content : '';
        const parts: any[] = [{ text: textContent }];
        if (isLastMessage && file) {
            parts.push({
                inline_data: {
                    mime_type: file.type,
                    data: file.data
                }
            });
        }
        return {
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: parts
        };
      });
      body = { contents };
      if (requestConfig) {
        body.generationConfig = requestConfig;
      }
      break;
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
    const errorData = await res.json().catch(() => ({})); // Gracefully handle non-json error responses
    const errorMessage = errorData?.error?.message || res.statusText;
    throw new Error(`API Error from ${model.provider}: ${errorMessage}`);
  }

  const data = await res.json();

  if (model.provider === 'google') {
    // For JSON mode, the response is directly in the text part
    if (body.generationConfig?.responseMimeType === "application/json") {
      return data.candidates[0].content.parts[0].text;
    }
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }
    if (data.candidates?.[0]?.finishReason === 'SAFETY' || data.promptFeedback?.blockReason) {
      const reason = data.promptFeedback?.blockReason || 'SAFETY';
      return `Request was blocked by the API for the following reason: ${reason}.`;
    }
  }

  if (model.provider === 'alibaba') {
    if (data.output?.text) {
        return data.output.text;
    }
  }
  
  if (data.choices?.[0]?.message?.content) {
      return data.choices[0].message.content;
  }

  console.error("Unexpected response structure:", data);
  throw new Error(`Unexpected response structure from ${model.provider}`);
};
