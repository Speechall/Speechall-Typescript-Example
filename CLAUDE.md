# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React TypeScript application that combines Claude AI's HTML generation capabilities with Speechall's real-time speech-to-text service. The app allows users to describe HTML they want created either by typing or speaking, then generates and iteratively updates HTML using Claude AI.

## Development Commands

- `npm run dev` - Start Vite development server (default port 5173)
- `npm run build` - TypeScript compilation followed by production build
- `npm run lint` - Run ESLint on all files
- `npm run preview` - Preview production build locally

## Architecture & Key Components

### Core Services
- **claudeApi.ts** (`src/services/claudeApi.ts:1`) - Handles Claude AI API integration with two main functions:
  - `generateHTML()` - Creates new HTML from text descriptions
  - `updateHTML()` - Modifies existing HTML based on update instructions
- **speechRecording.ts** (`src/services/speechRecording.ts:1`) - Manages WebSocket connection to Speechall API for real-time speech transcription

### Component Structure
- **App.tsx** - Main application component managing HTML generation state and orchestrating the UI flow
- **TextInput.tsx** - Input component with speech recording integration
- **SpeechRecordingButton.tsx** - Handles microphone access, WebSocket audio streaming, and transcription status
- **HTMLPreview.tsx** - Safely renders generated HTML with copy-to-clipboard functionality
- **LoadingSpinner.tsx** - Loading state indicator

### Speech Processing Architecture
The speech recording system uses a sophisticated audio processing pipeline:
1. **AudioContext** with 16kHz sample rate for optimal speech recognition
2. **AudioWorklet** for real-time audio processing (with MediaRecorder fallback)
3. **WebSocket** connection to Speechall API at `ws://127.0.0.1:8080/transcribe`
4. **PCM 16-bit audio encoding** for streaming to the transcription service

## Environment Variables

Requires two API keys in `.env`:
- `VITE_ANTHROPIC_API_KEY` - Claude AI API key
- `VITE_SPEECHALL_API_KEY` - Speechall API key

⚠️ **Security Note**: API keys are exposed in browser environment (`dangerouslyAllowBrowser: true`) for demo purposes only.

## Integration Points

### Speechall Integration
- Connects to local Speechall service running on port 8080
- Uses `deepgram.nova-2` model by default
- Supports real-time streaming transcription with WebSocket
- Handles both AudioWorklet and MediaRecorder audio capture methods

### Claude AI Integration
- Uses `claude-3-5-sonnet-20241022` model
- Configured for HTML-only output (no DOCTYPE/html/head/body tags)
- Supports iterative updates to existing HTML content
- 2000 token limit for responses

## Development Notes

- Built with **Vite** + **React 19** + **TypeScript**
- Uses inline CSS in generated HTML for self-contained output
- Audio processing includes echo cancellation and noise suppression
- WebSocket connection includes automatic cleanup on component unmount
- Error handling for both API failures and audio access issues