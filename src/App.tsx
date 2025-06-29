import React, { useState, useEffect } from 'react';
import './App.css'; // Make sure you have this CSS file for basic styling

// Define TypeScript interfaces for better type safety
interface Answer {
  id: string; // Unique ID for the answer option
  text: string; // The text of the answer
  affiliateLink?: string; // NEW: Optional affiliate link for this specific answer
}

interface Question {
  id: string; // Unique ID for the question
  title: string; // The question text
  type: 'single-choice' | 'text-input'; // For now, we'll focus on single-choice for answers, but kept type for future
  answers: Answer[]; // Array of answer options
}

// Helper to load questions from local storage
const loadQuestionsFromLocalStorage = (): Question[] => {
  try {
    const storedQuestions = localStorage.getItem('quizQuestions');
    // Ensure all answers have an ID for React keys, and affiliateLink is handled
    const parsedQuestions: Question[] = storedQuestions ? JSON.parse(storedQuestions) : [];
    return parsedQuestions.map(q => ({
      ...q,
      answers: q.answers.map(a => ({ ...a, id: a.id || Date.now().toString() + Math.random().toString() }))
    }));
  } catch (error) {
    console.error("Failed to load questions from local storage:", error);
    return [];
  }
};

// Helper to save questions to local storage
const saveQuestionsToLocalStorage = (questions: Question[]) => {
  try {
    localStorage.setItem('quizQuestions', JSON.stringify(questions));
  } catch (error) {
    console.error("Failed to save questions to local storage:", error);
  }
};

// Helper to load affiliate links from local storage (for fallback/general settings)
const loadAffiliateLinksFromLocalStorage = () => {
  try {
    const storedLinks = localStorage.getItem('affiliateLinks');
    return storedLinks ? JSON.parse(storedLinks) : { clickbank: '', amazon: '', tracking: '', conversionGoal: 'Product Purchase' };
  } catch (error) {
    console.error("Failed to load affiliate links from local storage:", error);
    return { clickbank: '', amazon: '', tracking: '', conversionGoal: 'Product Purchase' };
  }
};

