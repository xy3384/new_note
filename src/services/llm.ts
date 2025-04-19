import axios from 'axios';

const API_KEY = 'sk-eudcwozxipqucmymqwwcphujvaduleuykwsbgqjiajpjkloh';
const API_URL = 'https://api.siliconflow.cn/v1/chat/completions';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  choices: {
    message: Message;
    finish_reason: string;
  }[];
}

export async function chatWithLLM(messages: Message[]): Promise<string> {
  try {
    const response = await axios.post<ChatResponse>(
      API_URL,
      {
        model: 'deepseek-chat',
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling LLM API:', error);
    throw error;
  }
} 