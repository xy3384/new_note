import React, { useState, useRef, useEffect } from 'react';
import { Button, Drawer, Input, List, Avatar } from 'antd';
import { MessageOutlined, SendOutlined, CloseOutlined } from '@ant-design/icons';
import { chatWithLLM, Message } from '../services/llm';
import styled from 'styled-components';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const MessageList = styled(List)`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;

const InputContainer = styled.div`
  padding: 20px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 10px;
`;

const StyledDrawer = styled(Drawer)`
  .ant-drawer-content-wrapper {
    width: 400px !important;
  }
`;

interface ChatbotProps {
  context?: string;
}

interface ChatMessage extends Message {
  id: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ context }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const messageHistory = context 
        ? [{ role: 'system' as const, content: `Context: ${context}` }, ...messages, userMessage]
        : [...messages, userMessage];

      const response = await chatWithLLM(messageHistory);
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        type="primary"
        shape="circle"
        icon={<MessageOutlined />}
        onClick={() => setIsOpen(true)}
        style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}
      />
      <StyledDrawer
        title="Chat Assistant"
        placement="right"
        onClose={() => setIsOpen(false)}
        open={isOpen}
        extra={
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={() => setIsOpen(false)}
          />
        }
      >
        <ChatContainer>
          <MessageList
            dataSource={messages}
            renderItem={(item: any) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Avatar
                      style={{
                        backgroundColor: item.role === 'user' ? '#1890ff' : '#52c41a',
                      }}
                    >
                      {item.role === 'user' ? 'U' : 'A'}
                    </Avatar>
                  }
                  description={
                    <div style={{ whiteSpace: 'pre-wrap' }}>{item.content}</div>
                  }
                />
              </List.Item>
            )}
          />
          <div ref={messagesEndRef} />
          <InputContainer>
            <Input
              value={input}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
              onPressEnter={handleSend}
              placeholder="Type your message..."
              disabled={loading}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              loading={loading}
            />
          </InputContainer>
        </ChatContainer>
      </StyledDrawer>
    </>
  );
};

export default Chatbot; 