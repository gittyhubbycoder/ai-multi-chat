export const callAI = async (model, apiKey, messages, attachedFile = null) => {
  const history = messages.map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content
  }));

  if (model.provider === 'google') {
    const contents = history.map((msg, idx) => {
      const parts = [{ text: msg.content }];
      if (idx === history.length - 1 && attachedFile) {
        parts.push({ inline_data: { mime_type: attachedFile.type, data: attachedFile.data } });
      }
      return { role: msg.role === 'user' ? 'user' : 'model', parts };
    });

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model.endpoint}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      }
    );
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.candidates[0].content.parts[0].text;
  }

  const endpoints = {
    cerebras: 'https://api.cerebras.ai/v1/chat/completions',
    groq: 'https://api.groq.com/openai/v1/chat/completions',
    deepseek: 'https://api.deepseek.com/chat/completions'
  };

  const res = await fetch(endpoints[model.provider], {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model.endpoint,
      messages: history,
      max_tokens: 4096,
      stream: false
    })
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message || 'API Error');
  return data.choices[0].message.content;
};

export const streamAI = async (model, apiKey, messages, onChunk) => {
  const history = messages.map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content
  }));

  if (model.provider === 'google') {
    const contents = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model.endpoint}:streamGenerateContent?alt=sse&key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      }
    );

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        
        let jsonStr = trimmed;
        if (trimmed.startsWith('data:')) {
          jsonStr = trimmed.slice(5).trim();
        }
        
        if (!jsonStr || jsonStr === '[DONE]') continue;
        
        try {
          const parsed = JSON.parse(jsonStr);
          const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (text) {
            fullText += text;
            onChunk(fullText);
          }
        } catch {}
      }
    }
    return fullText;
  }

  const endpoints = {
    cerebras: 'https://api.cerebras.ai/v1/chat/completions',
    groq: 'https://api.groq.com/openai/v1/chat/completions',
    deepseek: 'https://api.deepseek.com/chat/completions'
  };

  const res = await fetch(endpoints[model.provider], {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model.endpoint,
      messages: history,
      max_tokens: 4096,
      stream: true
    })
  });

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

    for (const line of lines) {
      const data = line.slice(6);
      if (data === '[DONE]') continue;
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices[0]?.delta?.content || '';
        if (content) {
          fullText += content;
          onChunk(fullText);
        }
      } catch {}
    }
  }

  return fullText;
};

export const enhancePrompt = async (apiKey, prompt) => {
  const res = await fetch('https://api.cerebras.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'llama3.3-70b',
      messages: [{
        role: 'user',
        content: `Improve this prompt to be more detailed and effective. Only return the improved prompt, nothing else: "${prompt}"`
      }],
      max_tokens: 500
    })
  });
  const data = await res.json();
  return data.choices[0].message.content;
};

export const analyzeBias = async (apiKey, responses) => {
  const analysisPrompt = `You are an AI bias analyst. Analyze these AI responses and provide ratings for each:

${responses}

Provide analysis in this exact JSON format (no markdown, no backticks):
{
  "models": [
    {
      "name": "Model Name",
      "bias": 7,
      "credibility": 8,
      "completeness": 9,
      "clarity": 8,
      "summary": "Brief analysis"
    }
  ],
  "recommendation": "Which model gave the best response and why"
}

Rate each metric 1-10 where:
- Bias: 1=highly biased, 10=completely neutral
- Credibility: 1=unreliable, 10=highly credible
- Completeness: 1=incomplete, 10=comprehensive
- Clarity: 1=confusing, 10=crystal clear`;

  const res = await fetch('https://api.cerebras.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'llama3.3-70b',
      messages: [{ role: 'user', content: analysisPrompt }],
      max_tokens: 2000
    })
  });

  const data = await res.json();
  const analysisText = data.choices[0].message.content;
  const cleanedText = analysisText.replace(/```json|```/g, '').trim();
  return JSON.parse(cleanedText);
};
