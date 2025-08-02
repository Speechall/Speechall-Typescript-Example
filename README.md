# HTML Generator with Claude

A React application that uses Claude AI to generate and iteratively update HTML based on user descriptions.

## Features

- 🤖 **AI-Powered HTML Generation**: Describe what you want and Claude will generate HTML for you
- 🔄 **Iterative Updates**: Update existing HTML with additional instructions
- 👁️ **Live Preview**: See your generated HTML rendered in real-time
- 📋 **Copy to Clipboard**: Easily copy generated HTML code
- 🎨 **Clean UI**: Professional, responsive interface
- 🔒 **Secure**: Safe HTML rendering with proper error handling

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up your Claude API key**:
   - Copy `.env.example` to `.env`
   - Add your Anthropic API key to the `VITE_ANTHROPIC_API_KEY` variable
   ```bash
   cp .env.example .env
   # Edit .env and add your API key
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

## Usage

1. Enter a description of the HTML you want to generate in the text field
2. Click "Generate HTML" to create your HTML using Claude AI
3. View the rendered result in the preview section
4. To update the HTML, enter additional instructions in the same text field
5. Claude will modify the existing HTML based on your new instructions
6. Use the "Copy HTML" button to copy the generated code
7. Use "Clear" to start over with a new generation

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety and better development experience
- **Vite** - Fast build tool and development server
- **Claude API** - AI-powered HTML generation via Anthropic's SDK
- **CSS3** - Modern styling with responsive design

## Important Notes

⚠️ **API Key Security**: This application uses the Anthropic API key in the browser environment (`dangerouslyAllowBrowser: true`). This is for demonstration purposes only. In a production environment, you should:
- Use a backend server to make API calls
- Implement proper authentication and rate limiting
- Never expose API keys in client-side code

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/
│   ├── TextInput.tsx      # Input component for user instructions
│   ├── HTMLPreview.tsx    # Preview component for generated HTML
│   └── LoadingSpinner.tsx # Loading indicator
├── services/
│   └── claudeApi.ts       # Claude API integration
├── App.tsx                # Main application component
├── App.css                # Application styles
└── main.tsx               # Application entry point
```
