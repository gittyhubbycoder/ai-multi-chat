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
    <div className="p-4 border-t border-white/10">
      {attachedFile && (
        <div className="mb-3 flex items-center gap-2 p-2 bg-white/10 rounded-lg w-fit">
          <span>📎</span>
          <span className="text-sm">{attachedFile.name}</span>
          <button
            onClick={() => setAttachedFile(null)}
            className="p-1 hover:bg-white/10 rounded"
          >
            <CloseIcon />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="glass-input w-full px-4 py-3 pr-24 resize-none max-h-32"
            style={{ minHeight: '48px' }}
          />
          
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
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
              className="p-2 text-white/50 hover:text-white/80 transition-colors"
              title="Attach file"
            >
              <PaperclipIcon />
            </button>
            {onEnhance && (
              <button
                type="button"
                onClick={handleEnhance}
                disabled={!input.trim() || enhancing}
                className="p-2 text-white/50 hover:text-indigo-400 transition-colors disabled:opacity-30"
                title="Enhance prompt"
              >
                <SparklesIcon />
              </button>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={!input.trim() || disabled}
          className="glass-button px-4 py-3 flex items-center gap-2"
        >
          <SendIcon />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>

      <p className="text-xs text-white/30 mt-2 text-center">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
}
