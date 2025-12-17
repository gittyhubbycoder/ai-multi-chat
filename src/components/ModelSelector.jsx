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
    <div className="p-5 sm:p-6 border-b border-white/20 glass-dark">
      <div className="flex flex-wrap items-center gap-4">
        {!compareMode && (
          <select
            value={currentModel}
            onChange={(e) => onSelectModel(e.target.value)}
            className="glass-input px-5 py-3.5 text-base rounded-xl cursor-pointer min-w-[200px] sm:min-w-[240px] font-semibold"
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
            flex items-center gap-2.5 px-5 py-3.5 rounded-xl text-base font-semibold transition-all
            ${compareMode 
              ? 'bg-gradient-to-r from-indigo-500/50 to-purple-500/50 border-2 border-indigo-400/70 text-indigo-100 shadow-xl shadow-indigo-500/40' 
              : 'glass-button-secondary'}
          `}
        >
          <ColumnsIcon />
          <span className="hidden sm:inline">Compare</span>
        </button>

        {compareMode && (
          <div className="flex flex-wrap gap-3 w-full sm:w-auto sm:ml-2">
            {models.map(model => {
              const isSelected = selectedModels.includes(model.id);
              const hasKey = !!apiKeys[model.provider];
              
              return (
                <button
                  key={model.id}
                  onClick={() => hasKey && onToggleModelSelection(model.id)}
                  disabled={!hasKey}
                  className={`
                    model-chip text-base font-semibold
                    ${isSelected ? 'selected' : 'opacity-75'}
                    ${!hasKey && 'opacity-40 cursor-not-allowed'}
                  `}
                  style={{ 
                    backgroundColor: `${model.color}30`,
                    color: model.color,
                    borderColor: isSelected ? model.color : 'transparent'
                  }}
                >
                  <span 
                    className="w-3 h-3 rounded-full flex-shrink-0 shadow-lg"
                    style={{ backgroundColor: model.color, boxShadow: `0 0 12px ${model.color}60` }}
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
