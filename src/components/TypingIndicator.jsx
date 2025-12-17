export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 p-4">
      <div className="flex gap-1">
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
      <span className="text-sm text-white/50">AI is thinking...</span>
    </div>
  );
}
