export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 p-5 sm:p-6">
      <div className="flex gap-2">
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
      <span className="text-sm sm:text-base text-white/60 font-medium">AI is thinking...</span>
    </div>
  );
}
