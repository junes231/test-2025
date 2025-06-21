import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('home');

  const handleStartClick = () => {
    console.log('开始创建按钮被点击');
    setCurrentView('editor');
  };

  const handlePreviewClick = () => {
    console.log('预览按钮被点击');
    setCurrentView('preview');
  };

  const renderContent = () => {
    switch(currentView) {
      case 'editor':
        return (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>🥞 漏斗编辑器</h2>
            <p>拖拽组件来创建你的营销漏斗</p>
            
            <div 
              onClick={() => {
                alert('问答组件编辑器');
                console.log('点击了问答组件区域');
              }}
              style={{ 
                border: '2px dashed #007bff', 
                padding: '40px', 
                margin: '20px 0',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: '#f8f9fa',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#e3f2fd';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#f8f9fa';
              }}
            >
              <h3>📝 问答组件区域</h3>
              <p>点击这里添加问答题目</p>
              <small>支持单选、多选、文本输入等类型</small>
            </div>

            <div 
              onClick={() => {
                alert('联盟链接设置面板');
                console.log('点击了联盟链接设置');
              }}
              style={{ 
                border: '2px dashed #28a745', 
                padding: '40px', 
                margin: '20px 0',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: '#f8f9fa',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#e8f5e8';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#f8f9fa';
              }}
            >
              <h3>🔗 联盟链接设置</h3>
              <p>点击这里配置推广链接</p>
              <small>设置ClickBank、Amazon等联盟链接</small>
            </div>

            <div 
              onClick={() => {
                alert('颜色自定义面板');
                console.log('点击了颜色自定义');
              }}
              style={{ 
                border: '2px dashed #dc3545', 
                padding: '40px', 
                margin: '20px 0',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: '#f8f9fa',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#ffeaea';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#f8f9fa';
              }}
            >
              <h3>🎨 颜色自定义</h3>
              <p>点击这里自定义主题颜色</p>
              <small>调整按钮、背景、文字颜色</small>
            </div>

            <button 
              onClick={() => setCurrentView('home')}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              ← 返回首页
            </button>
          </div>
        );
      case 'preview':
        return (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>👁️ 预览模式</h2>
            <p>这里是你的营销漏斗预览</p>
            <div style={{ 
              border: '1px solid #ddd', 
              padding: '40px', 
              margin: '20px 0',
              borderRadius: '8px',
              backgroundColor: '#f8f9fa'
            }}>
              <p>📊 漏斗流程预览</p>
              <p>📱 移动端适配</p>
              <p>🔗 链接跳转测试</p>
            </div>
            <button 
              onClick={() => setCurrentView('home')}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              ← 返回首页
            </button>
          </div>
        );
      default:
        return (
          <div style={{
            backgroundColor: '#282c34',
            padding: '20px',
            color: 'white',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '2rem', marginRight: '10px' }}>🎯</span>
              <h1>营销漏斗编辑器</h1>
            </div>
            <p>您的可视化漏斗编辑器已准备就绪！</p>
            <div style={{
              display: 'flex',
              gap: '20px',
              marginTop: '30px'
            }}>
              <button 
                onClick={handleStartClick}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                🚀 开始创建
              </button>
              <button 
                onClick={handlePreviewClick}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                👁️ 预览
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <Router>
      <div className="App">
        {renderContent()}
      </div>
    </Router>
  );
}

export default App;
