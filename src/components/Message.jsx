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
    <div className={`flex gap-4 p-4 animate-fadeIn ${isUser ? '' : 'bg-white/5'}`}>
      <div 
        className={`
          w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
          ${isUser 
            ? 'bg-gradient-to-br from-indigo-500 to-purple-600' 
            : 'bg-gradient-to-br from-emerald-500 to-teal-600'}
        `}
        style={!isUser && modelColor ? { background: `linear-gradient(135deg, ${modelColor}, ${modelColor}99)` } : {}}
      >
        {isUser ? (
          <UserIcon />
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A1.5 1.5 0 0 0 6 14.5 1.5 1.5 0 0 0 7.5 16 1.5 1.5 0 0 0 9 14.5 1.5 1.5 0 0 0 7.5 13m9 0a1.5 1.5 0 0 0-1.5 1.5 1.5 1.5 0 0 0 1.5 1.5 1.5 1.5 0 0 0 1.5-1.5 1.5 1.5 0 0 0-1.5-1.5" />
          </svg>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-medium text-sm">
            {isUser ? 'You' : 'AI'}
          </span>
          {message.timestamp && (
            <span className="text-xs text-white/30">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          )}
        </div>

        {message.file && (
          <div className="mb-2 p-2 bg-white/10 rounded-lg inline-flex items-center gap-2 text-sm">
            <span>📎</span>
            <span>{message.file.name}</span>
          </div>
        )}

        {isUser ? (
          <p className="text-white/90 whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div 
            className="markdown-content text-white/90"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
          />
        )}

        {!isUser && (
          <button
            onClick={handleCopy}
            className="mt-3 flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
            {copied ? 'Copied!' : 'Copy response'}
          </button>
        )}
      </div>
    </div>
  );
}
