import React, { useState } from "react";

type Answer = {
  id: string;
  text: string;
};

type Question = {
  id: string;
  title: string;
  type: string;
  answers: Answer[];
};

type QuestionFormComponentProps = {
  question?: Question;
  questionIndex?: number | null;
  onSave: (q: Question) => void;
  onCancel: () => void;
  onDelete: () => void;
};

const QuestionFormComponent: React.FC<QuestionFormComponentProps> = ({
  question,
  questionIndex,
  onSave,
  onCancel,
  onDelete,
}) => {
  const [title, setTitle] = useState(question?.title || "");
  const [answers, setAnswers] = useState<Answer[]>(
    question?.answers && question.answers.length > 0
      ? question.answers
      : Array(4)
          .fill(null)
          .map((_, idx) => ({
            id: `option-${Date.now()}-${idx}`,
            text: "",
          }))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
        alert("Question title cannot be empty!");
        setIsSaving(false);
        return;
      }
      if (filteredAnswers.length === 0) {
        alert("Please provide at least one answer option.");
        setIsSaving(false);
        return;
      }
      // 模拟保存
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onSave({
        id: question?.id || Date.now().toString(),
        title: title,
        type: "single-choice",
        answers: filteredAnswers,
      });
    } catch (error) {
      alert("Error saving question!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this question? This action cannot be undone."
      )
    ) {
      setIsDeleting(true);
      try {
        // 可添加删除前的处理逻辑
        await new Promise((resolve) => setTimeout(resolve, 1000));
        onDelete();
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="question-form-container">
      <h2>
        <span role="img" aria-label="edit">
          📝
        </span>{" "}
        Quiz Question Editor
      </h2>
      <p className="question-index-display">
        {questionIndex !== null && questionIndex !== undefined
          ? `Editing Question ${questionIndex + 1} of 6`
          : "Adding New Question"}
      </p>
      <div className="form-group">
        <label>Question Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., What's your biggest health concern?"
          disabled={isSaving || isDeleting}
        />
      </div>
      <div className="form-group">
        <label>Question Type:</label>
        <select value="single-choice" onChange={() => {}} disabled>
          <option>Single Choice</option>
          <option disabled>Multiple Choice (Coming Soon)</option>
          <option disabled>Text Input (Coming Soon)</option>
        </select>
      </div>
      <div className="answer-options-section">
        <p>Answer Options (Max 4):</p>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={answers[index]?.id || index} className="answer-input-group">
            <input
              type="text"
              value={answers[index]?.text || ""}
              onChange={(e) => handleAnswerTextChange(index, e.target.value)}
              placeholder={`Option ${String.fromCharCode(65 + index)}`}
              disabled={isSaving || isDeleting}
            />
          </div>
        ))}
      </div>
      <div className="form-actions">
        <button
          className="save-button"
          onClick={handleSave}
          disabled={isSaving || isDeleting}
        >
          <span role="img" aria-label="save">
            💾
          </span>{" "}
          {isSaving ? "Saving..." : "Save Question"}
        </button>
        <button
          className="cancel-button"
          onClick={onCancel}
          disabled={isSaving || isDeleting}
        >
          <span role="img" aria-label="cancel">
            ←
          </span>{" "}
          Back to List
        </button>
        {questionIndex !== null && questionIndex !== undefined && (
          <button
            className="delete-button"
            onClick={handleDelete}
            disabled={isSaving || isDeleting}
          >
            <span role="img" aria-label="delete">
              🗑️
            </span>{" "}
            {isDeleting ? "Deleting..." : "Delete Question"}
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionFormComponent;
