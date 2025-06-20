import React from 'react';

interface ElementLibraryProps {
  onAddNode: (type: string) => void;
}

const ElementLibrary: React.FC<ElementLibraryProps> = ({ onAddNode }) => {
  const elements = [
    { type: 'quiz', icon: '❓', name: 'Interactive Quiz' },
  ];

  return (
    <div className="element-library">
      <h3>Funnel Elements</h3>
      <div className="elements-grid">
        {elements.map((element) => (
          <div
            key={element.type}
            className="element-item"
            onClick={() => onAddNode(element.type)}
          >
            <span className="element-icon">{element.icon}</span>
            <span className="element-name">{element.name}</span>
          </div>
        ))}
      </div>
      
      <div className="templates-section">
        <h3>Quick Templates</h3>
        <button 
          className="template-btn"
          onClick={() => onAddNode('quiz')}
        >
          🎯 Lead Generation Quiz
        </button>
        <button 
          className="template-btn"
          onClick={() => onAddNode('quiz')}
        >
          💰 Product Recommendation Quiz
        </button>
      </div>
    </div>
  );
};

export default ElementLibrary;
