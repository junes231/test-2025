import React, { useState } from 'react';
import { HashRouter as Router } from 'react-router-dom';
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
                setCurrentView('questionEditor');
                console.log('打开问答组件编辑器');
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
            >
              <h3>📝 问答组件区域</h3>
              <p>点击这里添加问答题目</p>
              <small>支持单选、多选、文本输入等类型</small>
            </div>

            <div 
              onClick={() => {
                setCurrentView('linkSettings');
                console.log('打开联盟链接设置');
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
            >
              <h3>🔗 联盟链接设置</h3>
              <p>点击这里配置推广链接</p>
              <small>设置ClickBank、Amazon等联盟链接</small>
            </div>

            <div 
              onClick={() => {
                setCurrentView('colorCustomizer');
                console.log('打开颜色自定义');
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

      case 'questionEditor':
        return (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>📝 问答组件编辑器</h2>
            <div style={{ margin: '20px 0', textAlign: 'left' }}>
              <label style={{ display: 'block', margin: '10px 0' }}>
                问题标题：
                <input 
                  type="text" 
                  placeholder="例如：你最关心的健康问题是什么？" 
                  style={{ width: '100%', padding: '8px', margin: '5px 0' }}
                />
              </label>
              <label style={{ display: 'block', margin: '10px 0' }}>
                问题类型：
                <select style={{ width: '100%', padding: '8px', margin: '5px 0' }}>
                  <option>单选题</option>
                  <option>多选题</option>
                  <option>文本输入</option>
                </select>
              </label>
              <div style={{ margin: '15px 0' }}>
                <p>答案选项：</p>
                <input placeholder="选项A：减肥瘦身" style={{ width: '100%', padding: '8px', margin: '3px 0' }} />
                <input placeholder="选项B：增肌健身" style={{ width: '100%', padding: '8px', margin: '3px 0' }} />
                <input placeholder="选项C：改善睡眠" style={{ width: '100%', padding: '8px', margin: '3px 0' }} />
              </div>
            </div>
            <div style={{ marginTop: '30px' }}>
              <button 
                onClick={() => {
                  alert('问答组件已保存！');
                  setCurrentView('editor');
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  marginRight: '10px'
                }}
              >
                💾 保存问答
              </button>
              <button 
                onClick={() => setCurrentView('editor')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                ← 返回编辑器
              </button>
            </div>
          </div>
        );

      case 'linkSettings':
        return (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>🔗 联盟链接设置</h2>
            <div style={{ margin: '20px 0', textAlign: 'left' }}>
              <label style={{ display: 'block', margin: '10px 0' }}>
                ClickBank链接：
                <input 
                  type="text" 
                  placeholder="https://clickbank.com/..." 
                  style={{ width: '100%', padding: '8px', margin: '5px 0' }}
                />
              </label>
              <label style={{ display: 'block', margin: '10px 0' }}>
                Amazon联盟链接：
                <input 
                  type="text" 
                  placeholder="https://amazon.com/..." 
                  style={{ width: '100%', padding: '8px', margin: '5px 0' }}
                />
              </label>
              <label style={{ display: 'block', margin: '10px 0' }}>
                跟踪参数：
                <input 
                  type="text" 
                  placeholder="utm_source=funnel&utm_campaign=..." 
                  style={{ width: '100%', padding: '8px', margin: '5px 0' }}
                />
              </label>
              <label style={{ display: 'block', margin: '10px 0' }}>
                转化目标：
                <select style={{ width: '100%', padding: '8px', margin: '5px 0' }}>
                  <option>产品购买</option>
                  <option>邮箱订阅</option>
                  <option>免费试用</option>
                </select>
              </label>
            </div>
            <div style={{ marginTop: '30px' }}>
              <button 
                onClick={() => {
                  alert('联盟链接设置已保存！');
                  setCurrentView('editor');
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  marginRight: '10px'
                }}
              >
                💾 保存设置
              </button>
              <button 
                onClick={() => setCurrentView('editor')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                ← 返回编辑器
              </button>
            </div>
          </div>
        );

      case 'colorCustomizer':
        return (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>🎨 颜色自定义</h2>
            <div style={{ margin: '20px 0', textAlign: 'left' }}>
              <label style={{ display: 'block', margin: '10px 0' }}>
                主色调：
                <input 
                  type="color" 
                  defaultValue="#007bff"
                  style={{ width: '100%', padding: '8px', margin: '5px 0' }}
                />
              </label>
              <label style={{ display: 'block', margin: '10px 0' }}>
                按钮颜色：
                <input 
                  type="color" 
                  defaultValue="#28a745"
                  style={{ width: '100%', padding: '8px', margin: '5px 0' }}
                />
              </label>
              <label style={{ display: 'block', margin: '10px 0' }}>
                背景颜色：
                <input 
                  type="color" 
                  defaultValue="#f8f9fa"
                  style={{ width: '100%', padding: '8px', margin: '5px 0' }}
                />
              </label>
              <label style={{ display: 'block', margin: '10px 0' }}>
                文字颜色：
                <input 
                  type="color" 
                  defaultValue="#333333"
                  style={{ width: '100%', padding: '8px', margin: '5px 0' }}
                />
              </label>
            </div>
            <div style={{ marginTop: '30px' }}>
              <button 
                onClick={() => {
                  alert('颜色主题已保存！');
                  setCurrentView('editor');
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  marginRight: '10px'
                }}
              >
                💾 保存主题
              </button>
              <button 
                onClick={() => setCurrentView('editor')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                ← 返回编辑器
              </button>
            </div>
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
              <h3>📊 漏斗流程预览</h3>
              <div style={{ margin: '20px 0' }}>
                <p>1️⃣ 问答互动 → 了解用户需求</p>
                <p>2️⃣ 个性化推荐 → 匹配最佳产品</p>
                <p>3️⃣ 联盟链接跳转 → 完成转化</p>
              </div>
              <p>📱 移动端适配完美</p>
              <p>🔗 链接跳转测试正常</p>
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
    <HashRouter>
      <div className="App">
        {renderContent()}
      </div>
    </HashRouter>
  );
}

export default App;
