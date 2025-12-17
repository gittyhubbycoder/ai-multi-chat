import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import Settings from './components/Settings';
import ChatView from './components/ChatView';
import CompareView from './components/CompareView';
import ChatInput from './components/ChatInput';
import ModelSelector from './components/ModelSelector';
import BiasAnalysis from './components/BiasAnalysis';
import { MenuIcon } from './components/Icons';

import { supabase } from './utils/supabase';
import { models, ADMIN_EMAIL } from './utils/constants';
import { callAI, streamAI, enhancePrompt, analyzeBias } from './utils/api';

import './styles/globals.css';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [apiKeys, setApiKeys] = useState({});
  const [showSettings, setShowSettings] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sending, setSending] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');

  const [compareMode, setCompareMode] = useState(false);
  const [selectedModels, setSelectedModels] = useState([]);
  const [compareResponses, setCompareResponses] = useState({});
  const [biasAnalysis, setBiasAnalysis] = useState(null);
  const [analyzingBias, setAnalyzingBias] = useState(false);

  const currentChat = chats.find(c => c.id === currentChatId);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        setIsAdmin(session.user.email === ADMIN_EMAIL);
        loadUserData(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setIsAdmin(session.user.email === ADMIN_EMAIL);
        loadUserData(session.user.id);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    if (currentChat) {
      setCompareMode(currentChat.compare_mode || false);
      setSelectedModels(currentChat.selected_models || []);
      setCompareResponses(currentChat.compare_responses || {});
    }
  }, [currentChatId, currentChat]);

  const loadUserData = async (userId) => {
    const { data: chatsData } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (chatsData?.length > 0) {
      setChats(chatsData);
      setCurrentChatId(chatsData[0].id);
    } else {
      createNewChat(userId);
    }

    const { data: keysData } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', userId);

    const keysObj = {};
    keysData?.forEach(k => { keysObj[k.provider] = k.key_value; });
    setApiKeys(keysObj);
  };

  const createNewChat = async (userId) => {
    const { data } = await supabase.from('chats').insert([{
      user_id: userId || session.user.id,
      name: 'New Chat',
      model: 'cerebras',
      messages: [],
      compare_mode: false,
      selected_models: [],
      compare_responses: {},
    }]).select().single();

    if (data) {
      setChats([data, ...chats]);
      setCurrentChatId(data.id);
      setCompareMode(false);
      setSelectedModels([]);
      setCompareResponses({});
      setBiasAnalysis(null);
    }
  };

  const deleteChat = async (chatId) => {
    if (chats.length === 1) {
      toast.error("Can't delete your last chat!");
      return;
    }
    
    await supabase.from('chats').delete().eq('id', chatId);
    const newChats = chats.filter(c => c.id !== chatId);
    setChats(newChats);
    if (currentChatId === chatId) {
      setCurrentChatId(newChats[0]?.id);
    }
    toast.success('Chat deleted');
  };

  const renameChat = async (chatId, newName) => {
    await supabase.from('chats').update({ name: newName }).eq('id', chatId);
    setChats(chats.map(c => c.id === chatId ? { ...c, name: newName } : c));
  };

  const updateChatModel = async (modelId) => {
    await supabase.from('chats').update({ model: modelId }).eq('id', currentChatId);
    setChats(chats.map(c => c.id === currentChatId ? { ...c, model: modelId } : c));
  };

  const toggleCompareMode = async () => {
    const newCompareMode = !compareMode;
    setCompareMode(newCompareMode);
    setBiasAnalysis(null);

    if (newCompareMode) {
      setSelectedModels(['cerebras', 'groq']);
    } else {
      setSelectedModels([]);
      setCompareResponses({});
    }

    await supabase.from('chats').update({
      compare_mode: newCompareMode,
      selected_models: newCompareMode ? ['cerebras', 'groq'] : [],
      compare_responses: {},
    }).eq('id', currentChatId);

    setChats(chats.map(c => c.id === currentChatId ? {
      ...c,
      compare_mode: newCompareMode,
      selected_models: newCompareMode ? ['cerebras', 'groq'] : [],
      compare_responses: {},
    } : c));
  };

  const toggleModelSelection = (modelId) => {
    const newSelected = selectedModels.includes(modelId)
      ? selectedModels.filter(id => id !== modelId)
      : [...selectedModels, modelId];
    setSelectedModels(newSelected);
  };

  const sendMessage = async (input, attachedFile) => {
    if (!input.trim() || !currentChat) return;

    if (compareMode && selectedModels.length > 0) {
      await sendCompareMessage(input);
      return;
    }

    const model = models.find(m => m.id === currentChat.model);
    const apiKey = apiKeys[model.provider];

    if (!apiKey) {
      toast.error(`Please add your ${model.provider} API key in settings`);
      setShowSettings(true);
      return;
    }

    const userMsg = { role: 'user', content: input, file: attachedFile, timestamp: new Date().toISOString() };
    const newMsgs = [...(currentChat.messages || []), userMsg];
    setChats(chats.map(c => c.id === currentChatId ? { ...c, messages: newMsgs } : c));

    if ((!currentChat.messages || currentChat.messages.length === 0) && currentChat.name === 'New Chat') {
      const chatName = input.slice(0, 30) + (input.length > 30 ? '...' : '');
      await supabase.from('chats').update({ name: chatName }).eq('id', currentChatId);
      setChats(chats.map(c => c.id === currentChatId ? { ...c, name: chatName } : c));
    }

    setSending(true);
    setStreamingContent('');

    try {
      const response = await streamAI(model, apiKey, newMsgs, (content) => {
        setStreamingContent(content);
      });

      const assistantMsg = { role: 'assistant', content: response, timestamp: new Date().toISOString() };
      const updatedMsgs = [...newMsgs, assistantMsg];
      await supabase.from('chats').update({ messages: updatedMsgs }).eq('id', currentChatId);
      setChats(chats.map(c => c.id === currentChatId ? { ...c, messages: updatedMsgs } : c));
    } catch (error) {
      toast.error('Error: ' + error.message);
    } finally {
      setSending(false);
      setStreamingContent('');
    }
  };

  const sendCompareMessage = async (input) => {
    setSending(true);
    setBiasAnalysis(null);

    const newResponses = { ...compareResponses };
    
    await Promise.all(selectedModels.map(async (modelId) => {
      const model = models.find(m => m.id === modelId);
      const apiKey = apiKeys[model.provider];
      if (!apiKey) return;

      try {
        const history = [...(newResponses[modelId] || []), { role: 'user', content: input }];
        const response = await callAI(model, apiKey, history);
        newResponses[modelId] = [...history, { role: 'assistant', content: response, timestamp: new Date().toISOString() }];
      } catch (error) {
        newResponses[modelId] = [
          ...(newResponses[modelId] || []),
          { role: 'user', content: input },
          { role: 'assistant', content: 'Error: ' + error.message, timestamp: new Date().toISOString() }
        ];
      }
    }));

    setCompareResponses(newResponses);
    await supabase.from('chats').update({ compare_responses: newResponses }).eq('id', currentChatId);
    setChats(chats.map(c => c.id === currentChatId ? { ...c, compare_responses: newResponses } : c));
    setSending(false);
  };

  const handleEnhancePrompt = async (prompt) => {
    const key = apiKeys.cerebras || apiKeys.groq;
    if (!key) {
      toast.error('Need Cerebras or Groq API key to enhance prompts');
      return null;
    }
    return await enhancePrompt(key, prompt);
  };

  const handleAnalyzeBias = async () => {
    if (Object.keys(compareResponses).length === 0) return;

    setAnalyzingBias(true);
    const key = apiKeys.cerebras || apiKeys.groq;
    if (!key) {
      toast.error('Need Cerebras or Groq API key for bias analysis');
      setAnalyzingBias(false);
      return;
    }

    try {
      const responsesText = selectedModels.map(modelId => {
        const model = models.find(m => m.id === modelId);
        const history = compareResponses[modelId] || [];
        const lastResponse = history[history.length - 1];
        return `**${model.name}**: ${lastResponse?.content || 'No response'}`;
      }).join('\n\n');

      const analysis = await analyzeBias(key, responsesText);
      setBiasAnalysis(analysis);
    } catch (error) {
      toast.error('Error analyzing: ' + error.message);
    } finally {
      setAnalyzingBias(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setChats([]);
    setCurrentChatId(null);
    setApiKeys({});
    toast.success('Logged out');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex gap-2">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      </div>
    );
  }

  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Configuration Required</h1>
          <p className="text-white/60 mb-4">
            Please set up your environment variables to use this app.
          </p>
          <code className="block glass p-4 rounded-lg text-sm text-left">
            VITE_SUPABASE_URL=your_url<br/>
            VITE_SUPABASE_ANON_KEY=your_key<br/>
            VITE_ADMIN_EMAIL=your_email<br/>
            VITE_INVITE_CODE=your_code
          </code>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <>
        <Toaster position="top-center" toastOptions={{
          style: { background: 'rgba(30, 30, 50, 0.9)', color: '#fff', backdropFilter: 'blur(10px)' }
        }} />
        <Auth supabase={supabase} />
      </>
    );
  }

  return (
    <>
      <Toaster position="top-center" toastOptions={{
        style: { background: 'rgba(30, 30, 50, 0.9)', color: '#fff', backdropFilter: 'blur(10px)' }
      }} />
      
      <div className="h-screen flex">
        <Sidebar
          chats={chats}
          currentChatId={currentChatId}
          onSelectChat={setCurrentChatId}
          onNewChat={() => createNewChat()}
          onDeleteChat={deleteChat}
          onRenameChat={renameChat}
          onOpenSettings={() => setShowSettings(true)}
          onLogout={handleLogout}
          isOpen={showSidebar}
          onClose={() => setShowSidebar(false)}
          userEmail={session.user.email}
        />

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="glass p-3 sm:p-4 flex items-center gap-3 border-b border-white/10 flex-shrink-0">
            <button
              onClick={() => setShowSidebar(true)}
              className="p-2 hover:bg-white/10 rounded-lg md:hidden flex-shrink-0"
              aria-label="Open sidebar"
            >
              <MenuIcon />
            </button>
            <h1 className="font-semibold truncate text-sm sm:text-base">
              {currentChat?.name || 'New Chat'}
            </h1>
          </header>

          <ModelSelector
            currentModel={currentChat?.model || 'cerebras'}
            onSelectModel={updateChatModel}
            compareMode={compareMode}
            onToggleCompare={toggleCompareMode}
            selectedModels={selectedModels}
            onToggleModelSelection={toggleModelSelection}
            apiKeys={apiKeys}
          />

          {compareMode ? (
            <CompareView
              selectedModels={selectedModels}
              compareResponses={compareResponses}
              loading={sending}
            />
          ) : (
            <ChatView
              messages={currentChat?.messages || []}
              loading={sending}
              currentModel={currentChat?.model}
              streamingContent={streamingContent}
            />
          )}

          {compareMode && Object.keys(compareResponses).length > 0 && (
            <BiasAnalysis
              analysis={biasAnalysis}
              onAnalyze={handleAnalyzeBias}
              analyzing={analyzingBias}
            />
          )}

          <ChatInput
            onSend={sendMessage}
            onEnhance={handleEnhancePrompt}
            disabled={sending}
            placeholder={compareMode 
              ? `Ask ${selectedModels.length} models...` 
              : 'Type your message...'}
          />
        </main>
      </div>

      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        apiKeys={apiKeys}
        onSaveKeys={setApiKeys}
        supabase={supabase}
        userId={session.user.id}
      />
    </>
  );
}
