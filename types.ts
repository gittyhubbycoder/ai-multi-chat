
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  file?: AttachedFile;
  timestamp: string;
}

export interface AttachedFile {
  name: string;
  type: string;
  data: string; // base64 encoded
}

export interface CompareResponses {
  [modelId: string]: { role: 'user' | 'assistant'; content: string }[];
}

export interface Chat {
  id: string;
  user_id: string;
  created_at: string;
  name: string;
  model: string;
  messages: Message[];
  compare_mode: boolean;
  selected_models: string[];
  compare_responses: CompareResponses;
  focused_model: string | null;
}

export interface Model {
  id: string;
  name: string;
  endpoint: string;
  provider: string;
}

export interface Provider {
  id: string;
  name: string;
  color: string;
}

export interface ApiKeySet {
  [providerId: string]: string;
}

export interface BiasAnalysisModel {
  name: string;
  bias: number;
  credibility: number;
  completeness: number;
  clarity: number;
  summary: string;
}

export interface BiasAnalysis {
  models: BiasAnalysisModel[];
  recommendation: string;
}

export interface ThemeSettings {
  glassmorphism: boolean;
  theme: 'dark' | 'light';
  animatedGradient: boolean;
  showTypingIndicator: boolean;
  glassOpacity: number;
  glassBlur: number;
  glassSaturate: number;
}
