import { AnalyzeIcon } from './Icons';

export default function BiasAnalysis({ analysis, onAnalyze, analyzing }) {
  if (!analysis && !onAnalyze) return null;

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBar = (score) => {
    return (
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${
            score >= 8 ? 'bg-green-400' : score >= 5 ? 'bg-yellow-400' : 'bg-red-400'
          }`}
          style={{ width: `${score * 10}%` }}
        />
      </div>
    );
  };

  return (
    <div className="p-3 sm:p-4 border-t border-white/10 bg-glass-dark">
      {!analysis && onAnalyze && (
        <button
          onClick={onAnalyze}
          disabled={analyzing}
          className="glass-button w-full py-2.5 sm:py-3 flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <AnalyzeIcon />
          {analyzing ? 'Analyzing responses...' : 'Analyze Bias & Quality'}
        </button>
      )}

      {analysis && (
        <div className="space-y-3 sm:space-y-4 animate-fadeIn">
          <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2">
            <AnalyzeIcon />
            Analysis Results
          </h3>

          <div className="grid gap-3 sm:gap-4">
            {analysis.models?.map((model, idx) => (
              <div key={idx} className="glass p-3 sm:p-4 rounded-xl space-y-3">
                <h4 className="font-medium text-sm sm:text-base">{model.name}</h4>
                
                <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-white/60">Bias</span>
                      <span className={getScoreColor(model.bias)}>{model.bias}/10</span>
                    </div>
                    {getScoreBar(model.bias)}
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-white/60">Credibility</span>
                      <span className={getScoreColor(model.credibility)}>{model.credibility}/10</span>
                    </div>
                    {getScoreBar(model.credibility)}
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-white/60">Completeness</span>
                      <span className={getScoreColor(model.completeness)}>{model.completeness}/10</span>
                    </div>
                    {getScoreBar(model.completeness)}
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-white/60">Clarity</span>
                      <span className={getScoreColor(model.clarity)}>{model.clarity}/10</span>
                    </div>
                    {getScoreBar(model.clarity)}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-white/70 leading-relaxed">{model.summary}</p>
              </div>
            ))}
          </div>

          {analysis.recommendation && (
            <div className="glass p-3 sm:p-4 rounded-xl bg-indigo-500/10 border-indigo-500/30">
              <h4 className="font-medium mb-2 text-indigo-300 text-sm sm:text-base">Recommendation</h4>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed">{analysis.recommendation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