// Helper to save affiliate links to local storage
const saveAffiliateLinksToLocalStorage = (links: any) => {
  try {
    localStorage.setItem('affiliateLinks', JSON.stringify(links));
  } catch (error) {
    console.error("Failed to save affiliate links to local storage:", error);
  }
};

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);
  const [affiliateLinks, setAffiliateLinks] = useState(loadAffiliateLinksFromLocalStorage());
  const [currentQuizQuestionIndex, setCurrentQuizQuestionIndex] = useState(0); // For quiz play mode

  // Load questions and links from local storage on component mount
  useEffect(() => {
    setQuestions(loadQuestionsFromLocalStorage());
    setAffiliateLinks(loadAffiliateLinksFromLocalStorage());
  }, []);

  // Save questions and links to local storage whenever they change
  useEffect(() => {
    saveQuestionsToLocalStorage(questions);
  }, [questions]);

  useEffect(() => {
    saveAffiliateLinksToLocalStorage(affiliateLinks);
  }, [affiliateLinks]);

  // --- Handlers for general navigation ---
  const handleStartClick = () => {
    setCurrentView('editor');
  };

  const handlePreviewClick = () => {
    // Reset quiz state before playing
    setCurrentQuizQuestionIndex(0);
    setCurrentView('quizPlay');
  };

  // --- Handlers for Quiz Editor ---
  const handleAddQuestion = () => {
    if (questions.length >= 6) {
      alert('You can only have up to 6 questions for this quiz.');
      return;
    }
    const newQuestion: Question = {
      id: Date.now().toString(),
      title: `New Question ${questions.length + 1}`,
      type: 'single-choice',
      answers: [
        { id: 'a', text: 'Option A' },
        { id: 'b', text: 'Option B' },
        { id: 'c', text: 'Option C' },
        { id: 'd', text: 'Option D' },
      ],
    };
    setQuestions([...questions, newQuestion]);
    setSelectedQuestionIndex(questions.length); // Select the new question for editing
    setCurrentView('questionForm'); // Navigate to the form
  };

  const handleEditQuestion = (index: number) => {
    setSelectedQuestionIndex(index);
    setCurrentView('questionForm');
  };

  const handleDeleteQuestion = () => {
    if (selectedQuestionIndex !== null && window.confirm('Are you sure you want to delete this question?')) {
      const updatedQuestions = questions.filter((_, i) => i !== selectedQuestionIndex);
      setQuestions(updatedQuestions);
      setSelectedQuestionIndex(null); // Clear selection
      setCurrentView('quizEditor'); // Go back to the list
    }
  };

  // --- Handlers for Question Form (for editing a single question) ---
  const handleQuestionFormSave = (updatedQuestion: Question) => {
    if (selectedQuestionIndex !== null) {
      const updatedQuestions = questions.map((q, i) =>
        i === selectedQuestionIndex ? updatedQuestion : q
      );
      setQuestions(updatedQuestions);
    } else {
        // If no question was selected, it's a new question from add
        setQuestions([...questions, updatedQuestion]);
    }
    setSelectedQuestionIndex(null); // Clear selection
    setCurrentView('quizEditor'); // Return to quiz editor list
  };

  const handleQuestionFormCancel = () => {
    setSelectedQuestionIndex(null);
    setCurrentView('quizEditor');
  };

  // --- Handlers for Quiz Player ---
  const handleAnswerClick = (answerIndex: number) => {
    const currentQuestion = questions[currentQuizQuestionIndex];

    // Check if it's the last question (index 5 for 6 questions total)
    if (currentQuizQuestionIndex === 5 && questions.length === 6) {
      // THIS IS THE REDIRECTION LOGIC FOR THE 6TH QUESTION
      const finalAnswer = currentQuestion.answers[answerIndex];
      // Prioritize the link directly on the answer, then fallbacks
      const redirectLink = finalAnswer.affiliateLink || affiliateLinks.clickbank || affiliateLinks.amazon || "https://example.com/default-affiliate-link"; // Fallback link

      console.log("Quiz complete! Redirecting to:", redirectLink);
      alert('Quiz complete! Redirecting you to your personalized offer.'); // Replaced confirm with alert
      window.location.href = redirectLink; // Perform redirection
      return; // Exit function after redirection
    }

    // Move to the next question if not the last or if fewer than 6 questions
    if (currentQuizQuestionIndex < questions.length - 1) {
      setCurrentQuizQuestionIndex(currentQuizQuestionIndex + 1);
    } else {
      // This path is hit if quiz has < 6 questions and it's the last one
      // Or if it's the 6th question but somehow the above if condition (currentQuizQuestionIndex === 5) was not met.
      // We should ideally ensure `questions.length === 6` for final redirect path
      alert('Quiz complete! No more questions. Returning to dashboard.');
      setCurrentQuizQuestionIndex(0); // Reset for next play
      setCurrentView('editor'); // Go back to editor dashboard
    }
  };


  // --- Render content based on currentView ---
  const renderContent = () => {
    switch (currentView) {
      case 'editor':
        return (
          <div className="dashboard-container">
            <h2><span role="img" aria-label="funnel">🥞</span> Funnel Editor</h2>
            <p>Drag & drop components to build your marketing funnel</p>

            <div
              className="dashboard-card"
              onClick={() => setCurrentView('quizEditor')}
            >
              <h3><span role="img" aria-label="quiz">📝</span> Interactive Quiz Builder</h3>
              <p>Click here to manage your quiz questions</p>
              <small>Supports single-choice, multiple-choice, text input, etc.</small>
            </div>

            <div
              className="dashboard-card"
              onClick={() => setCurrentView('linkSettings')}
            >
              <h3><span role="img" aria-label="link">🔗</span> Affiliate Link Settings</h3>
              <p>Click here to configure your general affiliate links (used as fallback).</p>
              <small>Note: Final quiz redirection links are set per-answer on the 6th question.</small>
            </div>

            <div
              className="dashboard-card"
              onClick={() => setCurrentView('colorCustomizer')}
            >
              <h3><span role="img" aria-label="palette">🎨</span> Color Customization</h3>
              <p>Click here to customize theme colors</p>
              <small>Adjust button, background, and text colors</small>
            </div>

            <button className="back-button" onClick={() => setCurrentView('home')}>
              <span role="img" aria-label="back">←</span> Back to Home
            </button>
          </div>
        );

      case 'quizEditor':
        return (
          <QuizEditor
            questions={questions}
            onAddQuestion={handleAddQuestion}
            onEditQuestion={handleEditQuestion}
            onBack={() => setCurrentView('editor')}
          />
        );

      case 'questionForm':
        const questionToEdit = selectedQuestionIndex !== null ? questions[selectedQuestionIndex] : undefined;
        const isLastQuestion = selectedQuestionIndex === 5; // Check if it's the 6th question (index 5)
        return (
          <QuestionForm
            question={questionToEdit}
            questionIndex={selectedQuestionIndex}
            isLastQuestion={isLastQuestion} // Pass this prop
            onSave={handleQuestionFormSave}
            onCancel={handleQuestionFormCancel}
            onDelete={handleDeleteQuestion}
          />
        );

      case 'linkSettings':
        return (
          <LinkSettings
            affiliateLinks={affiliateLinks}
            setAffiliateLinks={setAffiliateLinks}
            onBack={() => setCurrentView('editor')}
          />
        );

      case 'colorCustomizer':
        return (
          <ColorCustomizer
            onBack={() => setCurrentView('editor')}
          />
        );

      case 'quizPlay':
        if (questions.length === 0) {
          return (
            <div className="quiz-player-container">
                <h2>No Quiz Questions Configured!</h2>
                <p>Please go back to the editor and add 6 questions first to play the full quiz.</p>
                <button className="back-button" onClick={() => { setCurrentView('quizEditor'); setCurrentQuizQuestionIndex(0); }}>
                    <span role="img" aria-label="back">←</span> Go to Quiz Editor
                </button>
            </div>
          );
        }
        if (questions.length < 6) {
          return (
            <div className="quiz-player-container">
                <h2>Quiz Not Ready</h2>
                <p>Please add exactly 6 questions in the editor for the full quiz experience.</p>
                <button className="back-button" onClick={() => { setCurrentView('quizEditor'); setCurrentQuizQuestionIndex(0); }}>
                    <span role="img" aria-label="back">←</span> Go to Quiz Editor
                </button>
            </div>
          );
        }

        const quizQuestion = questions[currentQuizQuestionIndex];
        return (
          <QuizPlayer
            question={quizQuestion}
            currentQuestionNumber={currentQuizQuestionIndex + 1}
            totalQuestions={questions.length}
            onAnswerClick={handleAnswerClick}
            onBack={() => { setCurrentView('home'); setCurrentQuizQuestionIndex(0); }} // Reset quiz on exit
          />
        );

      default: // Home View
        return (
          <div className="home-container">
            <div className="home-header">
              <span role="img" aria-label="target">🎯</span>
              <h1>Marketing Funnel Editor</h1>
            </div>
            <p>Your visual funnel editor is ready!</p>
            <div className="home-buttons">
              <button className="home-button primary" onClick={handleStartClick}>
                <span role="img" aria-label="rocket">🚀</span> Start Building
              </button>
              <button className="home-button secondary" onClick={handlePreviewClick}>
                <span role="img" aria-label="eye">👁️</span> Preview Quiz
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="App">
      {renderContent()}
    </div>
  );
}

// --- Individual Components (defined within App.tsx for simplicity, can be moved to separate files) ---

interface QuizEditorProps {
  questions: Question[];
  onAddQuestion: () => void;
  onEditQuestion: (index: number) => void;
  onBack: () => void;
}

const QuizEditor: React.FC<QuizEditorProps> = ({ questions, onAddQuestion, onEditQuestion, onBack }) => {
  return (
    <div className="quiz-editor-container">
      <h2><span role="img" aria-label="quiz">📝</span> Quiz Question List</h2>
      <button className="add-button" onClick={onAddQuestion}>
        <span role="img" aria-label="add">➕</span> Add New Question
      </button>

      {questions.length === 0 ? (
        <p className="no-questions-message">No questions added yet. Click "Add New Question" to start!</p>
      ) : (
        <ul className="question-list">
          {questions.map((q, index) => (
            <li key={q.id} className="question-item" onClick={() => onEditQuestion(index)}>
              Question {index + 1}: {q.title}
            </li>
          ))}
        </ul>
      )}

      <button className="back-button" onClick={onBack}>
        <span role="img" aria-label="back">←</span> Back to Editor Dashboard
      </button>
    </div>
  );
};

interface QuestionFormProps {
  question?: Question; // undefined for new question
  questionIndex: number | null; // index for current question, null for new
  isLastQuestion: boolean; // NEW: Indicates if this is the 6th question
  onSave: (question: Question) => void;
  onCancel: () => void;
  onDelete: () => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ question, questionIndex, isLastQuestion, onSave, onCancel, onDelete }) => {
  const [title, setTitle] = useState(question ? question.title : '');
  // Initialize answers with 4 empty placeholders if new, or existing answers
  const [answers, setAnswers] = useState<Answer[]>(
    question && question.answers.length > 0
      ? question.answers
      : Array(4).fill(null).map((_, i) => ({ id: `option-${Date.now()}-${i}`, text: `Option ${String.fromCharCode(65 + i)}`, affiliateLink: '' }))
  );

  useEffect(() => { // Update form fields if selected question changes
    setTitle(question ? question.title : '');
    setAnswers(
      question && question.answers.length > 0
        ? question.answers
        : Array(4).fill(null).map((_, i) => ({ id: `option-${Date.now()}-${i}`, text: `Option ${String.fromCharCode(65 + i)}`, affiliateLink: '' }))
    );
  }, [question]);

  const handleAnswerTextChange = (index: number, value: string) => {
    const updatedAnswers = [...answers];
    if (!updatedAnswers[index]) { // Ensure the answer object exists
      updatedAnswers[index] = { id: `option-${Date.now()}-${index}`, text: '', affiliateLink: '' };
    }
    updatedAnswers[index].text = value;
    setAnswers(updatedAnswers);
  };

  const handleAffiliateLinkChange = (index: number, value: string) => {
    const updatedAnswers = [...answers];
    if (!updatedAnswers[index]) { // Ensure the answer object exists
      updatedAnswers[index] = { id: `option-${Date.now()}-${index}`, text: '', affiliateLink: '' };
    }
    updatedAnswers[index].affiliateLink = value;
    setAnswers(updatedAnswers);
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Question title cannot be empty!');
      return;
    }
    const filteredAnswers = answers.filter(ans => ans.text.trim() !== ''); // Filter out empty answers
    if (filteredAnswers.length === 0) {
        alert('Please provide at least one answer option.');
        return;
    }
    // For the last question, ensure affiliate links are set for provided answers
    if (isLastQuestion) {
        for (const ans of filteredAnswers) {
            if (!ans.affiliateLink || ans.affiliateLink.trim() === '') {
                alert(`Please set an affiliate link for all answers of Question ${questionIndex !== null ? questionIndex + 1 : ''}.`);
                return;
            }
        }
    }

    onSave({
      id: question?.id || Date.now().toString(),
      title,
      type: 'single-choice', // Fixed type for now
      answers: filteredAnswers,
    });
  };

  return (
    <div className="question-form-container">
      <h2><span role="img" aria-label="edit">📝</span> Quiz Question Editor</h2>
      <p className="question-index-display">
        {questionIndex !== null ? `Editing Question ${questionIndex + 1} of 6` : 'Adding New Question'}
      </p>
      <div className="form-group">
        <label>Question Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., What's your biggest health concern?"
        />
      </div>
      <div className="form-group">
        <label>Question Type:</label>
        <select value="single-choice" onChange={() => { /* Not implemented yet */ }} disabled>
          <option>Single Choice</option>
          <option>Multiple Choice (Coming Soon)</option>
          <option>Text Input (Coming Soon)</option>
        </select>
      </div>
      <div className="answer-options-section">
        <p>Answer Options (Max 4):</p>
        {Array.from({ length: 4 }).map((_, index) => ( // Always render 4 input fields for consistency
          <div key={index} className="answer-input-group">
            <input
              type="text"
              value={answers[index]?.text || ''}
              onChange={(e) => handleAnswerTextChange(index, e.target.value)}
              placeholder={`Option ${String.fromCharCode(65 + index)}`}
            />
            {isLastQuestion && ( // ONLY show affiliate link input for the last question
              <input
                type="text"
                value={answers[index]?.affiliateLink || ''}
                onChange={(e) => handleAffiliateLinkChange(index, e.target.value)}
                placeholder={`Affiliate Link for Option ${String.fromCharCode(65 + index)}`}
                className="affiliate-link-input"
              />
            )}
          </div>
        ))}
      </div>
      <div className="form-actions">
        <button className="save-button" onClick={handleSave}>
          <span role="img" aria-label="save">💾</span> Save Question
        </button>
        <button className="cancel-button" onClick={onCancel}>
          <span role="img" aria-label="cancel">←</span> Back to List
        </button>
        {questionIndex !== null && (
          <button className="delete-button" onClick={onDelete}>
            <span role="img" aria-label="delete">🗑️</span> Delete Question
          </button>
        )}
      </div>
    </div>
  );
};


