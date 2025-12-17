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
      
      <div className="glass-card relative w-full max-w-lg p-6 animate-fadeIn">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">API Keys</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        <p className="text-white/50 text-sm mb-6">
          Enter your API keys to enable each AI provider. Keys are stored securely.
        </p>

        <div className="space-y-4">
          {providers.map(provider => {
            const model = models.find(m => m.provider === provider);
            return (
              <div key={provider} className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <span 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: model?.color }}
                  />
                  {provider.charAt(0).toUpperCase() + provider.slice(1)}
                  {keys[provider] && (
                    <CheckIcon className="text-green-400" />
                  )}
                </label>
                <input
                  type="password"
                  value={keys[provider] || ''}
                  onChange={(e) => setKeys({ ...keys, [provider]: e.target.value })}
                  placeholder={`Enter ${provider} API key`}
                  className="glass-input w-full px-4 py-2.5 text-sm"
                />
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="glass-button-secondary flex-1 py-2.5 rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="glass-button flex-1 py-2.5 rounded-xl"
          >
            {saving ? 'Saving...' : 'Save Keys'}
          </button>
        </div>
      </div>
    </div>
  );
}
