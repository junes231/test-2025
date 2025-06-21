import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>🎯 Marketing Funnel Editor</h1>
        <p>Your visual funnel editor is ready!</p>
        <div style={{
          display: 'flex',
          gap: '20px',
          marginTop: '30px'
        }}>
          <button style={{
            padding: '12px 24px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}>
            🚀 Start Creating
          </button>
          <button style={{
            padding: '12px 24px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}>
            👁️ Preview
          </button>
        </div>
      </header>
    </div>
  );
}

export default App;
