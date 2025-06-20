import React from 'react';
import { useDrag } from 'react-dnd';
import './ComponentLibrary.css';

interface ComponentLibraryProps {
  onAddComponent: (type: string, position: { x: number; y: number }) => void;
}

const ComponentLibrary: React.FC<ComponentLibraryProps> = ({ onAddComponent }) => {
  const components = [
    { type: 'quiz', icon: '❓', name: 'Interactive Quiz', description: 'Engage users with questions' },
    { type: 'landing', icon: '🎯', name: 'Landing Page', description: 'Capture visitor attention' },
    { type: 'form', icon: '📝', name: 'Lead Form', description: 'Collect user information' },
    { type: 'video', icon: '🎥', name: 'Video Player', description: 'Embed marketing videos' },
    { type: 'button', icon: '🔘', name: 'CTA Button', description: 'Call-to-action buttons' },
  ];

  return (
    <div className="component-library">
      <div className="library-header">
        <h3>📦 Components</h3>
        <p>Drag components to canvas</p>
      </div>
      
      <div className="components-list">
        {components.map((component) => (
          <DraggableComponent
            key={component.type}
            component={component}
            onAddComponent={onAddComponent}
          />
        ))}
      </div>

      <div className="templates-section">
        <h3>🎨 Quick Templates</h3>
        <div className="template-buttons">
          <button className="template-btn">
            💰 Lead Generation
          </button>
          <button className="template-btn">
            🛒 E-commerce Funnel
          </button>
          <button className="template-btn">
            📧 Email Capture
          </button>
        </div>
      </div>
    </div>
  );
};

const DraggableComponent: React.FC<{
  component: any;
  onAddComponent: (type: string, position: { x: number; y: number }) => void;
}> = ({ component, onAddComponent }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'component',
    item: { type: component.type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`component-item ${isDragging ? 'dragging' : ''}`}
    >
      <span className="component-icon">{component.icon}</span>
      <div className="component-info">
        <h4>{component.name}</h4>
        <p>{component.description}</p>
      </div>
    </div>
  );
};

export default ComponentLibrary;
