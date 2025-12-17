import { useRef, useEffect } from 'react';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import { models } from '../utils/constants';

export default function ChatView({ messages, loading, currentModel, streamingContent }) {
  const scrollRef = useRef(null);
  const model = models.find(m => m.id === currentModel);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto custom-scrollbar"
    >
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 sm:p-12">
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-gradient-to-br from-indigo-500/40 via-purple-500/40 to-pink-500/40 flex items-center justify-center mb-8 sm:mb-10 glass-card shadow-2xl">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-300 w-16 h-16 sm:w-20 sm:h-20">
              <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A1.5 1.5 0 0 0 6 14.5 1.5 1.5 0 0 0 7.5 16 1.5 1.5 0 0 0 9 14.5 1.5 1.5 0 0 0 7.5 13m9 0a1.5 1.5 0 0 0-1.5 1.5 1.5 1.5 0 0 0 1.5 1.5 1.5 1.5 0 0 0 1.5-1.5 1.5 1.5 0 0 0-1.5-1.5" />
            </svg>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 px-4 text-white bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">Start a conversation</h2>
          <p className="text-white/80 max-w-xl text-lg sm:text-xl px-4 mb-10 font-medium">
            Ask anything! Compare AI models, get help with coding, writing, analysis, and more.
          </p>
          <div className="flex flex-wrap gap-4 justify-center px-4 max-w-3xl">
            {['Explain quantum computing', 'Write a poem about AI', 'Help me with Python code'].map(prompt => (
              <button
                key={prompt}
                className="glass-button-secondary px-6 py-3.5 text-base sm:text-lg rounded-full font-semibold"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="pb-8 pt-6">
          {messages.map((msg, idx) => (
            <Message 
              key={idx} 
              message={msg} 
              modelColor={model?.color}
            />
          ))}
          {streamingContent && (
            <Message 
              message={{ role: 'assistant', content: streamingContent }}
              modelColor={model?.color}
            />
          )}
          {loading && !streamingContent && <TypingIndicator />}
        </div>
      )}
    </div>
  );
}
