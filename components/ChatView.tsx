import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { generateGeminiContent } from '../services/geminiService';
import { callGenericApi } from '../services/apiService';
import { allModels, modelsByProvider, providers, ADMIN_EMAIL } from '../constants';
import MarkdownRenderer from './MarkdownRenderer';
import {
    SendIcon, UserIcon, SettingsIcon, LogOutIcon, TrashIcon, PlusIcon, MessageIcon,
    EditIcon, ShieldIcon, ImageIcon, PaperclipIcon, SparklesIcon, ColumnsIcon, AnalyzeIcon,
    MenuIcon, CloseIcon, ArrowRightIcon, CopyIcon
} from './Icons';
import type { Session, User } from '@supabase/supabase-js';
import type { ApiKeySet, AttachedFile, BiasAnalysis, Chat, CompareResponses, Message } from '../types';

interface ChatViewProps {
    session: Session;
    user: User;
    chats: Chat[];
    setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
    currentChatId: string | null;
    setCurrentChatId: React.Dispatch<React.SetStateAction<string | null>>;
    apiKeys: ApiKeySet;
    showTypingIndicator: boolean;
    setView: (view: string) => void;
    createNewChat: (userId: string) => Promise<void>;
}

const ChatView: React.FC<ChatViewProps> = ({
    session, user, chats, setChats, currentChatId, setCurrentChatId, apiKeys,
    showTypingIndicator, setView, createNewChat
}) => {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [enhancing, setEnhancing] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);
    const [editingChatId, setEditingChatId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
    const [analyzingBias, setAnalyzingBias] = useState(false);
    const [biasAnalysis, setBiasAnalysis] = useState<BiasAnalysis | null>(null);

    // New state for model selection
    const [selectedProviderId, setSelectedProviderId] = useState<string>(providers[0]?.id || '');
    const [selectedModelId, setSelectedModelId] = useState<string>(modelsByProvider[providers[0]?.id]?.[0]?.id || '');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const isAdmin = user.email === ADMIN_EMAIL;
    const currentChat = chats.find(c => c.id === currentChatId);

    // Derived state for compare mode
    const compareMode = currentChat?.compare_mode ?? false;
    const selectedModelsForCompare = currentChat?.selected_models ?? [];
    const compareResponses = currentChat?.compare_responses ?? {};
    const focusedModel = currentChat?.focused_model ?? null;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentChat?.messages, compareResponses, loading]);

    useEffect(() => {
      // When current chat changes, update the provider/model dropdowns
      if (currentChat && !compareMode) {
        const model = allModels.find(m => m.id === currentChat.model);
        if (model) {
          setSelectedProviderId(model.provider);
          setSelectedModelId(model.id);
        }
      }
    }, [currentChatId, currentChat, compareMode]);

    // Auto-resize textarea
    useEffect(() => {
        const textarea = inputRef.current;
        if (textarea) {
            // Temporarily reset height to calculate the new scrollHeight accurately
            textarea.style.height = 'auto';
            // Set the height to the scroll height, respecting the maxHeight from CSS/style prop
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [input]);

    const updateChat = useCallback(async (chatId: string, updates: Partial<Chat>) => {
      setChats(prev => prev.map(c => c.id === chatId ? { ...c, ...updates } : c));
      await supabase.from('chats').update(updates).eq('id', chatId);
    }, [setChats]);


    const deleteChat = async (chatId: string) => {
        if (chats.length <= 1) {
            alert("Can't delete the last chat!");
            return;
        }
        if (window.confirm('Are you sure you want to delete this chat?')) {
            const newChats = chats.filter(c => c.id !== chatId);
            setChats(newChats);
            if (currentChatId === chatId) {
                setCurrentChatId(newChats[0]?.id || null);
            }
            await supabase.from('chats').delete().eq('id', chatId);
        }
    };

    const renameChat = (chatId: string, newName: string) => {
        updateChat(chatId, { name: newName });
        setEditingChatId(null);
    };

    const updateChatModel = (modelId: string) => {
      if (currentChatId) {
        updateChat(currentChatId, { model: modelId });
      }
    };
    
    const handleProviderChange = (providerId: string) => {
        setSelectedProviderId(providerId);
        const firstModelId = modelsByProvider[providerId]?.[0]?.id;
        if(firstModelId) {
            setSelectedModelId(firstModelId);
            if (!compareMode) {
              updateChatModel(firstModelId);
            }
        }
    };

    const handleModelChange = (modelId: string) => {
        setSelectedModelId(modelId);
        if (!compareMode) {
            updateChatModel(modelId);
        }
    };

    const toggleCompareMode = () => {
        if (!currentChatId) return;
        const newCompareMode = !compareMode;
        const updates: Partial<Chat> = {
            compare_mode: newCompareMode,
        };
        if (newCompareMode && selectedModelsForCompare.length === 0) {
            updates.selected_models = ['gemini-pro', 'groq-llama-70b'];
        }
        updateChat(currentChatId, updates);
    };

    const addModelToCompare = () => {
        if (!currentChatId || !selectedModelId) return;
        if (!selectedModelsForCompare.includes(selectedModelId)) {
            const newSelectedModels = [...selectedModelsForCompare, selectedModelId];
            updateChat(currentChatId, { selected_models: newSelectedModels });
        }
    };

    const removeModelFromCompare = (modelId: string) => {
        if (!currentChatId) return;
        const newSelectedModels = selectedModelsForCompare.filter(id => id !== modelId);
        updateChat(currentChatId, { selected_models: newSelectedModels });
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                setAttachedFile({
                    name: file.name,
                    type: file.type,
                    data: (event.target.result as string).split(',')[1],
                });
            }
        };
        reader.readAsDataURL(file);
    };
    
    const enhancePrompt = async () => {
        if (!input.trim()) return;

        const googleApiKey = apiKeys['google'];
        if (!googleApiKey) {
            alert('Please add a Google API key in settings to use the prompt enhancer.');
            setView('settings');
            return;
        }

        setEnhancing(true);
        try {
            const enhancementInstruction = `You are a prompt-enhancing assistant. Rewrite the following user prompt to be more detailed, clear, and effective for a large language model. Your goal is to elicit a high-quality, comprehensive response. Return ONLY the enhanced prompt, without any explanation, preamble, or markdown formatting like quotes.
            
            Original prompt: "${input}"`;
            
            const enhancedText = await generateGeminiContent(
                'gemini-flash-latest',
                googleApiKey,
                [{ role: 'user', content: enhancementInstruction }],
                undefined
            );

            const cleanedText = enhancedText.trim().replace(/^"|"$/g, '').replace(/^prompt:/i, '').trim();
            setInput(cleanedText);
            
            if (inputRef.current) {
                inputRef.current.focus();
            }

        } catch (error: any) {
            alert(`Error enhancing prompt: ${error.message}`);
        } finally {
            setEnhancing(false);
        }
    };
    
    const sendMessage = async () => {
        if (!input.trim() || !currentChat) return;
    
        if (compareMode) {
            await sendCompareMessage();
            return;
        }
    
        const modelIdToUse = focusedModel || currentChat.model;
        const model = allModels.find(m => m.id === modelIdToUse);
        if (!model) {
            alert('Selected model not found.');
            return;
        }
    
        const apiKey = apiKeys[model.provider];
        if (!apiKey) {
            alert(`Please add an API key for ${model.provider} in settings.`);
            setView('settings');
            return;
        }
    
        const userMsg: Message = { role: 'user', content: input, file: attachedFile, timestamp: new Date().toISOString() };
        const newMsgs = [...(currentChat.messages || []), userMsg];
        
        setChats(chats.map(c => c.id === currentChatId ? { ...c, messages: newMsgs } : c));
        if ((currentChat.messages?.length || 0) === 0 && currentChat.name === 'New Chat') {
            const newName = input.slice(0, 30) + (input.length > 30 ? '...' : '');
            updateChat(currentChat.id, { name: newName });
        }
    
        setInput('');
        setAttachedFile(null);
        setLoading(true);
    
        try {
            const history = newMsgs.map(m => ({ role: m.role, content: m.content }));
            let responseText: string;
    
            if (model.provider === 'google') {
                responseText = await generateGeminiContent(model.endpoint, apiKey, history, userMsg.file);
            } else {
                responseText = await callGenericApi(model, apiKey, history);
            }
    
            const assistantMsg: Message = { role: 'assistant', content: responseText, timestamp: new Date().toISOString() };
            const finalMsgs = [...newMsgs, assistantMsg];
            updateChat(currentChat.id, { messages: finalMsgs });
        } catch (error: any) {
            alert(`Error: ${error.message}`);
            setChats(chats.map(c => c.id === currentChatId ? { ...c, messages: newMsgs.slice(0, -1) } : c));
        } finally {
            setLoading(false);
        }
    };
    
    const sendCompareMessage = async () => {
        if (!input.trim() || !currentChat || selectedModelsForCompare.length === 0) return;

        const userPrompt = input;
        setInput('');
        setLoading(true);
        setBiasAnalysis(null);
    
        const newResponses: CompareResponses = {};

        const promises = selectedModelsForCompare.map(async (modelId) => {
            const model = allModels.find(m => m.id === modelId);
            if (!model) return;
            
            const apiKey = apiKeys[model.provider];
            if (!apiKey) {
                newResponses[modelId] = [...(compareResponses[modelId] || []), { role: 'user', content: userPrompt }, {role: 'assistant', content: `Error: API key for ${model.provider} not found.`}];
                return;
            }

            const history: { role: 'user' | 'assistant'; content: string }[] = [...(compareResponses[modelId] || []), { role: 'user', content: userPrompt }];
            try {
                let responseText: string;
                if (model.provider === 'google') {
                    responseText = await generateGeminiContent(model.endpoint, apiKey, history, attachedFile || undefined);
                } else {
                    responseText = await callGenericApi(model, apiKey, history);
                }
                newResponses[modelId] = [...history, { role: 'assistant', content: responseText }];
            } catch (error: any) {
                newResponses[modelId] = [...history, { role: 'assistant', content: `Error: ${error.message}` }];
            }
        });
    
        await Promise.all(promises);
    
        const updatedCompareResponses = { ...compareResponses, ...newResponses };
        updateChat(currentChat.id, { compare_responses: updatedCompareResponses });
    
        setLoading(false);
    };

    const continueWithModel = async(modelId: string) => {
        if(!currentChatId) return;
        const history = compareResponses[modelId];
        if(!history || history.length === 0) {
            alert('No conversation to continue.');
            return;
        }

        const convertedMessages: Message[] = history.map((msg, idx) => ({
            ...msg,
            timestamp: new Date(Date.now() - (history.length - idx) * 1000).toISOString()
        }));

        updateChat(currentChatId, {
            compare_mode: false,
            model: modelId,
            messages: convertedMessages,
            selected_models: [],
            compare_responses: {},
            focused_model: null,
        });
    }

    const analyzeBias = async () => {
      // implementation omitted for brevity
    };


    return (
        <div className="flex h-screen text-white overflow-hidden">
            {showSidebar && <div className="md:hidden fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40" onClick={() => setShowSidebar(false)} />}

            <div className={`${showSidebar ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-50 md:z-auto w-64 glass-dark border-r border-white border-opacity-20 flex flex-col transition-transform h-full`}>
                <div className="p-3 md:p-4 border-b border-white border-opacity-20 space-y-2">
                    <button onClick={() => { createNewChat(user.id); setShowSidebar(false); }}
                        className="w-full glass-button hover:bg-blue-700 px-3 py-2 rounded-lg flex items-center justify-center gap-2 text-sm md:text-base">
                        <PlusIcon />New Chat
                    </button>
                    <button onClick={() => setView('image')}
                        className="w-full glass-button hover:bg-pink-700 px-3 py-2 rounded-lg flex items-center justify-center gap-2 text-sm" style={{ background: 'rgba(236, 72, 153, 0.3)' }}>
                        <ImageIcon />Generate Image
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                    {chats.map(chat => (
                        <div key={chat.id}
                            className={`p-2 md:p-3 mb-2 rounded-lg cursor-pointer group glass-card ${currentChatId === chat.id ? 'bg-blue-500 bg-opacity-30' : 'hover:bg-white hover:bg-opacity-10'}`}
                            onClick={() => { setCurrentChatId(chat.id); setShowSidebar(false); }}>
                            <div className="flex items-center justify-between">
                                {editingChatId === chat.id ? (
                                    <input type="text" value={editingName} onChange={(e) => setEditingName(e.target.value)}
                                        onBlur={() => renameChat(chat.id, editingName)}
                                        onKeyPress={(e) => e.key === 'Enter' && renameChat(chat.id, editingName)}
                                        className="bg-gray-600 px-2 py-1 rounded text-sm flex-1 text-white" autoFocus
                                        onClick={(e) => e.stopPropagation()} />
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <MessageIcon /><span className="text-xs md:text-sm truncate">{chat.name}</span>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                                            <button onClick={(e) => { e.stopPropagation(); setEditingChatId(chat.id); setEditingName(chat.name); }}
                                                className="p-1 hover:bg-gray-600 rounded"><EditIcon /></button>
                                            <button onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}
                                                className="p-1 hover:bg-gray-600 rounded"><TrashIcon /></button>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">{allModels.find(m => m.id === chat.model)?.name}</div>
                            {chat.compare_mode && <div className="text-xs text-purple-400 mt-1">🔄 Compare Mode</div>}
                        </div>
                    ))}
                </div>

                <div className="p-3 md:p-4 border-t border-white border-opacity-20">
                    <div className="flex items-center gap-2 md:gap-3 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 glass">
                            {isAdmin ? <ShieldIcon /> : <UserIcon />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className="text-xs md:text-sm font-semibold block truncate">{user.email}</span>
                            {isAdmin && <span className="text-xs text-yellow-400">Admin</span>}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setView('settings')} className="flex-1 p-2 glass-card hover:bg-opacity-30 rounded-lg flex justify-center items-center">
                            <SettingsIcon />
                        </button>
                        <button onClick={() => supabase.auth.signOut()} className="p-2 glass-card hover:bg-opacity-30 rounded-lg flex justify-center items-center">
                            <LogOutIcon />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col min-w-0">
              <div className="glass-dark border-b border-white border-opacity-20 p-3 md:p-4 flex items-center gap-2 flex-wrap">
                  <button onClick={() => setShowSidebar(!showSidebar)} className="md:hidden p-2 glass-card hover:bg-opacity-30 rounded-lg">
                      <MenuIcon />
                  </button>
                  <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm md:text-base truncate">{currentChat?.name || 'Chat'}</div>
                  </div>
                  <button onClick={toggleCompareMode}
                      className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold flex items-center gap-1.5 glass-card transition-all hover:scale-105 ${
                          compareMode ? 'bg-opacity-40 ring-2 ring-purple-400 ring-opacity-50' : 'hover:bg-opacity-30'
                      }`}>
                      <ColumnsIcon />
                      {compareMode ? 'Compare ON' : 'Compare OFF'}
                  </button>

                  {!compareMode && (
                      <div className="flex gap-2 items-center">
                          <select value={selectedProviderId} onChange={(e) => handleProviderChange(e.target.value)}
                              className="glass-input text-white px-2 py-1.5 rounded-lg text-xs md:text-sm border border-white border-opacity-20">
                              {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                          <select value={selectedModelId} onChange={(e) => handleModelChange(e.target.value)}
                              className="glass-input text-white px-2 py-1.5 rounded-lg text-xs md:text-sm border border-white border-opacity-20">
                              {(modelsByProvider[selectedProviderId] || []).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                          </select>
                      </div>
                  )}
              </div>
              
              {compareMode && (
                <div className="glass-dark border-b border-white border-opacity-20 p-2 md:p-3">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <select value={selectedProviderId} onChange={(e) => handleProviderChange(e.target.value)} className="glass-input text-white px-2 py-1.5 rounded-lg text-xs md:text-sm">
                        {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <select value={selectedModelId} onChange={(e) => setSelectedModelId(e.target.value)} className="glass-input text-white px-2 py-1.5 rounded-lg text-xs md:text-sm">
                        {(modelsByProvider[selectedProviderId] || []).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                    <button onClick={addModelToCompare} className="glass-button px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold">Add Model</button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedModelsForCompare.map(modelId => {
                        const model = allModels.find(m => m.id === modelId);
                        if (!model) return null;
                        return (
                            <div key={modelId} className="glass-card px-2 py-1 rounded-full text-xs flex items-center gap-2" style={{borderColor: providers.find(p => p.id === model.provider)?.color, borderWidth: 1}}>
                                <span>{model.name}</span>
                                <button onClick={() => removeModelFromCompare(modelId)} className="bg-red-500/50 hover:bg-red-500/80 rounded-full w-4 h-4 flex items-center justify-center text-white">
                                    &times;
                                </button>
                            </div>
                        )
                    })}
                  </div>
                </div>
              )}
              
                <div className="flex-1 overflow-y-auto p-3 md:p-4 custom-scrollbar">
                    {(!currentChat?.messages || currentChat.messages.length === 0) && !compareMode && Object.keys(compareResponses).length === 0 && (
                        <div className="text-center text-gray-300 mt-10 md:mt-20">
                            <div className="text-4xl md:text-6xl mb-4">👋</div>
                            <div className="text-lg md:text-xl font-semibold">Start a conversation</div>
                            <div className="text-xs md:text-sm mt-2 glass-card inline-block px-4 py-2 rounded-lg">
                                Using {allModels.find(m => m.id === currentChat?.model)?.name}
                            </div>
                        </div>
                    )}
                    
                    {!compareMode && currentChat?.messages?.map((msg, idx) => (
                        <div key={idx} className={`flex mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                            <div className={`max-w-[85%] md:max-w-[80%] rounded-2xl p-3 md:p-4 glass-card message-content transition-all hover:scale-[1.02] relative group ${msg.role === 'user' ? 'bg-opacity-40' : ''}`} style={msg.role === 'user' ? { background: 'rgba(59, 130, 246, 0.3)' } : {}}>
                                <button className="absolute top-2 right-2 p-1 glass-card hover:bg-opacity-60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => navigator.clipboard.writeText(msg.content)} title="Copy message">
                                    <CopyIcon />
                                </button>
                                {msg.file && <div className="text-xs mb-2 opacity-75 flex items-center gap-1">📎 {msg.file.name}</div>}
                                {msg.role === 'user' ?
                                    (<div className="whitespace-pre-wrap break-words">{msg.content}</div>) :
                                    (<MarkdownRenderer content={msg.content} />)
                                }
                            </div>
                        </div>
                    ))}

                    {compareMode && (
                        <div className="flex overflow-x-auto custom-scrollbar pb-4 gap-4 -mx-4 px-4">
                        {selectedModelsForCompare.map(modelId => {
                            const model = allModels.find(m => m.id === modelId);
                            if (!model) return null;
                            const history = compareResponses[modelId] || [];
                            return (
                                <div key={modelId} className="compare-column flex-shrink-0 w-[90%] md:w-[45%] lg:w-[48%] xl:w-[32%] glass-card rounded-lg p-3 md:p-4 transition-all">
                                    <h3 className="font-bold text-sm md:text-base flex items-center gap-2 mb-3 sticky top-0 bg-inherit pt-1 pb-2 border-b border-white/20">
                                        <div className="w-3 h-3 rounded-full shadow-lg" style={{backgroundColor: providers.find(p=>p.id===model.provider)?.color}} />
                                        {model.name}
                                        <button onClick={() => continueWithModel(model.id)} className="ml-auto text-xs glass-button px-2 py-1 rounded-md">Continue</button>
                                    </h3>
                                    <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar pr-2">
                                    {history.map((msg, idx) => (
                                        <div key={idx} className={`glass-card p-3 rounded-lg relative group text-sm ${msg.role==='user'?'bg-opacity-20':'bg-opacity-10'}`}>
                                             <div className="font-semibold mb-1.5 text-xs opacity-70 flex items-center gap-1">
                                                {msg.role==='user'?'👤 You':'🤖 AI'}:
                                            </div>
                                            {msg.role === 'user' ?
                                                (<div className="whitespace-pre-wrap break-words">{msg.content}</div>) :
                                                (<MarkdownRenderer content={msg.content} />)
                                            }
                                        </div>
                                    ))}
                                    </div>
                                </div>
                            );
                        })}
                        </div>
                    )}


                    {loading && showTypingIndicator && (
                        <div className="flex justify-start mb-4">
                            <div className="glass-card rounded-2xl p-3 md:p-4">
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 bg-white rounded-full animate-bounce-1 opacity-60" />
                                    <div className="w-2 h-2 bg-white rounded-full animate-bounce-2 opacity-60" />
                                    <div className="w-2 h-2 bg-white rounded-full animate-bounce-3 opacity-60" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="glass-dark border-t border-white border-opacity-20 p-2 md:p-4">
                    {attachedFile && (
                        <div className="mb-2 flex items-center gap-2 glass-card p-2 rounded text-xs md:text-sm">
                            <span className="truncate">📎 {attachedFile.name}</span>
                            <button onClick={() => setAttachedFile(null)} className="text-red-400 hover:text-red-300 ml-auto">×</button>
                        </div>
                    )}
                    <div className="flex gap-1 md:gap-2 items-end">
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*,application/pdf,.txt" className="hidden" />
                        <button onClick={() => fileInputRef.current?.click()} disabled={loading || enhancing}
                            className="p-2 md:p-3 glass-card hover:bg-opacity-30 rounded-lg disabled:opacity-50" title="Attach file">
                            <PaperclipIcon />
                        </button>
                        <button onClick={enhancePrompt} disabled={loading || enhancing || !input.trim()}
                            className="p-2 md:p-3 glass-card hover:bg-opacity-30 rounded-lg disabled:opacity-50 flex items-center justify-center" title="Enhance prompt">
                            {enhancing ? (
                                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                            ) : (
                                <SparklesIcon />
                            )}
                        </button>
                        <textarea ref={inputRef} value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                            placeholder={compareMode ? "Ask all selected AIs..." : "Type a message..."}
                            disabled={loading || enhancing} rows={1}
                            className="flex-1 glass-input text-white px-3 md:px-4 py-2 md:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base resize-none"
                            style={{ maxHeight: '120px' }}
                        />
                        <button onClick={sendMessage} disabled={loading || enhancing || !input.trim()}
                            className="px-4 md:px-6 glass-button hover:bg-blue-700 rounded-lg disabled:opacity-50 self-stretch flex items-center justify-center">
                            <SendIcon />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatView;