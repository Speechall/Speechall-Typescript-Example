export interface SpeechRecordingConfig {
  apiKey: string;
  model?: string;
  language?: string;
  onTranscription: (text: string) => void;
  onError: (error: string) => void;
  onStatusChange: (status: 'idle' | 'recording' | 'processing' | 'error') => void;
}

export class SpeechRecording {
  private websocket: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private config: SpeechRecordingConfig;
  private status: 'idle' | 'recording' | 'processing' | 'error' = 'idle';
  private isPaused: boolean = false;

  constructor(config: SpeechRecordingConfig) {
    this.config = config;
  }

  private setStatus(status: 'idle' | 'recording' | 'processing' | 'error') {
    this.status = status;
    this.config.onStatusChange(status);
  }

  private createWebSocketConnection(): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      const wsUrl = new URL('ws://127.0.0.1:8080/transcribe');
      wsUrl.searchParams.set('api_key', this.config.apiKey);
      wsUrl.searchParams.set('model', this.config.model || 'deepgram.nova-2');
      wsUrl.searchParams.set('language', this.config.language || 'en');
      wsUrl.searchParams.set('output_format', 'json');

      console.log('Connecting to Speechall WebSocket:', wsUrl.toString());

      const ws = new WebSocket(wsUrl.toString());

      ws.onopen = () => {
        console.log('WebSocket connection opened');
        resolve(ws);
      };

      ws.onmessage = (event) => {
        // Ignore incoming transcripts while paused
        if (this.isPaused) {
          return;
        }
        console.log('Received message from Speechall:', event.data);
        try {
          const data = JSON.parse(event.data);
          if (data.text && data.text.trim()) {
            console.log('Transcribed text:', data.text);
            this.config.onTranscription(data.text);
          }
        } catch {
          // If it's plain text (not JSON), use it directly
          if (typeof event.data === 'string' && event.data.trim()) {
            console.log('Transcribed text (plain):', event.data);
            this.config.onTranscription(event.data);
          }
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.config.onError('WebSocket connection failed');
        this.setStatus('error');
        reject(new Error('WebSocket connection failed'));
      };

      ws.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        // Clean up audio resources when WebSocket closes unexpectedly
        this.cleanupAudioResources();
        this.websocket = null;
        this.setStatus('idle');
      };
    });
  }

  private async setupAudioProcessing(stream: MediaStream): Promise<void> {
    console.log('Creating AudioContext...');
    this.audioContext = new AudioContext({
      sampleRate: 16000
    });

    this.source = this.audioContext.createMediaStreamSource(stream);
    console.log('Created MediaStreamSource');
    
    try {
      console.log('Attempting to use AudioWorklet...');
      // Try to use AudioWorklet (modern approach)
      const workletCode = `
        class AudioProcessor extends AudioWorkletProcessor {
          process(inputs, outputs, parameters) {
            const input = inputs[0];
            if (input && input[0]) {
              const inputBuffer = input[0];
              // Convert Float32Array to Int16Array (PCM 16-bit)
              const int16Buffer = new Int16Array(inputBuffer.length);
              for (let i = 0; i < inputBuffer.length; i++) {
                const sample = Math.max(-1, Math.min(1, inputBuffer[i]));
                int16Buffer[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
              }
              // Send audio data to main thread
              this.port.postMessage(int16Buffer.buffer);
            }
            return true;
          }
        }
        registerProcessor('audio-processor', AudioProcessor);
      `;
      
      const blob = new Blob([workletCode], { type: 'application/javascript' });
      const workletUrl = URL.createObjectURL(blob);
      
      await this.audioContext.audioWorklet.addModule(workletUrl);
      console.log('AudioWorklet module loaded');
      
      this.workletNode = new AudioWorkletNode(this.audioContext, 'audio-processor');
      console.log('AudioWorkletNode created');
      
      this.workletNode.port.onmessage = (event) => {
        // Only send audio while not paused
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN && !this.isPaused) {
          console.log('Sending audio data via WebSocket:', event.data.byteLength, 'bytes');
          this.websocket.send(event.data);
        }
      };
      
      this.source.connect(this.workletNode);
      console.log('Audio worklet connected');
      
      URL.revokeObjectURL(workletUrl);
    } catch (error) {
      console.log('AudioWorklet failed, falling back to MediaRecorder:', error);
      // Fallback to MediaRecorder for better browser compatibility
      this.setupMediaRecorderFallback(stream);
    }
  }

  private setupMediaRecorderFallback(stream: MediaStream): void {
    console.log('Using MediaRecorder fallback...');
    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus'
    });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0 && this.websocket && this.websocket.readyState === WebSocket.OPEN && !this.isPaused) {
        console.log('MediaRecorder data available:', event.data.size, 'bytes');
        // Convert blob to array buffer and send
        event.data.arrayBuffer().then(buffer => {
          console.log('Sending MediaRecorder data via WebSocket:', buffer.byteLength, 'bytes');
          this.websocket!.send(buffer);
        });
      }
    };

    this.mediaRecorder.start(100); // Collect data every 100ms
    console.log('MediaRecorder started');
  }

  async startRecording(): Promise<void> {
    try {
      console.log('Starting recording...');
      this.setStatus('processing');

      // Check if API key is provided
      if (!this.config.apiKey) {
        throw new Error('Speechall API key is required');
      }
      console.log('API key provided:', this.config.apiKey.substring(0, 10) + '...');

      // Request microphone access
      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      console.log('Microphone access granted');

      // Create WebSocket connection
      console.log('Creating WebSocket connection...');
      this.websocket = await this.createWebSocketConnection();
      console.log('WebSocket connection established');

      // Setup audio processing
      console.log('Setting up audio processing...');
      await this.setupAudioProcessing(stream);
      console.log('Audio processing setup complete');

      this.setStatus('recording');
      console.log('Recording started successfully');
    } catch (error) {
      console.error('Error starting recording:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start recording';
      this.config.onError(errorMessage);
      this.setStatus('error');
      throw error;
    }
  }

  private cleanupAudioResources(): void {
    // Clean up audio processing
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      this.mediaRecorder = null;
    }

    if (this.workletNode) {
      this.workletNode.disconnect();
      this.workletNode = null;
    }

    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  pauseRecording(): void {
    if (!this.isPaused) {
      this.isPaused = true;
      console.log('Recording paused');
    }
  }

  resumeRecording(): void {
    if (this.isPaused) {
      this.isPaused = false;
      console.log('Recording resumed');
    }
  }

  stopRecording(): void {
    this.setStatus('processing');
    this.isPaused = false;

    // Close WebSocket
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }

    this.cleanupAudioResources();
    this.setStatus('idle');
  }

  getStatus(): 'idle' | 'recording' | 'processing' | 'error' {
    return this.status;
  }

  isRecording(): boolean {
    return this.status === 'recording';
  }

  isPausedRecording(): boolean {
    return this.isPaused;
  }
}