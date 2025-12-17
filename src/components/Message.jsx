import { useState } from 'react';
import { UserIcon, CopyIcon, CheckIcon } from './Icons';
import { renderMarkdown, copyToClipboard } from '../utils/markdown';
import toast from 'react-hot-toast';

export default function Message({ message, modelColor }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    const success = await copyToClipboard(message.content);
    if (success) {
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`flex gap-5 p-6 sm:p-8 animate-fadeIn ${isUser ? '' : 'glass-card mx-3 sm:mx-6 my-3'}`}>
      <div 
        className={`
          w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0
          ${isUser 
            ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-xl shadow-indigo-500/40' 
            : 'bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 shadow-xl shadow-emerald-500/40'}
        `}
        style={!isUser && modelColor ? { 
          background: `linear-gradient(135deg, ${modelColor}, ${modelColor}cc, ${modelColor}99)`,
          boxShadow: `0 8px 24px ${modelColor}50`
        } : {}}
      >
        {isUser ? (
          <UserIcon />
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6 sm:w-7 sm:h-7 text-white">
            <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A1.5 1.5 0 0 0 6 14.5 1.5 1.5 0 0 0 7.5 16 1.5 1.5 0 0 0 9 14.5 1.5 1.5 0 0 0 7.5 13m9 0a1.5 1.5 0 0 0-1.5 1.5 1.5 1.5 0 0 0 1.5 1.5 1.5 1.5 0 0 0 1.5-1.5 1.5 1.5 0 0 0-1.5-1.5" />
          </svg>
        )}
      </div>

      <div className="flex-1 min-w-0 max-w-full">
        <div className="flex items-center gap-3 mb-4">
          <span className="font-bold text-lg sm:text-xl text-white">
            {isUser ? 'You' : 'AI'}
          </span>
          {message.timestamp && (
            <span className="text-sm text-white/50 font-medium">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          )}
        </div>

        {message.file && (
          <div className="mb-4 p-4 glass rounded-xl inline-flex items-center gap-3 text-base">
            <span className="text-xl">📎</span>
            <span className="font-semibold">{message.file.name}</span>
          </div>
        )}

        {isUser ? (
          <p className="text-white whitespace-pre-wrap text-lg sm:text-xl leading-relaxed font-medium">{message.content}</p>
        ) : (
          <div 
            className="markdown-content text-white"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
          />
        )}

        {!isUser && (
          <button
            onClick={handleCopy}
            className="mt-5 flex items-center gap-2 text-base text-white/70 hover:text-white transition-colors font-semibold glass-button-secondary px-4 py-2 rounded-xl"
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
            {copied ? 'Copied!' : 'Copy response'}
          </button>
        )}
      </div>
    </div>
  );
}
