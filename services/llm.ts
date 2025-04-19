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
    // 打印请求内容以便调试
    console.log('Sending request to API:', {
      url: API_URL,
      model: 'Qwen/Qwen2.5-7B-Instruct',
      messages: messages,
      temperature: 0.7,
      max_tokens: 2000,
    });

    const response = await axios.post<ChatResponse>(
      API_URL,
      {
        model: 'Qwen/Qwen2.5-7B-Instruct',
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
    // 更详细的错误处理
    if (axios.isAxiosError(error)) {
      console.error('API Error Details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          data: error.config?.data,
        }
      });
    } else {
      console.error('Non-Axios Error:', error);
    }
    
    // 返回一个友好的错误消息
    return "抱歉，我暂时无法回答您的问题。请稍后再试或联系管理员。";
  }
} 