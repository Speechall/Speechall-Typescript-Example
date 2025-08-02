interface HTMLPreviewProps {
  html: string;
  onClear: () => void;
}

export default function HTMLPreview({ html, onClear }: HTMLPreviewProps) {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(html);
      alert('HTML copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  if (!html) {
    return (
      <div className="preview-placeholder">
        <p>Generated HTML will appear here...</p>
      </div>
    );
  }

  return (
    <div className="html-preview">
      <div className="preview-header">
        <h3>Generated HTML Preview</h3>
        <div className="preview-actions">
          <button onClick={copyToClipboard} className="action-button">
            Copy HTML
          </button>
          <button onClick={onClear} className="action-button clear-button">
            Clear
          </button>
        </div>
      </div>
      
      <div className="preview-content">
        <div 
          className="rendered-html"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
      
      <details className="html-source">
        <summary>View HTML Source</summary>
        <pre>
          <code>{html}</code>
        </pre>
      </details>
    </div>
  );
}