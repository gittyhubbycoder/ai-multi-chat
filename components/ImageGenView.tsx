
import React, { useState } from 'react';

interface ImageGenViewProps {
  setView: (view: string) => void;
}

const ImageGenView: React.FC<ImageGenViewProps> = ({ setView }) => {
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateImage = async () => {
    if (!imagePrompt.trim()) return;
    setLoading(true);
    setGeneratedImage(null);
    try {
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=1024&height=1024&nologo=true`;
      // Preload image to ensure it's ready before showing
      const img = new Image();
      img.src = url;
      img.onload = () => {
        setGeneratedImage(url);
        setLoading(false);
      };
      img.onerror = () => {
        alert('Error generating image. The service might be unavailable.');
        setLoading(false);
      }
    } catch (error) {
      alert('Error generating image');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => setView('chat')} className="text-blue-300 hover:text-blue-200 mb-4 text-sm md:text-base glass-card px-3 py-2 rounded-lg">
          ← Back to Chat
        </button>
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Generate Images</h1>
        <p className="text-gray-200 mb-4 md:mb-6 text-sm md:text-base">Powered by Pollinations.ai - 100% free!</p>
        <div className="mb-4 md:mb-6 flex gap-2">
          <input type="text" value={imagePrompt} onChange={(e) => setImagePrompt(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && generateImage()}
            placeholder="Describe the image..."
            className="flex-1 glass-input text-white px-3 md:px-4 py-2 md:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base" />
          <button onClick={generateImage} disabled={loading || !imagePrompt.trim()}
            className="px-4 md:px-6 glass-button hover:bg-pink-700 rounded-lg disabled:opacity-50 font-semibold text-sm md:text-base" style={{ background: 'rgba(236, 72, 153, 0.3)' }}>
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>
        {loading && (
          <div className="text-center py-10 md:py-20">
            <div className="text-4xl md:text-6xl mb-4 animate-pulse">🎨</div>
            <div className="text-lg md:text-xl">Generating...</div>
          </div>
        )}
        {generatedImage && !loading && (
          <div className="glass-card p-3 md:p-4 rounded-2xl animate-fade-in">
            <img src={generatedImage} alt="Generated" className="w-full rounded-lg mb-4" />
            <div className="flex flex-col md:flex-row gap-2">
              <a href={generatedImage} download="generated-image.png"
                className="flex-1 text-center glass-button hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold text-sm md:text-base">
                Download
              </a>
              <button onClick={() => setGeneratedImage(null)}
                className="px-4 py-2 glass-card hover:bg-opacity-30 rounded-lg text-sm md:text-base">
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenView;
