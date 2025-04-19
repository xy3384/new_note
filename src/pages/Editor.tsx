import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import Chatbot from '../components/Chatbot';

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        invoke(channel: string, ...args: any[]): Promise<any>;
      };
    };
  }
}

interface EditorProps {
  currentFile: string;
}

const { Content } = Layout;

const Editor: React.FC<EditorProps> = ({ currentFile }) => {
  const [fileContent, setFileContent] = useState<string>('');

  useEffect(() => {
    const loadFileContent = async () => {
      try {
        const content = await window.electron.ipcRenderer.invoke('read-file', currentFile);
        setFileContent(content);
      } catch (error) {
        console.error('Error loading file content:', error);
      }
    };

    if (currentFile) {
      loadFileContent();
    }
  }, [currentFile]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px', margin: '0 16px' }}>
        <div style={{ background: '#fff', padding: 24, minHeight: 360 }}>
          <h2>{currentFile}</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{fileContent}</pre>
        </div>
      </Content>
      <Chatbot context={fileContent} />
    </Layout>
  );
};

export default Editor; 