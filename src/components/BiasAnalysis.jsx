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
    <div className="p-4 sm:p-5 border-t border-white/10 glass-dark">
      {!analysis && onAnalyze && (
        <button
          onClick={onAnalyze}
          disabled={analyzing}
          className="glass-button w-full py-3 flex items-center justify-center gap-2 text-base font-medium"
        >
          <AnalyzeIcon />
          {analyzing ? 'Analyzing responses...' : 'Analyze Bias & Quality'}
        </button>
      )}

      {analysis && (
        <div className="space-y-4 animate-fadeIn">
          <h3 className="font-bold text-lg sm:text-xl flex items-center gap-2 text-white">
            <AnalyzeIcon />
            Analysis Results
          </h3>

          <div className="grid gap-4">
            {analysis.models?.map((model, idx) => (
              <div key={idx} className="glass p-4 sm:p-5 rounded-xl space-y-4">
                <h4 className="font-semibold text-base sm:text-lg text-white">{model.name}</h4>
                
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-white/70 font-medium text-sm">Bias</span>
                      <span className={`${getScoreColor(model.bias)} font-bold text-base`}>{model.bias}/10</span>
                    </div>
                    {getScoreBar(model.bias)}
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-white/70 font-medium text-sm">Credibility</span>
                      <span className={`${getScoreColor(model.credibility)} font-bold text-base`}>{model.credibility}/10</span>
                    </div>
                    {getScoreBar(model.credibility)}
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-white/70 font-medium text-sm">Completeness</span>
                      <span className={`${getScoreColor(model.completeness)} font-bold text-base`}>{model.completeness}/10</span>
                    </div>
                    {getScoreBar(model.completeness)}
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-white/70 font-medium text-sm">Clarity</span>
                      <span className={`${getScoreColor(model.clarity)} font-bold text-base`}>{model.clarity}/10</span>
                    </div>
                    {getScoreBar(model.clarity)}
                  </div>
                </div>

                <p className="text-sm sm:text-base text-white/80 leading-relaxed">{model.summary}</p>
              </div>
            ))}
          </div>

          {analysis.recommendation && (
            <div className="glass p-4 sm:p-5 rounded-xl bg-indigo-500/15 border-2 border-indigo-500/40">
              <h4 className="font-semibold mb-3 text-indigo-300 text-base sm:text-lg">Recommendation</h4>
              <p className="text-sm sm:text-base text-white/90 leading-relaxed">{analysis.recommendation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