interface LinkSettingsProps {
    affiliateLinks: { clickbank: string; amazon: string; tracking: string; conversionGoal: string };
    setAffiliateLinks: React.Dispatch<React.SetStateAction<{ clickbank: string; amazon: string; tracking: string; conversionGoal: string }>>;
    onBack: () => void;
}

const LinkSettings: React.FC<LinkSettingsProps> = ({ affiliateLinks, setAffiliateLinks, onBack }) => {
    const [cbLink, setCbLink] = useState(affiliateLinks.clickbank);
    const [amzLink, setAmzLink] = useState(affiliateLinks.amazon);
    const [tracking, setTracking] = useState(affiliateLinks.tracking);
    const [goal, setGoal] = useState(affiliateLinks.conversionGoal);

    const handleSave = () => {
        setAffiliateLinks({ clickbank: cbLink, amazon: amzLink, tracking, conversionGoal: goal });
        alert('Affiliate Link Settings Saved!');
        onBack();
    };

    return (
        <div className="link-settings-container">
            <h2><span role="img" aria-label="link">🔗</span> Affiliate Link Settings</h2>
            <p>These links are used as fallback if specific links are not set for the 6th question's answers.</p>
            <div className="form-group">
                <label>ClickBank Link (Fallback):</label>
                <input
                    type="text"
                    value={cbLink}
                    onChange={(e) => setCbLink(e.target.value)}
                    placeholder="https://clickbank.com/..."
                />
            </div>
            <div className="form-group">
                <label>Amazon Affiliate Link (Fallback):</label>
                <input
                    type="text"
                    value={amzLink}
                    onChange={(e) => setAmzLink(e.target.value)}
                    placeholder="https://amazon.com/..."
                />
            </div>
            <div className="form-group">
                <label>Tracking Parameters:</label>
                <input
                    type="text"
                    value={tracking}
                    onChange={(e) => setTracking(e.target.value)}
                    placeholder="utm_source=funnel&utm_campaign=..."
                />
            </div>
            <div className="form-group">
                <label>Conversion Goal:</label>
                <select value={goal} onChange={(e) => setGoal(e.target.value)}>
                    <option>Product Purchase</option>
                    <option>Email Subscription</option>
                    <option>Free Trial</option>
                </select>
            </div>
            <div className="form-actions">
                <button className="save-button" onClick={handleSave}>
                    <span role="img" aria-label="save">💾</span> Save Settings
                </button>
                <button className="cancel-button" onClick={onBack}>
                    <span role="img" aria-label="back">←</span> Back to Editor
                </button>
            </div>
        </div>
    );
};

