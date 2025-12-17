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
    <div className="p-4 sm:p-5 border-t border-white/10 glass-dark">
      {attachedFile && (
        <div className="mb-4 flex items-center gap-3 p-3 bg-white/10 rounded-lg w-fit max-w-full glass">
          <span className="text-lg">📎</span>
          <span className="text-sm sm:text-base font-medium truncate">{attachedFile.name}</span>
          <button
            onClick={() => setAttachedFile(null)}
            className="p-1.5 hover:bg-white/20 rounded-lg flex-shrink-0 transition-colors"
            aria-label="Remove file"
          >
            <CloseIcon />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1 relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="glass-input w-full px-4 py-3.5 pr-28 resize-none max-h-40 text-base"
            style={{ minHeight: '52px' }}
          />
          
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
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
              className="p-2 text-white/60 hover:text-white/90 transition-colors rounded-lg hover:bg-white/10"
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
                className="p-2 text-white/60 hover:text-indigo-400 transition-colors disabled:opacity-30 rounded-lg hover:bg-white/10"
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
          className="glass-button flex items-center gap-2 flex-shrink-0"
        >
          <SendIcon />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>

      <p className="text-xs text-white/40 mt-3 text-center hidden sm:block">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
}
