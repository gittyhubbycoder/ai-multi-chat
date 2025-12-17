import { models } from '../utils/constants';
import { ColumnsIcon } from './Icons';

export default function ModelSelector({
  currentModel,
  onSelectModel,
  compareMode,
  onToggleCompare,
  selectedModels,
  onToggleModelSelection,
  apiKeys
}) {
  return (
    <div className="p-3 sm:p-4 border-b border-white/10 bg-glass-dark">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {!compareMode && (
          <select
            value={currentModel}
            onChange={(e) => onSelectModel(e.target.value)}
            className="glass-input px-3 sm:px-4 py-2 text-sm rounded-xl cursor-pointer min-w-[140px] sm:min-w-[180px]"
          >
            {models.map(model => (
              <option 
                key={model.id} 
                value={model.id}
                style={{ background: '#1a1a2e' }}
              >
                {model.name} {!apiKeys[model.provider] && '(No key)'}
              </option>
            ))}
          </select>
        )}

        <button
          onClick={onToggleCompare}
          className={`
            flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm transition-all
            ${compareMode 
              ? 'bg-indigo-500/30 border border-indigo-500/50 text-indigo-300' 
              : 'glass-button-secondary'}
          `}
        >
          <ColumnsIcon />
          <span className="hidden sm:inline">Compare</span>
        </button>

        {compareMode && (
          <div className="flex flex-wrap gap-2 w-full sm:w-auto sm:ml-2">
            {models.map(model => {
              const isSelected = selectedModels.includes(model.id);
              const hasKey = !!apiKeys[model.provider];
              
              return (
                <button
                  key={model.id}
                  onClick={() => hasKey && onToggleModelSelection(model.id)}
                  disabled={!hasKey}
                  className={`
                    model-chip text-xs sm:text-sm
                    ${isSelected ? 'selected' : 'opacity-60'}
                    ${!hasKey && 'opacity-30 cursor-not-allowed'}
                  `}
                  style={{ 
                    backgroundColor: `${model.color}20`,
                    color: model.color,
                    borderColor: isSelected ? model.color : 'transparent'
                  }}
                >
                  <span 
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: model.color }}
                  />
                  <span className="truncate">{model.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
