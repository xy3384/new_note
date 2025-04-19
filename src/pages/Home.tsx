import React, { useState, useEffect } from 'react';
import { Layout, Menu } from 'antd';
import { FileOutlined, FolderOutlined } from '@ant-design/icons';
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

const { Sider, Content } = Layout;

const Home: React.FC = () => {
  const [folderContext, setFolderContext] = useState<string>('');
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  useEffect(() => {
    const loadFiles = async () => {
      try {
        const fileList = await window.electron.ipcRenderer.invoke('get-files');
        setFiles(fileList);
        
        // 加载文件夹上下文
        const mdFiles = fileList.filter((file: string) => file.endsWith('.md'));
        const contents = await Promise.all(
          mdFiles.map(async (file: string) => {
            const content = await window.electron.ipcRenderer.invoke('read-file', file);
            return content;
          })
        );
        setFolderContext(contents.join('\n\n'));
      } catch (error) {
        console.error('Error loading files:', error);
      }
    };

    loadFiles();
  }, []);

  const handleFileClick = (file: string) => {
    setSelectedFile(file);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} theme="light">
        <Menu
          mode="inline"
          defaultSelectedKeys={[]}
          style={{ height: '100%', borderRight: 0 }}
        >
          {files.map((file) => (
            <Menu.Item
              key={file}
              icon={file.endsWith('.md') ? <FileOutlined /> : <FolderOutlined />}
              onClick={() => handleFileClick(file)}
            >
              {file}
            </Menu.Item>
          ))}
        </Menu>
      </Sider>
      <Layout style={{ padding: '0 24px 24px' }}>
        <Content
          style={{
            padding: 24,
            margin: 0,
            minHeight: 280,
          }}
        >
          {selectedFile && (
            <div>
              <h2>{selectedFile}</h2>
              {/* 这里可以添加文件预览或其他内容 */}
            </div>
          )}
        </Content>
      </Layout>
      <Chatbot context={folderContext} />
    </Layout>
  );
};

export default Home; 