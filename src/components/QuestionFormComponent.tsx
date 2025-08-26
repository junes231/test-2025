// src/components/QuestionFormComponent.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Answer {
  id: string;
  text: string;
}

interface Question {
  id: string;
  title: string;
  type: string;
  answers: Answer[];
}

interface QuestionFormComponentProps {
  question?: Question;
  questionIndex: number | null;
  onSave: (question: Question) => void;
  onCancel: () => void;
  onDelete: () => void;
  maxQuestions: number;
  currentQuestionCount: number;
}

const QuestionFormComponent: React.FC<QuestionFormComponentProps> = ({
  question,
  questionIndex,
  onSave,
  onCancel,
  onDelete,
  maxQuestions,
  currentQuestionCount,
}) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState(question ? question.title : "");
  const [answers, setAnswers] = useState<Answer[]>(
    question && question.answers.length > 0
      ? question.answers
      : Array(4).fill(null).map((_, i) => ({
          id: `option-${Date.now()}-${i}`,
          text: `Option ${String.fromCharCode(65 + i)}`,
        }))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setTitle(question ? question.title : "");
    setAnswers(
      question && question.answers.length > 0
        ? question.answers
        : Array(4).fill(null).map((_, i) => ({
            id: `option-${Date.now()}-${i}`,
            text: `Option ${String.fromCharCode(65 + i)}`,
          }))
    );
  }, [question]);

  const handleAnswerTextChange = (index: number, value: string) => {
    const updatedAnswers = [...answers];
    if (!updatedAnswers[index]) {
      updatedAnswers[index] = { id: `option-${Date.now()}-${index}`, text: "" };
    }
    updatedAnswers[index].text = value;
    setAnswers(updatedAnswers);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const filteredAnswers = answers.filter((ans) => ans.text.trim() !== "");
      if (!title.trim()) {
        console.error("Question title cannot be empty!");
        return;
      }
      if (filteredAnswers.length === 0) {
        console.error("Please provide at least one answer option!");
        return;
      }
      const savedQuestion = {
        id: question?.id || Date.now().toString(),
        title,
        type: "single-choice",
        answers: filteredAnswers,
      };
      await new Promise((resolve) => setTimeout(resolve, 3000)); // 3秒动画
      onSave(savedQuestion);
      navigate(-1); // 返回上页
    } catch (error) {
      console.error("Error saving question:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    const button = document.querySelector('.cancel-button');
    if (button) {
      button.classList.add('animate-out');
      setTimeout(() => {
        onCancel(); // 调用父组件的取消逻辑
        navigate('/funnel'); // 返回漏斗页面
      }, 3000); // 3秒动画
    }
  };

  const handleDelete = () => {
    const button = document.querySelector('.delete-button');
    if (button && question && question.id) {
      button.classList.add('animate-out');
      setTimeout(() => {
        onDelete(); // 调用删除逻辑
        setIsDeleting(true); // 隐藏按钮
        navigate(-1); // 返回上页
      }, 3000); // 3秒动画
    } else {
      console.error("Question ID is missing!");
    }
  };

  return (
    <div className="question-form-container">
      <h2>
        <span role="img" aria-label="edit">📝</span> Quiz Question Editor
      </h2>
      <p className="question-index-display">
        {questionIndex !== null
          ? `Editing Question ${questionIndex + 1} of ${maxQuestions}`
          : 'Adding New Question'}
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
        <select value="single-choice" onChange={() => {}} disabled>
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
        <button className="save-button" onClick={handleSave} disabled={isSaving}>
          <span role="img" aria-label="save">💾</span> Save Question
        </button>
        <button className="cancel-button" onClick={handleCancel}>
          <span role="img" aria-label="cancel">←</span> Back to List
        </button>
        {questionIndex !== null && !isDeleting && (
          <button className="delete-button" onClick={handleDelete}>
            <span role="img" aria-label="delete">🗑️</span> Delete Question
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionFormComponent;
