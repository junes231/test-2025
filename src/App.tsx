import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Routes, Route, Link } from 'react-router-dom';
import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  Firestore,
  query,
  where,
  getDoc
} from 'firebase/firestore';
import './App.css'; // Make sure you have this CSS file for styling

// Define TypeScript interfaces
interface Answer {
  id: string;
  text: string;
}

interface Question {
  id: string;
  title: string;
  type: 'single-choice' | 'text-input';
  answers: Answer[];
}

interface FunnelData {
  questions: Question[];
  finalRedirectLink: string;
  tracking: string;
  conversionGoal: string;
}

interface Funnel {
  id: string; // Document ID in Firestore
  name: string; // Funnel name
  data: FunnelData;
}

// Props for the main App component, now accepting db from index.tsx
interface AppProps {
  db: Firestore;
}

export default function App({ db }: AppProps) {
  const navigate = useNavigate(); // Hook for programmatic navigation

  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const funnelsCollectionRef = collection(db, 'funnels'); // Firestore collection reference

  // --- Data Loading from Firestore ---
  const getFunnels = useCallback(async () => {
    try {
      const data = await getDocs(funnelsCollectionRef);
      const loadedFunnels = data.docs.map((doc) => ({
        ...(doc.data() as Funnel), // Cast to Funnel interface
        id: doc.id, // Ensure id is from doc.id
      }));

      // --- Migration Logic from old localStorage (run once) ---
      const hasMigrated = localStorage.getItem('hasMigratedToFirestore');
      const oldQuizQuestions = localStorage.getItem('quizQuestions');
      const oldAffiliateLinks = localStorage.getItem('affiliateLinks');

      if (!hasMigrated && oldQuizQuestions && oldAffiliateLinks) {
        const parsedOldQuestions: Question[] = JSON.parse(oldQuizQuestions);
        const parsedOldLinks = JSON.parse(oldAffiliateLinks);

        if (parsedOldQuestions.length > 0) {
          console.log("Migrating old local storage data to Firestore...");
          const newFunnel: FunnelData = {
            questions: parsedOldQuestions,
            finalRedirectLink: parsedOldLinks.finalRedirectLink || '',
            tracking: parsedOldLinks.tracking || '',
            conversionGoal: parsedOldLinks.conversionGoal || 'Product Purchase',
          };
          await addDoc(funnelsCollectionRef, { name: "Migrated Funnel (from LocalStorage)", data: newFunnel });
          localStorage.setItem('hasMigratedToFirestore', 'true'); // Mark as migrated
          alert('Old quiz data migrated to Firestore! Please refresh.');
          window.location.reload(); // Force reload to see new data
        }
      }
      // --- End Migration Logic ---

      setFunnels(loadedFunnels);
    } catch (error) {
      console.error("Error fetching funnels:", error);
      alert("Failed to load funnels from database. Check console for details.");
    }
  }, [funnelsCollectionRef]);

  useEffect(() => {
    getFunnels();
  }, [getFunnels]);

  // --- Funnel Management Functions ---
  const createFunnel = async (name: string, initialData?: FunnelData) => {
    try {
      const newFunnelRef = await addDoc(funnelsCollectionRef, {
        name: name,
        data: initialData || { questions: [], finalRedirectLink: '', tracking: '', conversionGoal: 'Product Purchase' },
      });
      alert(`Funnel "${name}" created!`);
      getFunnels(); // Refresh list
      navigate(`/edit/${newFunnelRef.id}`); // Navigate to edit new funnel
    } catch (error) {
      console.error("Error creating funnel:", error);
      alert("Failed to create funnel. Check console for details.");
    }
  };

  const deleteFunnel = async (funnelId: string) => {
    if (window.confirm("Are you sure you want to delete this funnel? This action cannot be undone.")) {
      try {
        const funnelDoc = doc(db, 'funnels', funnelId);
        await deleteDoc(funnelDoc);
        alert('Funnel deleted!');
        getFunnels(); // Refresh list
        navigate('/'); // Go back to dashboard
      } catch (error) {
        console.error("Error deleting funnel:", error);
        alert("Failed to delete funnel. Check console for details.");
      }
    }
  };

  const updateFunnelData = async (funnelId: string, newData: FunnelData) => {
    try {
      const funnelDoc = doc(db, 'funnels', funnelId);
      await updateDoc(funnelDoc, { data: newData });
      getFunnels(); // Refresh list to reflect changes
      // alert('Funnel data saved!');
    } catch (error) {
      console.error("Error updating funnel:", error);
      alert("Failed to save funnel data. Check console for details.");
    }
  };

  // --- Render Routes ---
  return (
    <Routes>
      <Route path="/" element={<FunnelDashboard funnels={funnels} createFunnel={createFunnel} deleteFunnel={deleteFunnel} />} />
      <Route path="/edit/:funnelId" element={<FunnelEditor db={db} updateFunnelData={updateFunnelData} />} />
      <Route path="/play/:funnelId" element={<QuizPlayer db={db} />} />
      <Route path="*" element={<h2>404 Not Found</h2>} /> {/* Catch-all for unknown routes */}
    </Routes>
  );
}

