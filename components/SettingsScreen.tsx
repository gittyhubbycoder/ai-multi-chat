
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import type { Session } from '@supabase/supabase-js';
import type { ApiKeySet, ThemeSettings } from '../types';
import { providers } from '../constants';

interface SettingsScreenProps {
  apiKeys: ApiKeySet;
  setApiKeys: React.Dispatch<React.SetStateAction<ApiKeySet>>;
  setShowSettings: (show: boolean) => void;
  session: Session;
  themeSettings: ThemeSettings;
  setThemeSetting: <K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) => void;
}

type SettingsView = 'apiKeys' | 'appearance' | 'chat';

const SettingsScreen: React.FC<SettingsScreenProps> = ({ apiKeys, setApiKeys, setShowSettings, session, themeSettings, setThemeSetting }) => {
  const [currentKeys, setCurrentKeys] = useState<ApiKeySet>(apiKeys);
  const [activeView, setActiveView] = useState<SettingsView>('appearance');

  const saveKeys = async () => {
    for (const [provider, keyValue] of Object.entries(currentKeys)) {
      if (keyValue) {
        await supabase.from('api_keys').upsert({
          user_id: session.user.id,
          provider,
          key_value: keyValue
        }, { onConflict: 'user_id,provider' });
      }
    }
    setApiKeys(currentKeys);
    alert('API Keys saved!');
    setShowSettings(false);
  };
  
  const handleKeyChange = (provider: string, value: string) => {
    setCurrentKeys(prev => ({...prev, [provider]: value}));
  }

  const renderContent = () => {
    switch (activeView) {
      case 'appearance':
        return <AppearanceSettings settings={themeSettings} setSetting={setThemeSetting} />;
      case 'chat':
        return <ChatSettings settings={themeSettings} setSetting={setThemeSetting} />;
      case 'apiKeys':
        return <ApiKeysSettings keys={currentKeys} onKeyChange={handleKeyChange} onSave={saveKeys} />;
      default:
        return null;
    }
  };

  const navItems: { id: SettingsView; label: string }[] = [
    { id: 'appearance', label: 'Appearance' },
    { id: 'chat', label: 'Chat Experience' },
    { id: 'apiKeys', label: 'API Keys' },
  ];

  return (
    <div className="min-h-screen text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => setShowSettings(false)} className="text-blue-300 hover:text-blue-200 mb-4 text-sm md:text-base glass-card px-3 py-2 rounded-lg">
          ← Back
        </button>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-200 mb-4 md:mb-6 text-sm md:text-base">Configure your preferences</p>
        
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="md:w-1/4">
            <nav className="flex flex-row md:flex-col gap-2">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full text-left text-sm p-3 rounded-lg transition-colors ${activeView === item.id ? 'glass-button text-white font-semibold' : 'glass-card hover:bg-opacity-30'}`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>
          <main className="flex-1">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

// Sub-components for different settings panels

const AppearanceSettings: React.FC<{ settings: ThemeSettings, setSetting: <K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) => void }> = ({ settings, setSetting }) => (
  <div className="space-y-4 md:space-y-6 glass-card p-4 md:p-6 rounded-2xl">
    <h2 className="text-xl font-bold mb-4">Appearance</h2>
    {/* Glassmorphism Toggle */}
    <div className="flex items-center justify-between p-3 glass-card rounded-lg">
        <div>
            <div className="font-semibold text-sm md:text-base mb-1">Glassmorphism</div>
            <div className="text-xs text-gray-300">Enable frosted glass effects</div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={settings.glassmorphism} onChange={(e) => setSetting('glassmorphism', e.target.checked)} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
    </div>
    {/* Glassmorphism Controls */}
    {settings.glassmorphism && (
      <>
        <div className="flex items-center justify-between p-3 glass-card rounded-lg">
            <div className="flex-1"><div className="font-semibold text-sm md:text-base mb-1">Opacity: {settings.glassOpacity.toFixed(2)}</div></div>
            <input type="range" min="0.1" max="1" step="0.05" value={settings.glassOpacity} onChange={(e) => setSetting('glassOpacity', parseFloat(e.target.value))} className="w-24 md:w-32"/>
        </div>
        <div className="flex items-center justify-between p-3 glass-card rounded-lg">
            <div className="flex-1"><div className="font-semibold text-sm md:text-base mb-1">Blur: {settings.glassBlur}px</div></div>
            <input type="range" min="5" max="50" step="1" value={settings.glassBlur} onChange={(e) => setSetting('glassBlur', parseInt(e.target.value))} className="w-24 md:w-32"/>
        </div>
        <div className="flex items-center justify-between p-3 glass-card rounded-lg">
            <div className="flex-1"><div className="font-semibold text-sm md:text-base mb-1">Saturation: {settings.glassSaturate}%</div></div>
            <input type="range" min="100" max="300" step="10" value={settings.glassSaturate} onChange={(e) => setSetting('glassSaturate', parseInt(e.target.value))} className="w-24 md:w-32"/>
        </div>
      </>
    )}
    {/* Animated Gradient Toggle */}
    <div className="flex items-center justify-between p-3 glass-card rounded-lg">
        <div>
            <div className="font-semibold text-sm md:text-base mb-1">Animated gradient</div>
            <div className="text-xs text-gray-300">Subtle motion in the background</div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={settings.animatedGradient} onChange={(e) => setSetting('animatedGradient', e.target.checked)} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
    </div>
    {/* Theme Toggle (if not glassmorphism) */}
    {!settings.glassmorphism && (
        <div className="flex items-center justify-between p-3 glass-card rounded-lg">
            <div>
                <div className="font-semibold text-sm md:text-base mb-1">Theme</div>
                <div className="text-xs text-gray-300">Choose light or dark mode</div>
            </div>
            <div className="flex gap-2">
                <button onClick={() => setSetting('theme', 'light')} className={`px-4 py-2 rounded-lg font-semibold text-xs md:text-sm transition-all ${settings.theme==='light'?'glass-button text-white':'glass-card text-gray-300 hover:bg-opacity-30'}`}>☀️ Light</button>
                <button onClick={() => setSetting('theme', 'dark')} className={`px-4 py-2 rounded-lg font-semibold text-xs md:text-sm transition-all ${settings.theme==='dark'?'glass-button text-white':'glass-card text-gray-300 hover:bg-opacity-30'}`}>🌙 Dark</button>
            </div>
        </div>
    )}
  </div>
);

const ChatSettings: React.FC<{ settings: ThemeSettings, setSetting: <K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) => void }> = ({ settings, setSetting }) => (
  <div className="space-y-4 md:space-y-6 glass-card p-4 md:p-6 rounded-2xl">
    <h2 className="text-xl font-bold mb-4">Chat Experience</h2>
    <div className="flex items-center justify-between p-3 glass-card rounded-lg">
        <div>
            <div className="font-semibold text-sm md:text-base mb-1">Typing indicator</div>
            <div className="text-xs text-gray-300">Show animated dots while models respond</div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={settings.showTypingIndicator} onChange={(e) => setSetting('showTypingIndicator', e.target.checked)} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
    </div>
  </div>
);

const ApiKeysSettings: React.FC<{ keys: ApiKeySet, onKeyChange: (provider: string, value: string) => void, onSave: () => void }> = ({ keys, onKeyChange, onSave }) => {
    
    const keyLinks: {[key: string]: string} = {
        google: "https://aistudio.google.com/app/apikey",
        cerebras: "https://cloud.cerebras.ai/",
        groq: "https://console.groq.com/keys",
        deepseek: "https://platform.deepseek.com/api_keys",
        mistral: "https://console.mistral.ai/",
        alibaba: "https://bailian.console.aliyun.com/"
    };

    return (
        <div className="space-y-4 md:space-y-6 glass-card p-4 md:p-6 rounded-2xl">
            <h2 className="text-xl font-bold mb-4">API Keys</h2>
            {providers.map(provider => (
                 <div key={provider.id}>
                    <label className="block text-xs md:text-sm font-semibold mb-2">{provider.name}</label>
                    <input type="password" value={keys[provider.id] || ''} onChange={(e) => onKeyChange(provider.id, e.target.value)}
                        className="w-full glass-input text-white px-3 md:px-4 py-2 md:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"/>
                    <a href={keyLinks[provider.id]} target="_blank" rel="noopener noreferrer" 
                        className="text-xs text-blue-300 hover:text-blue-200 mt-1 inline-block">Get key →</a>
                </div>
            ))}
            <button onClick={onSave} 
                className="w-full glass-button hover:bg-blue-700 text-white py-2 md:py-3 rounded-lg font-semibold text-sm md:text-base mt-4">
                Save API Keys
            </button>
        </div>
    );
};


export default SettingsScreen;
