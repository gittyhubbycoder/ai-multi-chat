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
      
      <div className="glass-card relative w-full max-w-lg p-8 sm:p-10 animate-fadeIn max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">API Keys</h2>
          <button
            onClick={onClose}
            className="p-3 hover:bg-white/10 rounded-xl transition-colors flex-shrink-0 glass-button-secondary"
            aria-label="Close settings"
          >
            <CloseIcon />
          </button>
        </div>

        <p className="text-white/80 text-lg sm:text-xl mb-8 font-medium">
          Enter your API keys to enable each AI provider. Keys are stored securely.
        </p>

        <div className="space-y-6">
          {providers.map(provider => {
            const model = models.find(m => m.provider === provider);
            return (
              <div key={provider} className="space-y-4">
                <label className="flex items-center gap-4 text-lg sm:text-xl font-bold text-white">
                  <span 
                    className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex-shrink-0 shadow-lg"
                    style={{ 
                      backgroundColor: model?.color,
                      boxShadow: `0 0 16px ${model?.color}70`
                    }}
                  />
                  {provider.charAt(0).toUpperCase() + provider.slice(1)}
                  {keys[provider] && (
                    <CheckIcon className="text-green-400 w-6 h-6" />
                  )}
                </label>
                <input
                  type="password"
                  value={keys[provider] || ''}
                  onChange={(e) => setKeys({ ...keys, [provider]: e.target.value })}
                  placeholder={`Enter ${provider} API key`}
                  className="glass-input w-full px-5 py-4 text-base font-medium"
                />
              </div>
            );
          })}
        </div>

        <div className="flex gap-4 mt-10">
          <button
            onClick={onClose}
            className="glass-button-secondary flex-1 py-4 rounded-xl text-base font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="glass-button flex-1 py-4 rounded-xl text-base font-semibold"
          >
            {saving ? 'Saving...' : 'Save Keys'}
          </button>
        </div>
      </div>
    </div>
  );
}