// --- Individual Components (Moved outside App, but still in the same file for simplicity) ---

// FunnelDashboard Component
interface FunnelDashboardProps {
  funnels: Funnel[];
  createFunnel: (name: string, initialData?: FunnelData) => Promise<void>;
  deleteFunnel: (funnelId: string) => Promise<void>;
}

const FunnelDashboard: React.FC<FunnelDashboardProps> = ({ funnels, createFunnel, deleteFunnel }) => {
  const [newFunnelName, setNewFunnelName] = useState('');
  const navigate = useNavigate();

  const handleCreateFunnel = () => {
    if (!newFunnelName.trim()) {
      alert('Please enter a funnel name.');
      return;
    }
    createFunnel(newFunnelName);
    setNewFunnelName(''); // Clear input
  };

  const handleCopyLink = (funnelId: string) => {
    const shareLink = `${window.location.origin}${window.location.pathname}#/play/${funnelId}`; // Uses HashRouter path
    navigator.clipboard.writeText(shareLink)
      .then(() => alert(`Share link copied: ${shareLink}`))
      .catch((err) => {
        console.error('Failed to copy link:', err);
        alert('Failed to copy link. Please copy it manually from the console.');
      });
  };

  return (
    <div className="dashboard-container">
      <h2><span role="img" aria-label="funnel">🥞</span> Your Funnels</h2>
      <div className="create-funnel-section">
        <input
          type="text"
          placeholder="New Funnel Name"
          value={newFunnelName}
          onChange={(e) => setNewFunnelName(e.target.value)}
          className="funnel-name-input"
        />
        <button className="add-button" onClick={handleCreateFunnel}>
          <span role="img" aria-label="add">➕</span> Create New Funnel
        </button>
      </div>

      {funnels.length === 0 ? (
        <p className="no-funnels-message">No funnels created yet. Start by creating one!</p>
      ) : (
        <ul className="funnel-list">
          {funnels.map((funnel) => (
            <li key={funnel.id} className="funnel-item">
              <span>{funnel.name}</span>
              <div className="funnel-actions">
                <button className="button-link" onClick={() => navigate(`/edit/${funnel.id}`)}>
                  Edit
                </button>
                <button className="button-link" onClick={() => navigate(`/play/${funnel.id}`)}>
                  Play
                </button>
                <button className="button-link" onClick={() => handleCopyLink(funnel.id)}>
                  Copy Link
                </button>
                <button className="button-link delete-button" onClick={() => deleteFunnel(funnel.id)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// FunnelEditor (now for editing a specific funnel's quiz & links)
interface FunnelEditorProps {
  db: Firestore;
  updateFunnelData: (funnelId: string, newData: FunnelData) => Promise<void>;
}

const FunnelEditor: React.FC<FunnelEditorProps> = ({ db, updateFunnelData }) => {
  const { funnelId } = useParams<{ funnelId: string }>(); // Get funnelId from URL
  const navigate = useNavigate();

  const [funnelName, setFunnelName] = useState('Loading...');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [finalRedirectLink, setFinalRedirectLink] = useState('');
  const [tracking, setTracking] = useState('');
  const [conversionGoal, setConversionGoal] = useState('Product Purchase');

  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);
  const [currentSubView, setCurrentSubView] = useState('quizEditorList'); // 'quizEditorList', 'questionForm', 'linkSettings', 'colorCustomizer'

  // Load specific funnel data when component mounts or funnelId changes
  useEffect(() => {
    const getFunnel = async () => {
      if (!funnelId) return;
      const funnelDocRef = doc(db, 'funnels', funnelId);
      const funnelDoc = await getDoc(funnelDocRef);
      if (funnelDoc.exists()) {
        const funnel = funnelDoc.data() as Funnel;
        setFunnelName(funnel.name);
        setQuestions(funnel.data.questions || []);
        setFinalRedirectLink(funnel.data.finalRedirectLink || '');
        setTracking(funnel.data.tracking || '');
        setConversionGoal(funnel.data.conversionGoal || 'Product Purchase');
      } else {
        alert('Funnel not found!');
        navigate('/'); // Go back to dashboard
      }
    };
    getFunnel();
  }, [funnelId, db, navigate]);

  // Save funnel data to Firestore whenever relevant states change
  // Use a debounce or save button for large forms in production
  const saveFunnelToFirestore = useCallback(() => {
    if (!funnelId) return;
    const newData: FunnelData = {
      questions,
      finalRedirectLink,
      tracking,
      conversionGoal,
    };
    updateFunnelData(funnelId, newData);
  }, [funnelId, questions, finalRedirectLink, tracking, conversionGoal, updateFunnelData]);

  // Use useEffect to save changes automatically, with a debounce for performance
  useEffect(() => {
    const handler = setTimeout(() => {
      saveFunnelToFirestore();
    }, 1000); // Save 1 second after last change
    return () => clearTimeout(handler);
  }, [questions, finalRedirectLink, tracking, conversionGoal, saveFunnelToFirestore]);


  // --- Quiz Question Management in Editor ---
  const handleAddQuestion = () => {
    if (questions.length >= 6) {
      alert('You can only have up to 6 questions for this quiz.');
      return;
    }
    const newQuestion: Question = {
      id: Date.now().toString(),
      title: `New Question ${questions.length + 1}`,
      type: 'single-choice',
      answers: Array(4).fill(null).map((_, i) => ({ id: `option-${Date.now()}-${i}`, text: `Option ${String.fromCharCode(65 + i)}` })),
    };
    setQuestions([...questions, newQuestion]);
    setSelectedQuestionIndex(questions.length); // Select the new question
    setCurrentSubView('questionForm'); // Navigate to the form
  };

  const handleEditQuestion = (index: number) => {
    setSelectedQuestionIndex(index);
    setCurrentSubView('questionForm');
  };

  const handleDeleteQuestion = () => {
    if (selectedQuestionIndex !== null && window.confirm('Are you sure you want to delete this question?')) {
      const updatedQuestions = questions.filter((_, i) => i !== selectedQuestionIndex);
      setQuestions(updatedQuestions);
      setSelectedQuestionIndex(null); // Clear selection
      setCurrentSubView('quizEditorList'); // Go back to the list
    }
  };

  const handleQuestionFormSave = (updatedQuestion: Question) => {
    if (selectedQuestionIndex !== null) {
      const updatedQuestions = questions.map((q, i) =>
        i === selectedQuestionIndex ? updatedQuestion : q
      );
      setQuestions(updatedQuestions);
    } else {
        setQuestions([...questions, updatedQuestion]);
    }
    setSelectedQuestionIndex(null);
    setCurrentSubView('quizEditorList');
  };

  const handleQuestionFormCancel = () => {
    setSelectedQuestionIndex(null);
    setCurrentSubView('quizEditorList');
  };

  // --- Render Sub-views within FunnelEditor ---
  const renderEditorContent = () => {
    switch (currentSubView) {
      case 'quizEditorList':
        return (
          <QuizEditorComponent
            questions={questions}
            onAddQuestion={handleAddQuestion}
            onEditQuestion={handleEditQuestion}
            onBack={() => navigate('/')} // Back to Funnel Dashboard
          />
        );
      case 'questionForm':
        const questionToEdit = selectedQuestionIndex !== null ? questions[selectedQuestionIndex] : undefined;
        return (
          <QuestionFormComponent
            question={questionToEdit}
            questionIndex={selectedQuestionIndex}
            onSave={handleQuestionFormSave}
            onCancel={handleQuestionFormCancel}
            onDelete={handleDeleteQuestion}
          />
        );
      case 'linkSettings':
        return (
          <LinkSettingsComponent
            finalRedirectLink={finalRedirectLink}
            setFinalRedirectLink={setFinalRedirectLink}
            tracking={tracking}
            setTracking={setTracking}
            conversionGoal={conversionGoal}
            setConversionGoal={setConversionGoal}
            onBack={() => setCurrentSubView('quizEditorList')}
          />
        );
      case 'colorCustomizer':
        return (
          <ColorCustomizerComponent onBack={() => setCurrentSubView('quizEditorList')} />
        );
      default:
        return (
          <div className="dashboard-container">
            <h2><span role="img" aria-label="funnel">🥞</span> {funnelName} Editor</h2>
            <p>Manage components for this funnel.</p>

            <div className="dashboard-card" onClick={() => setCurrentSubView('quizEditorList')}>
              <h3><span role="img" aria-label="quiz">📝</span> Interactive Quiz Builder</h3>
              <p>Manage quiz questions for this funnel.</p>
            </div>

            <div className="dashboard-card" onClick={() => setCurrentSubView('linkSettings')}>
              <h3><span role="img" aria-label="link">🔗</span> Final Redirect Link Settings</h3>
              <p>Configure the custom link where users will be redirected.</p>
            </div>

            <div className="dashboard-card" onClick={() => setCurrentSubView('colorCustomizer')}>
              <h3><span role="img" aria-label="palette">🎨</span> Color Customization</h3>
              <p>Customize theme colors for this funnel (not yet implemented).</p>
            </div>

            <button className="back-button" onClick={() => navigate('/')}>
              <span role="img" aria-label="back">←</span> Back to All Funnels
            </button>
          </div>
        );
    }
  };

  return (
    <div className="App">
      {renderEditorContent()}
    </div>
  );
};


// --- QuizPlayer Component (for playing the quiz) ---
interface QuizPlayerProps {
  db: Firestore;
}

const QuizPlayer: React.FC<QuizPlayerProps> = ({ db }) => {
  const { funnelId } = useParams<{ funnelId: string }>();
  const navigate = useNavigate();

  const [funnelData, setFunnelData] = useState<FunnelData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Load specific funnel data for playing
  useEffect(() => {
    const getFunnelForPlay = async () => {
      if (!funnelId) {
        alert('No funnel ID provided!');
        navigate('/');
        return;
      }
      try {
        const funnelDocRef = doc(db, 'funnels', funnelId);
        const funnelDoc = await getDoc(funnelDocRef);
        if (funnelDoc.exists()) {
          const funnel = funnelDoc.data() as Funnel;
          setFunnelData(funnel.data);
        } else {
          alert('Funnel not found! Please check the link.');
          navigate('/');
        }
      } catch (error) {
        console.error("Error loading funnel for play:", error);
        alert("Failed to load quiz. Check console for details.");
        navigate('/');
      }
    };
    getFunnelForPlay();
  }, [funnelId, db, navigate]);

  const handleAnswerClick = (answerIndex: number) => {
    if (!funnelData || funnelData.questions.length === 0) return;

    // Check if it's the last question (index 5 for 6 questions total) AND we have exactly 6 questions
    if (currentQuestionIndex === 5 && funnelData.questions.length === 6) {
      const redirectLink = funnelData.finalRedirectLink || "https://example.com/default-final-redirect-link";

      console.log("Quiz complete! Redirecting to:", redirectLink);
      alert('Quiz complete! Redirecting you to your personalized offer.');
      window.location.href = redirectLink;
      return;
    }

    // Move to the next question if not the last
    if (currentQuestionIndex < funnelData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // This path is hit if quiz has < 6 questions and it's the last one,
      // or if it's the 6th question but somehow the above condition was not met (shouldn't happen with proper setup)
      alert('Quiz complete! No more questions. Returning to home.');
      navigate('/'); // Go back to dashboard after completion
    }
  };

  if (!funnelData) {
    return (
      <div className="quiz-player-container">
        <h2>Loading Quiz...</h2>
        <p>Please wait while your quiz loads.</p>
      </div>
    );
  }

  if (funnelData.questions.length === 0 || funnelData.questions.length < 6) {
    return (
      <div className="quiz-player-container">
        <h2>Quiz Not Ready</h2>
        <p>This funnel either has no questions or fewer than the required 6 questions. Please contact the funnel creator.</p>
        <button className="back-button" onClick={() => navigate('/')}>
          <span role="img" aria-label="back">←</span> Back to Home
        </button>
      </div>
    );
  }

  const currentQuestion = funnelData.questions[currentQuestionIndex];

  return (
    <div className="quiz-player-container">
      <h2><span role="img" aria-label="quiz">❓</span> Quiz Time!</h2>
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${((currentQuestionIndex + 1) / funnelData.questions.length) * 100}%` }}></div>
      </div>
      <p className="question-counter">Question {currentQuestionIndex + 1} / {funnelData.questions.length}</p>

      <h3 className="quiz-question-title">{currentQuestion.title}</h3>

      <div className="quiz-answers-container">
        {currentQuestion.answers.map((answer) => (
          <button key={answer.id} className="quiz-answer-button" onClick={() => handleAnswerClick(currentQuestion.answers.indexOf(answer))}>
            {answer.text}
          </button>
        ))}
      </div>
    </div>
  );
};


// --- Re-usable UI Components (extracted from App for clarity) ---

interface QuizEditorComponentProps {
  questions: Question[];
  onAddQuestion: () => void;
  onEditQuestion: (index: number) => void;
  onBack: () => void;
}

const QuizEditorComponent: React.FC<QuizEditorComponentProps> = ({ questions, onAddQuestion, onEditQuestion, onBack }) => {
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
        <span role="img" aria-label="back">←</span> Back to Funnel Dashboard
      </button>
    </div>
  );
};

interface QuestionFormComponentProps {
  question?: Question;
  questionIndex: number | null;
  onSave: (question: Question) => void;
  onCancel: () => void;
  onDelete: () => void;
}

const QuestionFormComponent: React.FC<QuestionFormComponentProps> = ({ question, questionIndex, onSave, onCancel, onDelete }) => {
  const [title, setTitle] = useState(question ? question.title : '');
  const [answers, setAnswers] = useState<Answer[]>(
    question && question.answers.length > 0
      ? question.answers
      : Array(4).fill(null).map((_, i) => ({ id: `option-${Date.now()}-${i}`, text: `Option ${String.fromCharCode(65 + i)}` }))
  );

  useEffect(() => {
    setTitle(question ? question.title : '');
    setAnswers(
      question && question.answers.length > 0
        ? question.answers
        : Array(4).fill(null).map((_, i) => ({ id: `option-${Date.now()}-${i}`, text: `Option ${String.fromCharCode(65 + i)}` }))
    );
  }, [question]);

  const handleAnswerTextChange = (index: number, value: string) => {
    const updatedAnswers = [...answers];
    if (!updatedAnswers[index]) {
      updatedAnswers[index] = { id: `option-${Date.now()}-${index}`, text: '' };
    }
    updatedAnswers[index].text = value;
    setAnswers(updatedAnswers);
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Question title cannot be empty!');
      return;
    }
    const filteredAnswers = answers.filter(ans => ans.text.trim() !== '');
    if (filteredAnswers.length === 0) {
        alert('Please provide at least one answer option.');
        return;
    }

    onSave({
      id: question?.id || Date.now().toString(),
      title,
      type: 'single-choice',
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
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="answer-input-group">
            <input
              type="text"
              value={answers[index]?.text || ''}
              onChange={(e) => handleAnswerTextChange(index, e.target.value)}
              placeholder={`Option ${String.fromCharCode(65 + index)}`}
            />
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


interface LinkSettingsComponentProps {
    finalRedirectLink: string;
    setFinalRedirectLink: React.Dispatch<React.SetStateAction<string>>;
    tracking: string;
    setTracking: React.Dispatch<React.SetStateAction<string>>;
    conversionGoal: string;
    setConversionGoal: React.Dispatch<React.SetStateAction<string>>;
    onBack: () => void;
}

const LinkSettingsComponent: React.FC<LinkSettingsComponentProps> = ({
    finalRedirectLink, setFinalRedirectLink,
    tracking, setTracking,
    conversionGoal, setConversionGoal,
    onBack
}) => {
    // These states are managed by the parent FunnelEditor and passed down
    // No local save button needed here as changes propagate up and are auto-saved
    return (
        <div className="link-settings-container">
            <h2><span role="img" aria-label="link">🔗</span> Final Redirect Link Settings</h2>
            <p>This is the custom link where users will be redirected after completing the quiz.</p>
            <div className="form-group">
                <label>Custom Final Redirect Link:</label>
                <input
                    type="text"
                    value={finalRedirectLink}
                    onChange={(e) => setFinalRedirectLink(e.target.value)}
                    placeholder="https://your-custom-product-page.com"
                />
            </div>
            <div className="form-group">
                <label>Optional: Tracking Parameters:</label>
                <input
                    type="text"
                    value={tracking}
                    onChange={(e) => setTracking(e.target.value)}
                    placeholder="utm_source=funnel&utm_campaign=..."
                />
            </div>
            <div className="form-group">
                <label>Conversion Goal:</label>
                <select value={conversionGoal} onChange={(e) => setConversionGoal(e.target.value)}>
                    <option>Product Purchase</option>
                    <option>Email Subscription</option>
                    <option>Free Trial</option>
                </select>
            </div>
            <div className="form-actions">
                <button className="save-button" onClick={() => alert('Settings applied! (Auto-saved)')}>
                    <span role="img" aria-label="save">💾</span> Applied
                </button>
                <button className="cancel-button" onClick={onBack}>
                    <span role="img" aria-label="back">←</span> Back to Editor
                </button>
            </div>
        </div>
    );
};

interface ColorCustomizerComponentProps {
    onBack: () => void;
}

const ColorCustomizerComponent: React.FC<ColorCustomizerComponentProps> = ({ onBack }) => {
    return (
        <div className="color-customizer-container">
            <h2><span role="img" aria-label="palette">🎨</span> Color Customization</h2>
            <p>Color customization for this specific funnel. (Functionality to apply not yet implemented)</p>
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
