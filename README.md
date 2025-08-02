# HTML Generator with Claude & Speech Input

A React application that uses Speechall's live transcription and Claude AI to generate and iteratively update HTML based on user descriptions. Features speech-to-text input powered by Speechall for hands-free HTML creation. Every time you say something, it will be used as instructions to update the HTML. What you say is transcribed live using WebSockets and passed to the LLM.

## Demo

Please unmute the sound first:

https://github.com/user-attachments/assets/ed02744c-3e36-45ac-a216-7f5a6441d8e8


## Features

- 🤖 **AI-Powered HTML Generation**: Describe what you want and Claude will generate HTML for you
- 🎤 **Speech-to-Text Input**: Use voice commands to describe HTML with Speechall integration
- 🔄 **Iterative Updates**: Update existing HTML with additional instructions via text or voice
- 👁️ **Live Preview**: See your generated HTML rendered in real-time
- 📋 **Copy to Clipboard**: Easily copy generated HTML code
- 🎨 **Clean UI**: Professional, responsive interface with real-time speech status
- 🔒 **Secure**: Safe HTML rendering with proper error handling

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up your API keys**:
   - Copy `.env.example` to `.env`
   - Add your Anthropic API key to the `VITE_ANTHROPIC_API_KEY` variable
   - Add your Speechall API key to the `VITE_SPEECHALL_API_KEY` variable
   ```bash
   cp .env.example .env
   # Edit .env and add both API keys
   ```

3. **Start Speechall service** (for speech input):
   - Ensure Speechall is running on `ws://127.0.0.1:8080/transcribe`
   - Speech input will be disabled if Speechall service is not available

4. **Start the development server**:
   ```bash
   npm run dev
   ```

## Usage

### Text Input Method
1. Enter a description of the HTML you want to generate in the text field
2. Click "Generate HTML" to create your HTML using Claude AI
3. View the rendered result in the preview section
4. To update the HTML, enter additional instructions in the same text field
5. Claude will modify the existing HTML based on your new instructions

### Voice Input Method
1. Click the "🎤 Start Voice Input" button to begin speech recording
2. Speak your HTML description naturally
3. The transcribed text will automatically appear in the input field
4. Click "🛑 Stop Recording" when finished speaking
5. Review the transcription and click "Generate HTML"

### General Usage
- Use the "Copy HTML" button to copy the generated code
- Use "Clear" to start over with a new generation
- Mix text and voice input as needed for iterative updates

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety and better development experience
- **Vite** - Fast build tool and development server
- **Claude API** - AI-powered HTML generation via Anthropic's SDK
- **Speechall API** - Real-time speech-to-text transcription via WebSocket
- **Web Audio API** - Advanced audio processing with AudioWorklet
- **CSS3** - Modern styling with responsive design

## Important Notes

⚠️ **API Key Security**: This application uses API keys in the browser environment (`dangerouslyAllowBrowser: true` for Claude). This is for demonstration purposes only. In a production environment, you should:
- Use a backend server to make API calls
- Implement proper authentication and rate limiting
- Never expose API keys in client-side code

🎤 **Speech Input Requirements**:
- Requires microphone access permission
- Speechall service must be running locally on port 8080
- Uses Deepgram Nova-2 model for speech recognition
- Supports real-time streaming transcription

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/
│   ├── TextInput.tsx            # Input component with speech integration
│   ├── SpeechRecordingButton.tsx # Voice input component
│   ├── HTMLPreview.tsx          # Preview component for generated HTML
│   └── LoadingSpinner.tsx       # Loading indicator
├── services/
│   ├── claudeApi.ts             # Claude API integration
│   └── speechRecording.ts       # Speechall WebSocket integration
├── App.tsx                      # Main application component
├── App.css                      # Application styles
└── main.tsx                     # Application entry point
```
