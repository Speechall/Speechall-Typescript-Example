import { useState, useRef } from 'react';
import SpeechRecordingButton, { type SpeechRecordingButtonRef } from './SpeechRecordingButton';

interface TextInputProps {
  onSubmit: (text: string) => void;
  onTranscriptionUpdate?: (text: string) => void;
  isLoading: boolean;
  placeholder?: string;
  onRecordingStateChange?: (isRecording: boolean) => void;
  speechRecordingRef?: React.RefObject<SpeechRecordingButtonRef | null>;
}

export default function TextInput({ onSubmit, onTranscriptionUpdate, isLoading, placeholder = "Describe the HTML you want to generate...", onRecordingStateChange, speechRecordingRef }: TextInputProps) {
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

  const handleRecordingStateChange = (recordingState: boolean) => {
    setIsRecording(recordingState);
    if (onRecordingStateChange) {
      onRecordingStateChange(recordingState);
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
            disabled={!text.trim() || isLoading || isRecording}
            className="submit-button"
          >
            {isLoading ? 'Generating...' : 'Generate HTML'}
          </button>
        </div>
      </form>
      
      <div className="input-divider">or</div>
      
      <SpeechRecordingButton
        ref={effectiveSpeechRecordingRef}
        apiKey={speechallApiKey}
        onTranscription={handleTranscription}
        onRecordingComplete={() => {
          // No longer submit on recording complete since we're doing real-time updates
          setText('');
          setIsFromSpeech(false);
        }}
        onRecordingStateChange={handleRecordingStateChange}
        disabled={isLoading}
      />
    </div>
  );
}