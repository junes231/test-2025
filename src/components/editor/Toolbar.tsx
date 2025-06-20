import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FunnelComponent } from '../../types/funnel';
import './Toolbar.css';

interface ToolbarProps {
  components: FunnelComponent[];
}

const Toolbar: React.FC<ToolbarProps> = ({ components }) => {
  const navigate = useNavigate();

  const saveFunnel = () => {
    const funnelData = {
      id: Date.now().toString(),
      components,
      createdAt: new Date().toISOString(),
    };
    
    // 保存到localStorage
    localStorage.setItem(`funnel-${funnelData.id}`, JSON.stringify(funnelData));
    alert('Funnel saved successfully!');
  };

  const previewFunnel = () => {
    const funnelId = Date.now().toString();
    const funnelData = { id: funnelId, components };
    localStorage.setItem(`preview-${funnelId}`, JSON.stringify(funnelData));
    window.open(`/preview/${funnelId}`, '_blank');
  };

  const exportFunnel = () => {
    const funnelData = { components, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(funnelData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'funnel-export.json';
    a.click();
  };

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <button className="toolbar-btn" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <h2>Funnel Editor</h2>
      </div>

      <div className="toolbar-center">
        <span className="component-count">
          {components.length} component{components.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="toolbar-right">
        <button className="toolbar-btn secondary" onClick={saveFunnel}>
          💾 Save
        </button>
        <button className="toolbar-btn secondary" onClick={previewFunnel}>
          👁️ Preview
        </button>
        <button className="toolbar-btn secondary" onClick={exportFunnel}>
          📤 Export
        </button>
        <button className="toolbar-btn primary">
          🚀 Publish
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
