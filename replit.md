# AI Multi-Chat Platform

## Overview
A Multi-AI Platform that allows users to chat with various AI models (Gemini, Cerebras, Groq, DeepSeek) and compare responses side-by-side.

## Project Architecture
- **Type**: Static single-page application (SPA)
- **Frontend**: React 18 (via CDN/Babel transpilation)
- **Styling**: Tailwind CSS (CDN)
- **Backend**: Supabase (external - for auth and data storage)
- **Dependencies**: marked.js for Markdown rendering

## Key Files
- `index.html` - Main application file containing all HTML, CSS, and JavaScript

## Running the Project
The application is served using `serve` on port 5000:
```bash
npx serve -l 5000 -s .
```

## Features
- Multi-AI chat interface
- Compare mode to query multiple AI models simultaneously
- Bias analysis for AI responses
- User authentication via Supabase
- Chat history persistence
- API key management for various AI providers

## Configuration
Users need to configure their own API keys through the settings panel for:
- Google (Gemini)
- Cerebras
- Groq
- DeepSeek

## Recent Changes
- 2025-12-17: Initial setup on Replit with static file server
