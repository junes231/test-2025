import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const startEditing = () => {
    navigate('/editor');
  };

  return (
    <div className="homepage">
      <div className="hero-section">
        <h1>Marketing Funnel Editor</h1>
        <p>Create interactive marketing funnels with drag-and-drop simplicity</p>
        
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">🎯</span>
            <h3>Interactive Quiz Builder</h3>
            <p>Create engaging quizzes to capture leads</p>
          </div>
          
          <div className="feature-card">
            <span className="feature-icon">🎨</span>
            <h3>Customizable Colors</h3>
            <p>Brand your funnels with custom colors</p>
          </div>
          
          <div className="feature-card">
            <span className="feature-icon">📱</span>
            <h3>Mobile-Responsive</h3>
            <p>Perfect on all devices</p>
          </div>
          
          <div className="feature-card">
            <span className="feature-icon">🔗</span>
            <h3>Affiliate Integration</h3>
            <p>Direct integration with affiliate links</p>
          </div>
        </div>

        <button className="cta-button" onClick={startEditing}>
          🚀 Start Creating Your Funnel
        </button>
      </div>
    </div>
  );
};

export default HomePage;
