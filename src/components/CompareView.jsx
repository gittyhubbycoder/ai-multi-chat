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
      <div className="flex-1 flex items-center justify-center text-white/60">
        <p className="text-base sm:text-lg font-medium">Select models above to compare responses</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
      {selectedModels.map(modelId => {
        const model = models.find(m => m.id === modelId);
        const messages = compareResponses[modelId] || [];

        return (
          <div 
            key={modelId}
            className="flex-1 flex flex-col border-b sm:border-b-0 sm:border-r border-white/10 last:border-b-0 last:border-r-0 min-w-0"
          >
            <div 
              className="p-4 sm:p-5 border-b border-white/10 flex items-center gap-3 flex-shrink-0 glass"
              style={{ backgroundColor: `${model.color}20` }}
            >
              <span 
                className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full flex-shrink-0 shadow-lg"
                style={{ backgroundColor: model.color, boxShadow: `0 0 12px ${model.color}60` }}
              />
              <span className="font-semibold text-sm sm:text-base truncate text-white">{model.name}</span>
            </div>

            <div 
              ref={el => scrollRefs.current[modelId] = el}
              className="flex-1 overflow-y-auto custom-scrollbar min-h-0"
            >
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-white/50 text-sm sm:text-base p-6 text-center font-medium">
                  Send a message to see {model.name}'s response
                </div>
              ) : (
                <div className="pb-6 pt-4">
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
