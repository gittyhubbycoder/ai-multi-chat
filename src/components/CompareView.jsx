import { useRef, useEffect } from 'react';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import { models } from '../utils/constants';

export default function CompareView({
  selectedModels,
  compareResponses,
  loading
}) {
  const scrollRefs = useRef({});

  useEffect(() => {
    Object.values(scrollRefs.current).forEach(ref => {
      if (ref) ref.scrollTop = ref.scrollHeight;
    });
  }, [compareResponses]);

  if (selectedModels.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-white/70">
        <p className="text-lg sm:text-xl font-semibold">Select models above to compare responses</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col sm:flex-row overflow-hidden gap-2 p-2">
      {selectedModels.map(modelId => {
        const model = models.find(m => m.id === modelId);
        const messages = compareResponses[modelId] || [];

        return (
          <div 
            key={modelId}
            className="flex-1 flex flex-col border-b sm:border-b-0 sm:border-r border-white/20 last:border-b-0 last:border-r-0 min-w-0 glass-dark rounded-xl overflow-hidden"
          >
            <div 
              className="p-5 sm:p-6 border-b border-white/20 flex items-center gap-4 flex-shrink-0 glass"
              style={{ 
                background: `linear-gradient(135deg, ${model.color}30, ${model.color}15)`,
                borderBottom: `2px solid ${model.color}40`
              }}
            >
              <span 
                className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex-shrink-0 shadow-xl"
                style={{ 
                  backgroundColor: model.color, 
                  boxShadow: `0 0 20px ${model.color}70` 
                }}
              />
              <span className="font-bold text-base sm:text-lg truncate text-white">{model.name}</span>
            </div>

            <div 
              ref={el => scrollRefs.current[modelId] = el}
              className="flex-1 overflow-y-auto custom-scrollbar min-h-0"
            >
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-white/60 text-base sm:text-lg p-8 text-center font-semibold">
                  Send a message to see {model.name}'s response
                </div>
              ) : (
                <div className="pb-8 pt-6">
                  {messages.map((msg, idx) => (
                    <Message 
                      key={idx} 
                      message={msg} 
                      modelColor={model.color}
                    />
                  ))}
                </div>
              )}
              {loading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
                <TypingIndicator />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
