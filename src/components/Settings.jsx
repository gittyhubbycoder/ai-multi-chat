import { useState, useEffect } from 'react';
import { CloseIcon, CheckIcon } from './Icons';
import { models } from '../utils/constants';
import toast from 'react-hot-toast';

export default function Settings({ isOpen, onClose, apiKeys, onSaveKeys, supabase, userId }) {
  const [keys, setKeys] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setKeys(apiKeys);
  }, [apiKeys]);

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const [provider, keyValue] of Object.entries(keys)) {
        if (keyValue && keyValue !== apiKeys[provider]) {
          const existing = await supabase
            .from('api_keys')
            .select('*')
            .eq('user_id', userId)
            .eq('provider', provider)
            .single();

          if (existing.data) {
            await supabase
              .from('api_keys')
              .update({ key_value: keyValue })
              .eq('id', existing.data.id);
          } else {
            await supabase
              .from('api_keys')
              .insert([{ user_id: userId, provider, key_value: keyValue }]);
          }
        }
      }
      onSaveKeys(keys);
      toast.success('API keys saved!');
      onClose();
    } catch (error) {
      toast.error('Failed to save keys');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const providers = [...new Set(models.map(m => m.provider))];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      
      <div className="glass-card relative w-full max-w-lg p-4 sm:p-6 animate-fadeIn max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold">API Keys</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
            aria-label="Close settings"
          >
            <CloseIcon />
          </button>
        </div>

        <p className="text-white/50 text-xs sm:text-sm mb-4 sm:mb-6">
          Enter your API keys to enable each AI provider. Keys are stored securely.
        </p>

        <div className="space-y-3 sm:space-y-4">
          {providers.map(provider => {
            const model = models.find(m => m.provider === provider);
            return (
              <div key={provider} className="space-y-2">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium">
                  <span 
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: model?.color }}
                  />
                  {provider.charAt(0).toUpperCase() + provider.slice(1)}
                  {keys[provider] && (
                    <CheckIcon className="text-green-400 w-4 h-4" />
                  )}
                </label>
                <input
                  type="password"
                  value={keys[provider] || ''}
                  onChange={(e) => setKeys({ ...keys, [provider]: e.target.value })}
                  placeholder={`Enter ${provider} API key`}
                  className="glass-input w-full px-3 sm:px-4 py-2.5 text-sm sm:text-base"
                />
              </div>
            );
          })}
        </div>

        <div className="flex gap-2 sm:gap-3 mt-6 sm:mt-8">
          <button
            onClick={onClose}
            className="glass-button-secondary flex-1 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="glass-button flex-1 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base"
          >
            {saving ? 'Saving...' : 'Save Keys'}
          </button>
        </div>
      </div>
    </div>
  );
}