interface ColorCustomizerProps {
    onBack: () => void;
}

const ColorCustomizer: React.FC<ColorCustomizerProps> = ({ onBack }) => {
    // This component currently doesn't manage global colors, but lays out the UI.
    // To implement, you would likely use React Context or CSS variables that JS can update.
    return (
        <div className="color-customizer-container">
            <h2><span role="img" aria-label="palette">🎨</span> Color Customization</h2>
            <div className="form-group">
                <label>Primary Color:</label>
                <input type="color" defaultValue="#007bff" />
            </div>
            <div className="form-group">
                <label>Button Color:</label>
                <input type="color" defaultValue="#28a745" />
            </div>
            <div className="form-group">
                <label>Background Color:</label>
                <input type="color" defaultValue="#f8f9fa" />
            </div>
            <div className="form-group">
                <label>Text Color:</label>
                <input type="color" defaultValue="#333333" />
            </div>
            <div className="form-actions">
                <button className="save-button" onClick={() => { alert('Color Theme Saved! (Functionality to apply not yet implemented)'); onBack(); }}>
                    <span role="img" aria-label="save">💾</span> Save Theme
                </button>
                <button className="cancel-button" onClick={onBack}>
                    <span role="img" aria-label="back">←</span> Back to Editor
                </button>
            </div>
        </div>
    );
};


