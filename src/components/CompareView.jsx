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
      <div className="flex-1 flex items-center justify-center text-white/50">
        <p>Select models above to compare responses</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {selectedModels.map(modelId => {
        const model = models.find(m => m.id === modelId);
        const messages = compareResponses[modelId] || [];

        return (
          <div 
            key={modelId}
            className="flex-1 flex flex-col border-r border-white/10 last:border-r-0 min-w-0"
          >
            <div 
              className="p-3 border-b border-white/10 flex items-center gap-2"
              style={{ backgroundColor: `${model.color}15` }}
            >
              <span 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: model.color }}
              />
              <span className="font-medium text-sm truncate">{model.name}</span>
            </div>

            <div 
              ref={el => scrollRefs.current[modelId] = el}
              className="flex-1 overflow-y-auto custom-scrollbar"
            >
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-white/30 text-sm p-4 text-center">
                  Send a message to see {model.name}'s response
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <Message 
                    key={idx} 
                    message={msg} 
                    modelColor={model.color}
                  />
                ))
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
