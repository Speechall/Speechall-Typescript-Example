import { useState } from 'react'
import './App.css'
import TextInput from './components/TextInput'
import HTMLPreview from './components/HTMLPreview'
import LoadingSpinner from './components/LoadingSpinner'
import { generateHTML, updateHTML } from './services/claudeApi'

function App() {
  const [currentHTML, setCurrentHTML] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateHTML = async (prompt: string) => {
    setIsLoading(true)
    setError(null)

    try {
      let result;
      if (currentHTML) {
        result = await updateHTML(currentHTML, prompt)
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
    }
  }

  const handleClear = () => {
    setCurrentHTML('')
    setError(null)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>HTML Generator with Claude</h1>
        <p>Describe what you want to create, and Claude will generate HTML for you!</p>
      </header>

      <main className="app-main">
        <div className="input-section">
          <TextInput
            onSubmit={handleGenerateHTML}
            onTranscriptionUpdate={handleGenerateHTML}
            isLoading={isLoading}
            placeholder={
              currentHTML 
                ? "Describe how you want to update the current HTML..." 
                : "Describe the HTML you want to generate..."
            }
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
