export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 sm:gap-3 p-4 sm:p-6">
      <div className="flex gap-1">
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
      <span className="text-xs sm:text-sm text-white/50">AI is thinking...</span>
    </div>
  );
}
