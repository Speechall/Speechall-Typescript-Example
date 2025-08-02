import { useState } from 'react';

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

  return (
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
  );
}