interface QuizPlayerProps {
    question: Question;
    currentQuestionNumber: number;
    totalQuestions: number;
    onAnswerClick: (answerIndex: number) => void;
    onBack: () => void;
}

const QuizPlayer: React.FC<QuizPlayerProps> = ({ question, currentQuestionNumber, totalQuestions, onAnswerClick, onBack }) => {
    if (!question) {
        return (
            <div className="quiz-player-container">
                <p>Loading question...</p>
                <button className="back-button" onClick={onBack}>
                    <span role="img" aria-label="back">←</span> Back
                </button>
            </div>
        );
    }

    return (
        <div className="quiz-player-container">
            <h2><span role="img" aria-label="quiz">❓</span> Quiz Time!</h2>
            <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${(currentQuestionNumber / totalQuestions) * 100}%` }}></div>
            </div>
            <p className="question-counter">Question {currentQuestionNumber} / {totalQuestions}</p>

            <h3 className="quiz-question-title">{question.title}</h3>

            <div className="quiz-answers-container">
                {question.answers.map((answer, index) => (
                    <button key={answer.id || index} className="quiz-answer-button" onClick={() => onAnswerClick(index)}>
                        {answer.text}
                    </button>
                ))}
            </div>

            <button className="back-button" onClick={onBack}>
                <span role="img" aria-label="back">←</span> Back to Home
            </button>
        </div>
    );
};

