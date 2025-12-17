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
    <div className="p-4 border-b border-white/10">
      <div className="flex flex-wrap items-center gap-2">
        {!compareMode && (
          <select
            value={currentModel}
            onChange={(e) => onSelectModel(e.target.value)}
            className="glass-input px-3 py-2 text-sm rounded-xl cursor-pointer"
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
            flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all
            ${compareMode 
              ? 'bg-indigo-500/30 border border-indigo-500/50 text-indigo-300' 
              : 'glass-button-secondary'}
          `}
        >
          <ColumnsIcon />
          <span className="hidden sm:inline">Compare</span>
        </button>

        {compareMode && (
          <div className="flex flex-wrap gap-2 ml-2">
            {models.map(model => {
              const isSelected = selectedModels.includes(model.id);
              const hasKey = !!apiKeys[model.provider];
              
              return (
                <button
                  key={model.id}
                  onClick={() => hasKey && onToggleModelSelection(model.id)}
                  disabled={!hasKey}
                  className={`
                    model-chip
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
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: model.color }}
                  />
                  {model.name.split(' ')[0]}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
