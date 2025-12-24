
import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabase';
import AuthScreen from './components/AuthScreen';
import ChatView from './components/ChatView';
import SettingsScreen from './components/SettingsScreen';
import ImageGenView from './components/ImageGenView';
import { useTheme } from './hooks/useTheme';
import type { Session, User } from '@supabase/supabase-js';
import type { ApiKeySet, Chat } from './types';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState('chat'); // 'chat', 'settings', 'image'
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKeySet>({});
  const [loading, setLoading] = useState(true);
  const { themeSettings, setThemeSetting } = useTheme();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      if (session) {
        await loadUserData(session.user.id);
      }
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session) {
        loadUserData(session.user.id);
      } else {
        setChats([]);
        setCurrentChatId(null);
        setApiKeys({});
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
    const { data: chatsData } = await supabase.from('chats').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    
    if (chatsData && chatsData.length > 0) {
      setChats(chatsData);
      setCurrentChatId(chatsData[0].id);
    } else {
      await createNewChat(userId);
    }

    const { data: keysData } = await supabase.from('api_keys').select('*').eq('user_id', userId);
    const keysObj: ApiKeySet = {};
    keysData?.forEach(k => { keysObj[k.provider] = k.key_value; });
    setApiKeys(keysObj);
  };

  const createNewChat = async (userId: string) => {
    const { data } = await supabase.from('chats').insert([{
      user_id: userId,
      name: 'New Chat',
      model: 'gemini-pro',
      messages: [],
      compare_mode: false,
      selected_models: [],
      compare_responses: {},
      focused_model: null
    }]).select().single();
    
    if (data) {
      setChats(prevChats => [data, ...prevChats]);
      setCurrentChatId(data.id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!session || !user) {
    return <AuthScreen />;
  }

  if (view === 'settings') {
    return <SettingsScreen
      apiKeys={apiKeys}
      setApiKeys={setApiKeys}
      setShowSettings={() => setView('chat')}
      session={session}
      themeSettings={themeSettings}
      setThemeSetting={setThemeSetting}
    />;
  }

  if (view === 'image') {
    return <ImageGenView setView={setView} />;
  }

  return (
    <ChatView
      session={session}
      user={user}
      chats={chats}
      setChats={setChats}
      currentChatId={currentChatId}
      setCurrentChatId={setCurrentChatId}
      apiKeys={apiKeys}
      showTypingIndicator={themeSettings.showTypingIndicator}
      setView={setView}
      createNewChat={createNewChat}
    />
  );
};

export default App;
