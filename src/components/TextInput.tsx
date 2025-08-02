import { useState } from 'react';
import SpeechRecordingButton from './SpeechRecordingButton';

interface TextInputProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export default function TextInput({ onSubmit, isLoading, placeholder = "Describe the HTML you want to generate..." }: TextInputProps) {
  const [text, setText] = useState('');
  const [isFromSpeech, setIsFromSpeech] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSubmit(text.trim());
      setText('');
      setIsFromSpeech(false);
    }
  };

  const handleTranscription = (transcribedText: string) => {
    // Filter out empty strings and update text field with each transcript
    if (transcribedText.trim()) {
      setText(transcribedText.trim());
      setIsFromSpeech(true);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // If user starts typing, clear the speech indicator
    if (isFromSpeech) {
      setIsFromSpeech(false);
    }
  };

  const speechallApiKey = import.meta.env.VITE_SPEECHALL_API_KEY;

  return (
    <div className="input-controls">
      <form onSubmit={handleSubmit} className="text-input-form">
        <div className="input-container">
          {isFromSpeech && (
            <div className="speech-indicator">
              🎤 Transcribed from speech
            </div>
          )}
          <textarea
            value={text}
            onChange={handleTextChange}
            placeholder={placeholder}
            disabled={isLoading}
            rows={4}
            className={`text-input ${isFromSpeech ? 'from-speech' : ''}`}
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
        onRecordingComplete={(finalText: string) => {
          if (finalText.trim() && !isLoading) {
            onSubmit(finalText.trim());
            setText('');
            setIsFromSpeech(false);
          }
        }}
        disabled={isLoading}
      />
    </div>
  );
}