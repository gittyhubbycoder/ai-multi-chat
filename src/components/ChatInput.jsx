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
    <div className="p-5 sm:p-6 border-t border-white/20 glass-dark">
      {attachedFile && (
        <div className="mb-5 flex items-center gap-4 p-4 glass rounded-xl w-fit max-w-full">
          <span className="text-xl">📎</span>
          <span className="text-base font-semibold truncate">{attachedFile.name}</span>
          <button
            onClick={() => setAttachedFile(null)}
            className="p-2 hover:bg-white/20 rounded-lg flex-shrink-0 transition-colors glass-button-secondary"
            aria-label="Remove file"
          >
            <CloseIcon />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-4">
        <div className="flex-1 relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="glass-input w-full px-5 py-4 pr-32 resize-none max-h-44 text-base font-medium"
            style={{ minHeight: '60px' }}
          />
          
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
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
              className="p-2.5 text-white/70 hover:text-white transition-colors rounded-xl hover:bg-white/10 glass-button-secondary"
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
                className="p-2.5 text-white/70 hover:text-indigo-400 transition-colors disabled:opacity-30 rounded-xl hover:bg-white/10 glass-button-secondary"
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
          className="glass-button flex items-center gap-2 flex-shrink-0 px-6"
        >
          <SendIcon />
          <span className="hidden sm:inline font-semibold">Send</span>
        </button>
      </form>

      <p className="text-sm text-white/50 mt-4 text-center hidden sm:block font-medium">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
}
