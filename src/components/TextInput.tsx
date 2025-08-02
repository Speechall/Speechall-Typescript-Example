import { useState } from 'react';
import SpeechRecordingButton from './SpeechRecordingButton';

interface TextInputProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export default function TextInput({ onSubmit, isLoading, placeholder = "Describe the HTML you want to generate..." }: TextInputProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSubmit(text.trim());
      setText('');
    }
  };

  const handleTranscription = (transcribedText: string) => {
    // Automatically submit the transcribed text to generate HTML
    if (transcribedText.trim() && !isLoading) {
      onSubmit(transcribedText.trim());
    }
  };

  const speechallApiKey = import.meta.env.VITE_SPEECHALL_API_KEY;

  return (
    <div className="input-controls">
      <form onSubmit={handleSubmit} className="text-input-form">
        <div className="input-container">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading}
            rows={4}
            className="text-input"
          />
          <button 
            type="submit" 
            disabled={!text.trim() || isLoading}
            className="submit-button"
          >
            {isLoading ? 'Generating...' : 'Generate HTML'}
          </button>
        </div>
      </form>
      
      <div className="input-divider">or</div>
      
      <SpeechRecordingButton
        apiKey={speechallApiKey}
        onTranscription={handleTranscription}
        disabled={isLoading}
      />
    </div>
  );
}