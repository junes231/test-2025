import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FunnelComponent } from '../types/funnel';
import './PreviewPage.css';

const PreviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [components, setComponents] = useState<FunnelComponent[]>([]);

  useEffect(() => {
    if (id) {
      const funnelData = localStorage.getItem(`preview-${id}`);
      if (funnelData) {
        const { components } = JSON.parse(funnelData);
        setComponents(components);
      }
    }
  }, [id]);

  const handleAnswerClick = (affiliateLink: string) => {
    if (affiliateLink) {
      window.open(affiliateLink, '_blank');
    }
  };

  return (
    <div className="preview-page">
      {components.map((component) => {
        if (component.type === 'quiz') {
          return (
            <div
              key={component.id}
              className="preview-quiz"
              style={{
                backgroundColor: component.data.backgroundColor,
                color: component.data.textColor,
              }}
            >
              <div className="quiz-container">
                <h1 className="quiz-question">{component.data.question}</h1>
                
                <div className="quiz-answers">
                  {component.data.answers.map((answer: string, index: number) => (
                    <button
                      key={index}
                      className="quiz-answer-button"
                      style={{
                        backgroundColor: component.data.buttonColor,
                        color: component.data.buttonTextColor,
                      }}
                      onClick={() => handleAnswerClick(component.data.affiliateLinks?.[index] || '')}
                    >
                      {answer}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};

export default PreviewPage;
