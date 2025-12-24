import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { callGenericApi } from '../services/apiService';
import { allModels, modelsByProvider, providers, ADMIN_EMAIL } from '../constants';
import MarkdownRenderer from './MarkdownRenderer';
import {
    SendIcon, UserIcon, SettingsIcon, LogOutIcon, TrashIcon, PlusIcon, MessageIcon,
    EditIcon, ShieldIcon, ImageIcon, PaperclipIcon, SparklesIcon, ColumnsIcon, AnalyzeIcon,
    MenuIcon, CloseIcon, ArrowRightIcon, CopyIcon
} from './Icons';
import type { Session, User } from '@supabase/supabase-js';
import type { ApiKeySet, AttachedFile, BiasAnalysis, Chat, CompareResponses, Message, Model } from '../types';

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
            textarea.style.height = 'auto';
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

            const enhancerModel = allModels.find(m => m.id === 'gemini-flash');
            if (!enhancerModel) throw new Error("Enhancer model is not configured.");
            
            const enhancedText = await callGenericApi(
                enhancerModel,
                googleApiKey,
                [{ role: 'user', content: enhancementInstruction }]
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
            const responseText = await callGenericApi(model, apiKey, history, userMsg.file);
    
            const assistantMsg: Message = { role: 'assistant', content: responseText, timestamp: new Date().toISOString() };
            const finalMsgs = [...newMsgs, assistantMsg];
            updateChat(currentChat.id, { messages: finalMsgs });
        } catch (error: any) {
            alert(`Error: ${error.message}`);
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
                const responseText = await callGenericApi(model, apiKey, history, attachedFile || undefined);
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
        if (!currentChat || !compareMode || Object.keys(compareResponses).length === 0) return;
    
        const cerebrasApiKey = apiKeys['cerebras'];
        if (!cerebrasApiKey) {
            alert('Please add a Cerebras API key in settings to perform analysis.');
            setView('settings');
            return;
        }
    
        setAnalyzingBias(true);
        setBiasAnalysis(null);
    
        try {
            const lastUserMessage = Object.values(compareResponses)[0].filter(m => m.role === 'user').pop();
            if (!lastUserMessage) {
                throw new Error("Could not find the user's prompt to analyze.");
            }
            const userPrompt = lastUserMessage.content;
    
            const responsesToAnalyze = selectedModelsForCompare.map(modelId => {
                const model = allModels.find(m => m.id === modelId);
                const lastResponse = compareResponses[modelId]?.filter(m => m.role === 'assistant').pop();
                return {
                    name: model?.name || modelId,
                    response: lastResponse?.content || "No response generated."
                };
            });
    
            const responsesString = responsesToAnalyze.map(r => `--- MODEL: ${r.name} ---\n${r.response}\n`).join('\n');
    
            const analysisPrompt = `
            You are an expert AI model evaluator. Your task is to analyze a set of AI-generated responses to a user's prompt. Evaluate each response based on the following criteria:
            1.  **Bias**: How neutral and objective is the response? Does it favor any particular viewpoint, group, or ideology unfairly? A high score (100) means very low bias.
            2.  **Credibility**: How trustworthy and accurate is the information provided? A high score (100) means highly credible.
            3.  **Completeness**: Does the response fully address all parts of the user's prompt? A high score (100) means it is very comprehensive.
            4.  **Clarity**: How easy is the response to understand? Is it well-structured and free of jargon? A high score (100) means it is very clear.

            User Prompt:
            "${userPrompt}"

            AI Responses:
            ${responsesString}

            Your task is to return your analysis as a single JSON object. For each model, provide a numeric score from 0 (poor) to 100 (excellent) for each criterion, along with a brief summary of your reasoning. Finally, provide an overall 'recommendation' suggesting which response is the best and why.

            The JSON object must have the following structure:
            {
              "recommendation": "string",
              "models": [
                {
                  "name": "string",
                  "bias": "number",
                  "credibility": "number",
                  "completeness": "number",
                  "clarity": "number",
                  "summary": "string"
                }
              ]
            }

            IMPORTANT: Your entire response must be ONLY the raw JSON object, without any surrounding text, explanations, or markdown code fences (like \`\`\`json). The response must start with "{" and end with "}".
            `;
    
            const analyzerModel = allModels.find(m => m.id === 'cerebras-llama');
            if (!analyzerModel) throw new Error("Analyzer model (Cerebras Llama) is not configured.");
            
            const analysisJsonStringRaw = await callGenericApi(
                analyzerModel,
                cerebrasApiKey,
                [{ role: 'user', content: analysisPrompt }]
            );
    
            // Clean the response to ensure it's valid JSON before parsing
            const cleanedJsonString = analysisJsonStringRaw.replace(/```json/g, '').replace(/```/g, '').trim();
    
            const analysisResult: BiasAnalysis = JSON.parse(cleanedJsonString);
            setBiasAnalysis(analysisResult);
    
        } catch (error: any) {
            alert(`Error during analysis: ${error.message}`);
        } finally {
            setAnalyzingBias(false);
        }
    };
    
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const ProgressBar: React.FC<{ score: number }> = ({ score }) => (
        <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div className={`${getScoreColor(score)} h-2.5 rounded-full`} style={{ width: `${score}%` }}></div>
        </div>
    );

    return (
        <div className="flex h-screen text-white overflow-hidden">
            {biasAnalysis && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={() => setBiasAnalysis(null)}>
                    <div className="glass-dark rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar p-6 md:p-8" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2"><AnalyzeIcon /> Bias & Quality Analysis</h2>
                            <button onClick={() => setBiasAnalysis(null)} className="p-2 glass-card hover:bg-opacity-50 rounded-full"><CloseIcon /></button>
                        </div>
                        
                        <div className="mb-6 glass-card p-4 rounded-lg bg-blue-500/20 border border-blue-400/50">
                            <h3 className="font-semibold mb-2 text-md md:text-lg text-blue-300">🏆 Recommendation</h3>
                            <p className="text-sm md:text-base">{biasAnalysis.recommendation}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {biasAnalysis.models.map(modelAnalysis => (
                                <div key={modelAnalysis.name} className="glass-card p-4 rounded-lg flex flex-col gap-3">
                                    <h4 className="font-bold text-md">{modelAnalysis.name}</h4>
                                    <div className="space-y-3 text-xs">
                                        <div className="flex items-center justify-between gap-2"><span>Bias</span><div className="w-2/3 flex items-center gap-2"><ProgressBar score={modelAnalysis.bias} /><span className="w-8 text-right font-mono">{modelAnalysis.bias}</span></div></div>
                                        <div className="flex items-center justify-between gap-2"><span>Credibility</span><div className="w-2/3 flex items-center gap-2"><ProgressBar score={modelAnalysis.credibility} /><span className="w-8 text-right font-mono">{modelAnalysis.credibility}</span></div></div>
                                        <div className="flex items-center justify-between gap-2"><span>Completeness</span><div className="w-2/3 flex items-center gap-2"><ProgressBar score={modelAnalysis.completeness} /><span className="w-8 text-right font-mono">{modelAnalysis.completeness}</span></div></div>
                                        <div className="flex items-center justify-between gap-2"><span>Clarity</span><div className="w-2/3 flex items-center gap-2"><ProgressBar score={modelAnalysis.clarity} /><span className="w-8 text-right font-mono">{modelAnalysis.clarity}</span></div></div>
                                    </div>
                                    <p className="text-xs text-gray-300 mt-2 bg-black/20 p-2 rounded-md">{modelAnalysis.summary}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

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
                        <>
                            {Object.keys(compareResponses).length > 0 && (
                                <div className="text-center my-4">
                                    <button onClick={analyzeBias} disabled={loading || analyzingBias} className="glass-button hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 mx-auto disabled:opacity-50" style={{ background: 'rgba(168, 85, 247, 0.4)' }}>
                                        {analyzingBias ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                                                Analyzing...
                                            </>
                                        ) : (
                                            <>
                                                <AnalyzeIcon />
                                                Analyze Responses
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
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
                        </>
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
