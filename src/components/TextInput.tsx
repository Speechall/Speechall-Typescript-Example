import { useState, useRef } from 'react';
import SpeechRecordingButton, { type SpeechRecordingButtonRef } from './SpeechRecordingButton';

interface TextInputProps {
  onSubmit: (text: string) => void;
  onTranscriptionUpdate?: (text: string) => void;
  isLoading: boolean;
  placeholder?: string;
  speechRecordingRef?: React.RefObject<SpeechRecordingButtonRef | null>;
}

export default function TextInput({ onSubmit, onTranscriptionUpdate, isLoading, placeholder = "Describe the HTML you want to generate...", speechRecordingRef }: TextInputProps) {
  const [text, setText] = useState('');
  const [isFromSpeech, setIsFromSpeech] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const internalSpeechRecordingRef = useRef<SpeechRecordingButtonRef>(null);
  const effectiveSpeechRecordingRef = speechRecordingRef || internalSpeechRecordingRef;

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
      // Trigger real-time HTML update
      if (onTranscriptionUpdate) {
        onTranscriptionUpdate(transcribedText.trim());
      }
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
      {/* Voice Input Section - Made Prominent */}
      <div className="voice-input-section">
        <div className="voice-section-header">
          <h3>🎤 Voice Input (Recommended)</h3>
          <p>Speak your ideas and watch HTML generate in real-time as you talk!</p>
        </div>
        <SpeechRecordingButton
          ref={effectiveSpeechRecordingRef}
          apiKey={speechallApiKey}
          onTranscription={handleTranscription}
          onRecordingComplete={() => {
            // No longer submit on recording complete since we're doing real-time updates
            setText('');
            setIsFromSpeech(false);
          }}
          disabled={isLoading}
        />
        {isFromSpeech && (
          <div className="live-transcription-indicator">
            ✨ Live transcription active - HTML updating as you speak!
          </div>
        )}
      </div>
      
      <div className="input-divider">
        <span>or use text input</span>
      </div>
      
      {/* Text Input Section - Secondary Option */}
      <div className="text-input-section">
        <form onSubmit={handleSubmit} className="text-input-form">
          <div className="input-container">
            <textarea
              value={text}
              onChange={handleTextChange}
              placeholder={placeholder}
              disabled={isLoading}
              rows={3}
              className={`text-input ${isFromSpeech ? 'from-speech' : ''}`}
            />
            <button 
              type="submit" 
              disabled={!text.trim() || isLoading || isRecording}
              className="submit-button"
            >
              {isLoading ? 'Generating...' : 'Generate HTML'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}