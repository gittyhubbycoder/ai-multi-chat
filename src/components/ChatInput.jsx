import { useState, useRef } from 'react';
import { SendIcon, SparklesIcon, PaperclipIcon, CloseIcon } from './Icons';
import toast from 'react-hot-toast';

export default function ChatInput({
  onSend,
  onEnhance,
  disabled,
  placeholder = "Type your message..."
}) {
  const [input, setInput] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [enhancing, setEnhancing] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!input.trim() || disabled) return;
    onSend(input, attachedFile);
    setInput('');
    setAttachedFile(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Max 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachedFile({
        name: file.name,
        type: file.type,
        data: event.target.result.split(',')[1]
      });
      toast.success(`Attached: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  const handleEnhance = async () => {
    if (!input.trim() || !onEnhance) return;
    setEnhancing(true);
    try {
      const enhanced = await onEnhance(input);
      if (enhanced) setInput(enhanced);
    } catch {
      toast.error('Failed to enhance prompt');
    }
    setEnhancing(false);
  };

  return (
    <div className="p-3 sm:p-4 border-t border-white/10 bg-glass-dark">
      {attachedFile && (
        <div className="mb-3 flex items-center gap-2 p-2 sm:p-2.5 bg-white/10 rounded-lg w-fit max-w-full">
          <span className="text-sm sm:text-base">📎</span>
          <span className="text-xs sm:text-sm truncate">{attachedFile.name}</span>
          <button
            onClick={() => setAttachedFile(null)}
            className="p-1 hover:bg-white/10 rounded flex-shrink-0"
            aria-label="Remove file"
          >
            <CloseIcon />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3">
        <div className="flex-1 relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="glass-input w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-20 sm:pr-24 resize-none max-h-32 text-sm sm:text-base"
            style={{ minHeight: '44px' }}
          />
          
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 sm:gap-1">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,.pdf,.txt,.md"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 sm:p-2 text-white/50 hover:text-white/80 transition-colors"
              title="Attach file"
              aria-label="Attach file"
            >
              <PaperclipIcon />
            </button>
            {onEnhance && (
              <button
                type="button"
                onClick={handleEnhance}
                disabled={!input.trim() || enhancing}
                className="p-1.5 sm:p-2 text-white/50 hover:text-indigo-400 transition-colors disabled:opacity-30"
                title="Enhance prompt"
                aria-label="Enhance prompt"
              >
                <SparklesIcon />
              </button>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={!input.trim() || disabled}
          className="glass-button px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-1.5 sm:gap-2 flex-shrink-0"
        >
          <SendIcon />
          <span className="hidden sm:inline text-sm sm:text-base">Send</span>
        </button>
      </form>

      <p className="text-xs text-white/30 mt-2 text-center hidden sm:block">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
}
