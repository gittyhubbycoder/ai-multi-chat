export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-4 p-6 sm:p-8">
      <div className="flex gap-2.5">
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
      <span className="text-base sm:text-lg text-white/70 font-semibold">AI is thinking...</span>
    </div>
  );
}
