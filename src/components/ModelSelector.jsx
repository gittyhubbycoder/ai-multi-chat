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
    <div className="p-4 sm:p-5 border-b border-white/10 glass-dark">
      <div className="flex flex-wrap items-center gap-3">
        {!compareMode && (
          <select
            value={currentModel}
            onChange={(e) => onSelectModel(e.target.value)}
            className="glass-input px-4 py-3 text-base rounded-xl cursor-pointer min-w-[180px] sm:min-w-[220px] font-medium"
          >
            {models.map(model => (
              <option 
                key={model.id} 
                value={model.id}
                style={{ background: '#0f172a', color: '#f1f5f9' }}
              >
                {model.name} {!apiKeys[model.provider] && '(No key)'}
              </option>
            ))}
          </select>
        )}

        <button
          onClick={onToggleCompare}
          className={`
            flex items-center gap-2 px-4 py-3 rounded-xl text-sm sm:text-base font-medium transition-all
            ${compareMode 
              ? 'bg-indigo-500/40 border-2 border-indigo-500/60 text-indigo-200 shadow-lg shadow-indigo-500/30' 
              : 'glass-button-secondary'}
          `}
        >
          <ColumnsIcon />
          <span className="hidden sm:inline">Compare</span>
        </button>

        {compareMode && (
          <div className="flex flex-wrap gap-2.5 w-full sm:w-auto sm:ml-2">
            {models.map(model => {
              const isSelected = selectedModels.includes(model.id);
              const hasKey = !!apiKeys[model.provider];
              
              return (
                <button
                  key={model.id}
                  onClick={() => hasKey && onToggleModelSelection(model.id)}
                  disabled={!hasKey}
                  className={`
                    model-chip text-sm sm:text-base font-medium
                    ${isSelected ? 'selected' : 'opacity-70'}
                    ${!hasKey && 'opacity-40 cursor-not-allowed'}
                  `}
                  style={{ 
                    backgroundColor: `${model.color}25`,
                    color: model.color,
                    borderColor: isSelected ? model.color : 'transparent'
                  }}
                >
                  <span 
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
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
