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
      system: `You are an expert HTML generator. Your task is to create clean, functional HTML based on user descriptions. 

Key guidelines:
- Generate semantic, accessible HTML
- Include inline CSS styles for proper appearance and layout
- Make content responsive and visually appealing
- Do not include DOCTYPE, html, head, or body tags
- Return only the HTML content that can be rendered directly in a div
- Focus on creating well-structured, maintainable code`,
      messages: [{
        role: 'user',
        content: `Generate HTML code based on this description: "${prompt}"

Please return only clean HTML code without explanations.`
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
      system: `You are an expert HTML updater that makes incremental modifications to existing HTML. Your core responsibility is to PRESERVE existing content while applying targeted updates.

CRITICAL BEHAVIOR:
- You are NOT a content replacer - you are a content enhancer/modifier
- ALWAYS preserve existing HTML elements, text, and styling that are not explicitly mentioned in the user's instruction
- Make only the specific changes requested by the user
- Think of your role as "surgical editing" - precise, targeted modifications
- Maintain the overall structure, layout, and functionality unless specifically asked to change them
- When in doubt, preserve rather than replace

Your output should be the complete HTML with existing content intact plus the requested modifications.`,
      messages: [{
        role: 'user',
        content: `Here is the current HTML:
\`\`\`html
${currentHTML}
\`\`\`

User instruction: "${updatePrompt}"

Return the complete updated HTML code (preserving all existing content + applying the requested changes). Do not include explanations or tags like DOCTYPE, html, head, or body.`
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