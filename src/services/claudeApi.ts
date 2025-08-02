import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true
});

export interface HTMLGenerationResponse {
  html: string;
  success: boolean;
  error?: string;
}

export async function generateHTML(prompt: string): Promise<HTMLGenerationResponse> {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Generate HTML code based on this description: "${prompt}"

Please return only clean HTML code without explanations. The HTML should be complete and functional with inline CSS styles for proper appearance. Do not include <!DOCTYPE>, <html>, <head>, or <body> tags - just the content that can be rendered directly in a div.`
      }]
    });

    const html = message.content[0].type === 'text' ? message.content[0].text : '';
    
    return {
      html,
      success: true
    };
  } catch (error) {
    console.error('Error generating HTML:', error);
    return {
      html: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function updateHTML(currentHTML: string, updatePrompt: string): Promise<HTMLGenerationResponse> {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Here is the current HTML:
${currentHTML}

Please update this HTML based on the following instruction: "${updatePrompt}"

Return only the updated HTML code without explanations. The HTML should be complete and functional with inline CSS styles. Do not include <!DOCTYPE>, <html>, <head>, or <body> tags - just the content that can be rendered directly in a div.`
      }]
    });

    const html = message.content[0].type === 'text' ? message.content[0].text : '';
    
    return {
      html,
      success: true
    };
  } catch (error) {
    console.error('Error updating HTML:', error);
    return {
      html: currentHTML,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}