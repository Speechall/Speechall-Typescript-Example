import { useState, useRef, useImperativeHandle, forwardRef, type ForwardedRef } from 'react';
import { SpeechRecording, type SpeechRecordingConfig } from '../services/speechRecording';

export interface SpeechRecordingButtonRef {
  pauseRecording: () => void;
  resumeRecording: () => void;
  stopRecording: () => void;
  isRecording: () => boolean;
}

interface SpeechRecordingButtonProps {
  apiKey: string;
  onTranscription: (text: string) => void;
  onRecordingComplete?: (finalText: string) => void;
  disabled?: boolean;
}

const SpeechRecordingButton = forwardRef<SpeechRecordingButtonRef, SpeechRecordingButtonProps>(
  (
    {
      apiKey,
      onTranscription,
      onRecordingComplete,
      disabled = false,
    }: SpeechRecordingButtonProps,
    ref: ForwardedRef<SpeechRecordingButtonRef>
  ) => {
    const [status, setStatus] = useState<'idle' | 'recording' | 'processing' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [lastTranscript, setLastTranscript] = useState<string>('');
    const speechRecordingRef = useRef<SpeechRecording | null>(null);

    const handleStartRecording = async () => {
      console.log('handleStartRecording called, apiKey:', apiKey ? 'provided' : 'missing');

      if (!apiKey) {
        console.error('API key is missing');
        setError('Speechall API key is required');
        return;
      }

      try {
        setError(null);
        setLastTranscript(''); // Clear any previous transcript

        const config: SpeechRecordingConfig = {
          apiKey,
          model: 'deepgram.nova-2',
          language: 'en',
          onTranscription: (text: string) => {
            console.log('Transcription received in component:', text);
            setLastTranscript(text);
            onTranscription(text);
          },
          onError: (errorMsg: string) => {
            console.error('Speech recording error:', errorMsg);
            setError(errorMsg);
            setStatus('error');
          },
          onStatusChange: (newStatus: 'idle' | 'recording' | 'processing' | 'error') => {
            console.log('Status changed to:', newStatus);
            setStatus(newStatus);
          },
        };

        console.log('Creating SpeechRecording instance...');
        speechRecordingRef.current = new SpeechRecording(config);
        await speechRecordingRef.current.startRecording();
      } catch (err) {
        console.error('Error in handleStartRecording:', err);
        setError(err instanceof Error ? err.message : 'Failed to start recording');
        setStatus('error');
      }
    };

    const handleStopRecording = () => {
      if (speechRecordingRef.current) {
        speechRecordingRef.current.stopRecording();
        speechRecordingRef.current = null;

        if (onRecordingComplete && lastTranscript.trim()) {
          onRecordingComplete(lastTranscript);
        }
        setLastTranscript('');
      }
    };

    const pauseRecording = () => {
      if (speechRecordingRef.current) {
        speechRecordingRef.current.pauseRecording();
      }
    };

    const resumeRecording = () => {
      if (speechRecordingRef.current) {
        speechRecordingRef.current.resumeRecording();
      }
    };

    useImperativeHandle(ref, () => ({
      pauseRecording,
      resumeRecording,
      stopRecording: handleStopRecording,
      isRecording: () => speechRecordingRef.current?.isRecording() ?? false,
    }));

    const handleToggleRecording = () => {
      if (status === 'recording') {
        handleStopRecording();
      } else {
        handleStartRecording();
      }
    };

    const getButtonText = () => {
      switch (status) {
        case 'recording':
          return '🛑 Stop Recording';
        case 'processing':
          return '⏳ Processing...';
        case 'error':
          return '❌ Error - Try Again';
        default:
          return '🎤 Start Voice Input';
      }
    };

    const getButtonClass = () => {
      const baseClass = 'speech-recording-button';
      switch (status) {
        case 'recording':
          return `${baseClass} recording`;
        case 'processing':
          return `${baseClass} processing`;
        case 'error':
          return `${baseClass} error`;
        default:
          return baseClass;
      }
    };

    return (
      <div className="speech-recording-container">
        <button
          onClick={handleToggleRecording}
          disabled={disabled || status === 'processing'}
          className={getButtonClass()}
        >
          {getButtonText()}
        </button>

        {error && (
          <div className="speech-error-message">
            <p>{error}</p>
          </div>
        )}

        {status === 'recording' && (
          <div className="recording-indicator">
            <div className="pulse-dot"></div>
            <span>Listening...</span>
          </div>
        )}
      </div>
    );
  }
);

SpeechRecordingButton.displayName = 'SpeechRecordingButton';

export default SpeechRecordingButton;
