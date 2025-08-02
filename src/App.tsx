import { useState, useRef, useEffect } from 'react'
import './App.css'
import TextInput from './components/TextInput'
import HTMLPreview from './components/HTMLPreview'
import LoadingSpinner from './components/LoadingSpinner'
import { generateHTML, updateHTML } from './services/claudeApi'
import { type SpeechRecordingButtonRef } from './components/SpeechRecordingButton'

function App() {
  const [currentHTML, setCurrentHTML] = useState('')
  // Keep a ref to always have the latest HTML inside async callbacks
  const currentHTMLRef = useRef('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [queuedPrompt, setQueuedPrompt] = useState<string | null>(null)
  const speechRecordingRef = useRef<SpeechRecordingButtonRef>(null)

  const handleGenerateHTML = async (prompt: string, forceNew: boolean = false) => {
    // Pause recording if it's active
    let wasRecording = false;
    if (speechRecordingRef.current?.isRecording()) {
      wasRecording = true;
      speechRecordingRef.current.pauseRecording();
    }

    setIsLoading(true)
    setError(null)

    try {
      let result
      const existingHTML = currentHTMLRef.current
      if (existingHTML && !forceNew) {
        result = await updateHTML(existingHTML, prompt)
      } else {
        result = await generateHTML(prompt)
      }

      if (result.success) {
        setCurrentHTML(result.html)
      } else {
        setError(result.error || 'Failed to generate HTML')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Error:', err)
    } finally {
      setIsLoading(false)
      
      // Resume recording if it was previously active
      if (wasRecording && speechRecordingRef.current) {
        speechRecordingRef.current.resumeRecording();
      }
    }
  }

  const handleSubmitHTML = async (prompt: string) => {
    // Always generate new HTML when user explicitly submits
    await handleGenerateHTML(prompt, true)
  }

  const handleTranscriptionUpdate = async (prompt: string) => {
    // If a generation/update is already in progress, queue the latest prompt
    if (isLoading) {
      setQueuedPrompt(prompt)
      return
    }
    // Generate new HTML if none exists, otherwise update existing HTML
    await handleGenerateHTML(prompt, false)
  }

  const handleClear = () => {
    setCurrentHTML('')
    setError(null)
  }



  // Keep ref in sync with latest HTML
  useEffect(() => {
    currentHTMLRef.current = currentHTML
  }, [currentHTML])

  // Process any queued prompt once the current generation/update completes
  useEffect(() => {
    if (!isLoading && queuedPrompt) {
      // We don't need to await here; fire-and-forget is fine since we also gate by isLoading
      handleGenerateHTML(queuedPrompt, false)
      setQueuedPrompt(null)
    }
    // We intentionally exclude handleGenerateHTML from deps to avoid re-creating effect loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, queuedPrompt])

  return (
    <div className="app">
      <header className="app-header">
        <h1>HTML Generator with Claude</h1>
        <p>Describe what you want to create, and Claude will generate HTML for you!</p>
      </header>

      <main className="app-main">
        <div className="input-section">
          <TextInput
            onSubmit={handleSubmitHTML}
            onTranscriptionUpdate={handleTranscriptionUpdate}
            isLoading={isLoading}
            placeholder={
              currentHTML 
                ? "Describe how you want to update the current HTML..." 
                : "Describe the HTML you want to generate..."
            }
            speechRecordingRef={speechRecordingRef}
          />
          
          {error && (
            <div className="error-message">
              <p>Error: {error}</p>
            </div>
          )}
        </div>

        <div className="preview-section">
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <HTMLPreview html={currentHTML} onClear={handleClear} />
          )}
        </div>
      </main>
    </div>
  )
}

export default App
