# AI Multi-Chat Platform

## Overview
A Multi-AI Platform that allows users to chat with various AI models (Gemini, Cerebras, Groq, DeepSeek) and compare responses side-by-side. Personal family project as a free alternative to AI Fiesta.

## Project Architecture
- **Type**: React Single-Page Application (SPA)
- **Build System**: Vite 7
- **Frontend**: React 18 with modular component structure
- **Styling**: Tailwind CSS 4 with custom glassmorphism effects
- **Backend**: Supabase (external - for auth and data storage)
- **Key Libraries**: 
  - marked.js for Markdown rendering
  - DOMPurify for XSS protection
  - react-hot-toast for notifications

## Directory Structure
```
src/
├── components/
│   ├── Auth.jsx          # Login/signup form
│   ├── BiasAnalysis.jsx  # AI response analysis
│   ├── ChatInput.jsx     # Message input with file attachment
│   ├── ChatView.jsx      # Single model chat interface
│   ├── CompareView.jsx   # Side-by-side model comparison
│   ├── Icons.jsx         # SVG icon components
│   ├── Message.jsx       # Individual message display
│   ├── ModelSelector.jsx # Model selection and compare toggle
│   ├── Settings.jsx      # API key management modal
│   ├── Sidebar.jsx       # Chat history navigation
│   └── TypingIndicator.jsx # Loading animation
├── hooks/                # Custom React hooks
├── styles/
│   └── globals.css       # Global styles with glassmorphism
├── utils/
│   ├── api.js            # AI provider API calls (with streaming)
│   ├── constants.js      # Model configs and env vars
│   ├── markdown.js       # Markdown rendering with sanitization
│   └── supabase.js       # Supabase client initialization
├── App.jsx               # Main application component
└── main.jsx              # Entry point
```

## Running the Project
```bash
npm run dev
```
Development server runs on port 5000.

## Environment Variables
The following environment variables are required:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_ADMIN_EMAIL` - Admin user email
- `VITE_INVITE_CODE` - Family invite code for signup

## Features
- Multi-AI chat interface with streaming responses
- Compare mode to query multiple AI models simultaneously
- Bias analysis for AI responses with scoring
- User authentication via Supabase with invite code
- Chat history persistence
- API key management for various AI providers
- Prompt enhancement feature
- File attachments for vision models
- Glassmorphism UI with modern styling
- Toast notifications instead of alerts
- Typing indicators during AI response generation

## Security
- RLS enabled in Supabase (already configured by user)
- Sensitive values moved to environment variables
- DOMPurify sanitization for markdown content
- API keys stored per-user in Supabase

## AI Providers Supported
- Google (Gemini 2.5 Pro)
- Cerebras (Llama 3.3 70B)
- Groq (Llama 3.3 70B)
- DeepSeek (V3)

## Recent Changes
- 2025-12-17: Complete refactor from single HTML to modular React + Vite
- 2025-12-17: Added glassmorphism UI styling
- 2025-12-17: Implemented streaming responses
- 2025-12-17: Added toast notifications and typing indicators
- 2025-12-17: Fixed security issues with environment variables
- 2025-12-17: Added DOMPurify for XSS protection
