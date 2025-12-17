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
    <div className="p-5 sm:p-6 border-t border-white/20 glass-dark">
      {!analysis && onAnalyze && (
        <button
          onClick={onAnalyze}
          disabled={analyzing}
          className="glass-button w-full py-4 flex items-center justify-center gap-3 text-lg font-semibold"
        >
          <AnalyzeIcon />
          {analyzing ? 'Analyzing responses...' : 'Analyze Bias & Quality'}
        </button>
      )}

      {analysis && (
        <div className="space-y-5 animate-fadeIn">
          <h3 className="font-bold text-xl sm:text-2xl flex items-center gap-3 text-white">
            <AnalyzeIcon />
            Analysis Results
          </h3>

          <div className="grid gap-5">
            {analysis.models?.map((model, idx) => (
              <div key={idx} className="glass-card p-5 sm:p-6 space-y-5">
                <h4 className="font-bold text-lg sm:text-xl text-white">{model.name}</h4>
                
                <div className="grid grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <div className="flex justify-between mb-3">
                      <span className="text-white/80 font-semibold text-base">Bias</span>
                      <span className={`${getScoreColor(model.bias)} font-bold text-lg`}>{model.bias}/10</span>
                    </div>
                    {getScoreBar(model.bias)}
                  </div>
                  <div>
                    <div className="flex justify-between mb-3">
                      <span className="text-white/80 font-semibold text-base">Credibility</span>
                      <span className={`${getScoreColor(model.credibility)} font-bold text-lg`}>{model.credibility}/10</span>
                    </div>
                    {getScoreBar(model.credibility)}
                  </div>
                  <div>
                    <div className="flex justify-between mb-3">
                      <span className="text-white/80 font-semibold text-base">Completeness</span>
                      <span className={`${getScoreColor(model.completeness)} font-bold text-lg`}>{model.completeness}/10</span>
                    </div>
                    {getScoreBar(model.completeness)}
                  </div>
                  <div>
                    <div className="flex justify-between mb-3">
                      <span className="text-white/80 font-semibold text-base">Clarity</span>
                      <span className={`${getScoreColor(model.clarity)} font-bold text-lg`}>{model.clarity}/10</span>
                    </div>
                    {getScoreBar(model.clarity)}
                  </div>
                </div>

                <p className="text-base sm:text-lg text-white/90 leading-relaxed font-medium">{model.summary}</p>
              </div>
            ))}
          </div>

          {analysis.recommendation && (
            <div className="glass-card p-5 sm:p-6 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-2 border-indigo-400/50">
              <h4 className="font-bold mb-4 text-indigo-200 text-lg sm:text-xl">Recommendation</h4>
              <p className="text-base sm:text-lg text-white leading-relaxed font-medium">{analysis.recommendation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
