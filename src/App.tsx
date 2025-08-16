import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Routes, Route, useParams } from 'react-router-dom';
import { collection, getDocs, updateDoc, doc, addDoc, query, where, getDoc, deleteDoc, deleteField } from 'firebase/firestore';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { db, auth } from './index'; // 从 index.tsx 导入
import './App.css';

// 其余代码（FunnelDashboard, FunnelEditor, QuizEditorComponent 等）保持不变

// Firebase 配置

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
  primaryColor: string;
  buttonColor: string;
  backgroundColor: string;
  textColor: string;
}

interface Funnel {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  data: FunnelData;
}

const defaultFunnelData: FunnelData = {
  questions: [],
  finalRedirectLink: '',
  tracking: '',
  conversionGoal: 'Product Purchase',
  primaryColor: '#007bff',
  buttonColor: '#28a745',
  backgroundColor: '#f8f9fa',
  textColor: '#333333',
};

interface QuizEditorComponentProps {
  questions: Question[];
  onAddQuestion: () => void;
  onEditQuestion: (index: number) => void;
  onBack: () => void;
  onImportQuestions: (importedQuestions: Question[]) => void;
}

const QuizEditorComponent: React.FC<QuizEditorComponentProps> = ({ questions, onAddQuestion, onEditQuestion, onBack, onImportQuestions }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      alert('未选择文件。');
      return;
    }
    if (file.type !== 'application/json') {
      alert('请选择JSON文件。');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData: Question[] = JSON.parse(content);

        if (!Array.isArray(parsedData)) {
          alert('无效的JSON格式，预期为问题数组。');
          return;
        }

        const isValid = parsedData.every(
          (q) =>
            q.title &&
            typeof q.title === 'string' &&
            q.title.trim() !== '' &&
            Array.isArray(q.answers) &&
            q.answers.length > 0 &&
            q.answers.every((a) => a.text && typeof a.text === 'string' && a.text.trim() !== '')
        );

        if (!isValid) {
          alert('无效的JSON格式，请确保为问题数组，每个问题包含“title”和“answers”数组，且答案包含“text”字段。');
          return;
        }

        const questionsWithNewIds = parsedData.map((q) => ({
          ...q,
          id: Date.now().toString() + Math.random().toString(),
          type: q.type || 'single-choice',
          answers: q.answers.map((a) => ({
            ...a,
            id: a.id || Date.now().toString() + Math.random().toString(),
          })),
        }));

        onImportQuestions(questionsWithNewIds);
      } catch (err) {
        console.error('解析JSON文件错误:', err);
        alert('读取或解析JSON文件错误，请检查文件格式。');
      }
    };
    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="quiz-editor-container">
      <h2>
        <span role="img" aria-label="quiz">📝</span> 测验问题列表
      </h2>
      <div className="quiz-editor-actions">
        <button className="add-button" onClick={onAddQuestion}>
          <span role="img" aria-label="add">➕</span> 添加新问题
        </button>
        <button className="import-button" onClick={triggerFileInput}>
          <span role="img" aria-label="import">📥</span> 导入问题
        </button>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" style={{ display: 'none' }} />
      </div>

      {questions.length === 0 ? (
        <p className="no-questions-message">尚未添加问题，点击“添加新问题”或“导入问题”开始！</p>
      ) : (
        <ul className="question-list">
          {questions.map((q, index) => (
            <li key={q.id} className="question-item" onClick={() => onEditQuestion(index)}>
              问题 {index + 1}: {q.title}
            </li>
          ))}
        </ul>
      )}

      <button className="back-button" onClick={onBack}>
        <span role="img" aria-label="back">←</span> 返回漏斗仪表板
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
      : Array(4)
          .fill(null)
          .map((_, i) => ({ id: `option-${Date.now()}-${i}`, text: `选项 ${String.fromCharCode(65 + i)}` }))
  );

  useEffect(() => {
    setTitle(question ? question.title : '');
    setAnswers(
      question && question.answers.length > 0
        ? question.answers
        : Array(4)
            .fill(null)
            .map((_, i) => ({ id: `option-${Date.now()}-${i}`, text: `选项 ${String.fromCharCode(65 + i)}` }))
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
      alert('问题标题不能为空！');
      return;
    }
    const filteredAnswers = answers.filter((ans) => ans.text.trim() !== '');
    if (filteredAnswers.length === 0) {
      alert('请至少提供一个答案选项。');
      return;
    }

    onSave({
      id: question?.id || Date.now().toString(),
      title: title,
      type: 'single-choice',
      answers: filteredAnswers,
    });
  };

  return (
    <div className="question-form-container">
      <h2>
        <span role="img" aria-label="edit">📝</span> 测验问题编辑器
      </h2>
      <p className="question-index-display">
        {questionIndex !== null ? `编辑问题 ${questionIndex + 1}/6` : '添加新问题'}
      </p>
      <div className="form-group">
        <label>问题标题:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例如，您的最大健康问题是？"
        />
      </div>
      <div className="form-group">
        <label>问题类型:</label>
        <select value="single-choice" onChange={() => {}} disabled>
          <option>单选</option>
          <option>多选（即将推出）</option>
          <option>文本输入（即将推出）</option>
        </select>
      </div>
      <div className="answer-options-section">
        <p>答案选项（最多4个）:</p>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="answer-input-group">
            <input
              type="text"
              value={answers[index]?.text || ''}
              onChange={(e) => handleAnswerTextChange(index, e.target.value)}
              placeholder={`选项 ${String.fromCharCode(65 + index)}`}
            />
          </div>
        ))}
      </div>
      <div className="form-actions">
        <button className="save-button" onClick={handleSave}>
          <span role="img" aria-label="save">💾</span> 保存问题
        </button>
        <button className="cancel-button" onClick={onCancel}>
          <span role="img" aria-label="cancel">←</span> 返回列表
        </button>
        {questionIndex !== null && (
          <button className="delete-button" onClick={onDelete}>
            <span role="img" aria-label="delete">🗑️</span> 删除问题
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
  finalRedirectLink,
  setFinalRedirectLink,
  tracking,
  setTracking,
  conversionGoal,
  setConversionGoal,
  onBack,
}) => {
  return (
    <div className="link-settings-container">
      <h2>
        <span role="img" aria-label="link">🔗</span> 最终重定向链接设置
      </h2>
      <p>这是用户完成测验后将被重定向到的自定义链接。</p>
      <div className="form-group">
        <label>自定义最终重定向链接:</label>
        <input
          type="text"
          value={finalRedirectLink}
          onChange={(e) => setFinalRedirectLink(e.target.value)}
          placeholder="https://your-custom-product-page.com"
        />
      </div>
      <div className="form-group">
        <label>可选：跟踪参数:</label>
        <input
          type="text"
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          placeholder="utm_source=funnel&utm_campaign=..."
        />
      </div>
      <div className="form-group">
        <label>转化目标:</label>
        <select value={conversionGoal} onChange={(e) => setConversionGoal(e.target.value)}>
          <option>产品购买</option>
          <option>电子邮件订阅</option>
          <option>免费试用</option>
        </select>
      </div>
      <div className="form-actions">
        <button className="save-button" onClick={() => alert('设置已应用！（自动保存）')}>
          <span role="img" aria-label="save">💾</span> 已应用
        </button>
        <button className="cancel-button" onClick={onBack}>
          <span role="img" aria-label="back">←</span> 返回编辑器
        </button>
      </div>
    </div>
  );
};

interface ColorCustomizerComponentProps {
  primaryColor: string;
  setPrimaryColor: React.Dispatch<React.SetStateAction<string>>;
  buttonColor: string;
  setButtonColor: React.Dispatch<React.SetStateAction<string>>;
  backgroundColor: string;
  setBackgroundColor: React.Dispatch<React.SetStateAction<string>>;
  textColor: string;
  setTextColor: React.Dispatch<React.SetStateAction<string>>;
  onBack: () => void;
}

const ColorCustomizerComponent: React.FC<ColorCustomizerComponentProps> = ({
  primaryColor,
  setPrimaryColor,
  buttonColor,
  setButtonColor,
  backgroundColor,
  setBackgroundColor,
  textColor,
  setTextColor,
  onBack,
}) => {
  return (
    <div className="color-customizer-container">
      <h2>
        <span role="img" aria-label="palette">🎨</span> 颜色定制
      </h2>
      <p>为此漏斗自定义主题颜色。（更改自动保存）</p>
      <div className="form-group">
        <label>主要颜色:</label>
        <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
      </div>
      <div className="form-group">
        <label>按钮颜色:</label>
        <input type="color" value={buttonColor} onChange={(e) => setButtonColor(e.target.value)} />
      </div>
      <div className="form-group">
        <label>背景颜色:</label>
        <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} />
      </div>
      <div className="form-group">
        <label>文本颜色:</label>
        <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} />
      </div>
      <div className="form-actions">
        <button className="save-button" onClick={() => alert('颜色设置已应用！（自动保存）')}>
          <span role="img" aria-label="save">💾</span> 已应用
        </button>
        <button className="cancel-button" onClick={onBack}>
          <span role="img" aria-label="back">←</span> 返回编辑器
        </button>
      </div>
    </div>
  );
};

interface FunnelDashboardProps {
  db: Firestore;
  funnels: Funnel[];
  setFunnels: React.Dispatch<React.SetStateAction<Funnel[]>>;
  createFunnel: (name: string) => Promise<void>;
  deleteFunnel: (funnelId: string) => Promise<void>;
}

const FunnelDashboard: React.FC<FunnelDashboardProps> = ({ db, funnels, setFunnels, createFunnel, deleteFunnel }) => {
  const [newFunnelName, setNewFunnelName] = useState('');
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUid(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchFunnels = async () => {
      if (!db || !uid) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const funnelsCollectionRef = collection(db, 'funnels');
        const q = query(funnelsCollectionRef, where('ownerId', '==', uid));
        const data = await getDocs(q);
        const loadedFunnels = data.docs.map((doc) => {
          const docData = doc.data() as Partial<Funnel>;
          return {
            ...(docData as Funnel),
            id: doc.id,
            ownerId: docData.ownerId || uid,
            data: { ...defaultFunnelData, ...docData.data },
            createdAt: docData.createdAt ? new Date(docData.createdAt) : new Date(),
          };
        });
        setFunnels(loadedFunnels);
        setError(null);
      } catch (err: any) {
        console.error('读取漏斗失败:', err);
        let errorMessage = '无法加载漏斗。';
        if (err.code === 'permission-denied') {
          errorMessage = '权限错误：请检查Firestore规则或登录状态。';
        } else if (err.message?.includes('index')) {
          errorMessage = '查询需要索引，请在Firebase控制台创建索引。';
        } else if (err.message) {
          errorMessage = `无法加载漏斗: ${err.message}`;
        }
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFunnels();
  }, [db, uid, setFunnels]);

  const handleCopyLink = (funnelId: string) => {
    const url = `${window.location.origin}/funnel-editor/#/play/${funnelId}`;
    navigator.clipboard.writeText(url);
    alert('漏斗链接已复制到剪贴板！');
  };

  const handleCreateFunnel = async () => {
    if (!newFunnelName.trim()) {
      alert('请输入漏斗名称。');
      return;
    }
    setIsLoading(true);
    try {
      await createFunnel(newFunnelName);
      setNewFunnelName('');
    } catch (err) {
      setError('创建漏斗失败，请重试。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFunnel = async (funnelId: string) => {
    setIsLoading(true);
    try {
      await deleteFunnel(funnelId);
    } catch (err) {
      setError('删除漏斗失败，请重试。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <h2>
        <span role="img" aria-label="funnel">🥞</span> 你的漏斗
      </h2>
      <div className="create-funnel-section">
        <input
          type="text"
          placeholder="新漏斗名称"
          value={newFunnelName}
          onChange={(e) => setNewFunnelName(e.target.value)}
          className="funnel-name-input"
        />
        <button className="add-button" onClick={handleCreateFunnel} disabled={isLoading}>
          <span role="img" aria-label="add">➕</span> 创建新漏斗
        </button>
      </div>

      {isLoading ? (
        <p className="loading-message">正在加载漏斗...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : funnels.length === 0 ? (
        <p className="no-funnels-message">尚未创建漏斗，开始创建一个吧！</p>
      ) : (
        <ul className="funnel-list">
          {funnels.map((funnel) => (
            <li key={funnel.id} className="funnel-item">
              <span>{funnel.name}</span>
              <div className="funnel-actions">
                <button className="button-link" onClick={() => navigate(`/edit/${funnel.id}`)}>
                  编辑
                </button>
                <button className="button-link" onClick={() => navigate(`/play/${funnel.id}`)}>
                  预览
                </button>
                <button className="button-link" onClick={() => handleCopyLink(funnel.id)}>
                  复制链接
                </button>
                <button className="button-link delete-button" onClick={() => handleDeleteFunnel(funnel.id)}>
                  删除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

interface FunnelEditorProps {
  db: Firestore;
  updateFunnelData: (funnelId: string, newData: FunnelData) => Promise<void>;
}

const FunnelEditor: React.FC<FunnelEditorProps> = ({ db, updateFunnelData }) => {
  const { funnelId } = useParams<{ funnelId: string }>();
  const navigate = useNavigate();
  const [uid, setUid] = useState<string | null>(null);
  const [funnelName, setFunnelName] = useState('Loading...');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [finalRedirectLink, setFinalRedirectLink] = useState('');
  const [tracking, setTracking] = useState('');
  const [conversionGoal, setConversionGoal] = useState('Product Purchase');
  const [primaryColor, setPrimaryColor] = useState(defaultFunnelData.primaryColor);
  const [buttonColor, setButtonColor] = useState(defaultFunnelData.buttonColor);
  const [backgroundColor, setBackgroundColor] = useState(defaultFunnelData.backgroundColor);
  const [textColor, setTextColor] = useState(defaultFunnelData.textColor);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);
  const [currentSubView, setCurrentSubView] = useState('mainEditorDashboard');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUid(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const getFunnel = async () => {
      if (!funnelId || !uid) {
        setError('请先登录或提供有效的漏斗ID');
        return;
      }

      try {
        const funnelDocRef = doc(db, 'funnels', funnelId);
        const funnelDoc = await getDoc(funnelDocRef);
        if (funnelDoc.exists()) {
          const funnel = funnelDoc.data() as Funnel;
          if (funnel.ownerId !== uid) {
            setError('权限错误：你无权访问此漏斗');
            navigate('/');
            return;
          }
          setFunnelName(funnel.name);
          setQuestions(funnel.data.questions || []);
          setFinalRedirectLink(funnel.data.finalRedirectLink || '');
          setTracking(funnel.data.tracking || '');
          setConversionGoal(funnel.data.conversionGoal || 'Product Purchase');
          setPrimaryColor(funnel.data.primaryColor || defaultFunnelData.primaryColor);
          setButtonColor(funnel.data.buttonColor || defaultFunnelData.buttonColor);
          setBackgroundColor(funnel.data.backgroundColor || defaultFunnelData.backgroundColor);
          setTextColor(funnel.data.textColor || defaultFunnelData.textColor);
          setError(null);
          setIsDataLoaded(true);
        } else {
          setError('漏斗不存在！');
          navigate('/');
        }
      } catch (err: any) {
        console.error('读取漏斗失败:', err);
        if (err.code === 'permission-denied') {
          setError('权限错误：无法访问此漏斗');
        } else {
          setError(`读取漏斗失败: ${err.message}`);
        }
        navigate('/');
      }
    };

    getFunnel();
  }, [funnelId, db, uid, navigate]);

  const saveFunnelToFirestore = useCallback(() => {
    if (!funnelId || !uid) return;
    const newData: FunnelData = {
      questions,
      finalRedirectLink,
      tracking,
      conversionGoal,
      primaryColor,
      buttonColor,
      backgroundColor,
      textColor,
    };
    updateFunnelData(funnelId, newData);
  }, [
    funnelId,
    questions,
    finalRedirectLink,
    tracking,
    conversionGoal,
    primaryColor,
    buttonColor,
    backgroundColor,
    textColor,
    updateFunnelData,
  ]);

  const handleAddQuestion = () => {
    if (questions.length >= 6) {
      alert('此测验最多只能有6个问题。');
      return;
    }
    const newQuestion: Question = {
      id: Date.now().toString(),
      title: `新问题 ${questions.length + 1}`,
      type: 'single-choice',
      answers: Array(4)
        .fill(null)
        .map((_, i) => ({ id: `option-${Date.now()}-${i}`, text: `选项 ${String.fromCharCode(65 + i)}` })),
    };
    setQuestions([...questions, newQuestion]);
    setSelectedQuestionIndex(questions.length);
    setCurrentSubView('questionForm');
  };

  const handleEditQuestion = (index: number) => {
    setSelectedQuestionIndex(index);
    setCurrentSubView('questionForm');
  };

  const handleDeleteQuestion = () => {
    if (selectedQuestionIndex !== null && window.confirm('确定要删除此问题吗？')) {
      const updatedQuestions = questions.filter((_, i) => i !== selectedQuestionIndex);
      setQuestions(updatedQuestions);
      setSelectedQuestionIndex(null);
      setCurrentSubView('quizEditorList');
    }
  };

  const handleImportQuestions = (importedQuestions: Question[]) => {
    if (questions.length + importedQuestions.length > 6) {
      alert(
        `无法导入。此漏斗已有 ${questions.length} 个问题，再导入 ${importedQuestions.length} 个将超过6个问题的限制。`
      );
      return;
    }
    const validImportedQuestions = importedQuestions.filter(
      (q) =>
        q.title &&
        typeof q.title === 'string' &&
        q.title.trim() !== '' &&
        Array.isArray(q.answers) &&
        q.answers.length > 0 &&
        q.answers.every((a) => a.text && typeof a.text === 'string' && a.text.trim() !== '')
    );

    if (validImportedQuestions.length === 0) {
      alert('导入文件中没有有效问题。请检查文件格式（需要标题和答案文本）。');
      return;
    }

    setQuestions((prevQuestions) => [...prevQuestions, ...validImportedQuestions]);
    alert(`成功导入 ${validImportedQuestions.length} 个问题！`);
  };

  const renderEditorContent = () => {
    switch (currentSubView) {
      case 'quizEditorList':
        return (
          <QuizEditorComponent
            questions={questions}
            onAddQuestion={handleAddQuestion}
            onEditQuestion={handleEditQuestion}
            onBack={() => setCurrentSubView('mainEditorDashboard')}
            onImportQuestions={handleImportQuestions}
          />
        );
      case 'questionForm':
        const questionToEdit = selectedQuestionIndex !== null ? questions[selectedQuestionIndex] : undefined;
        return (
          <QuestionFormComponent
            question={questionToEdit}
            questionIndex={selectedQuestionIndex}
            onSave={(q) => {
              setQuestions((prev) => {
                if (selectedQuestionIndex === null) return prev;
                const next = [...prev];
                next[selectedQuestionIndex] = q;
                return next;
              });
              setSelectedQuestionIndex(null);
              setCurrentSubView('quizEditorList');
            }}
            onCancel={handleDeleteQuestion}
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
            onBack={() => setCurrentSubView('mainEditorDashboard')}
          />
        );
      case 'colorCustomizer':
        return (
          <ColorCustomizerComponent
            primaryColor={primaryColor}
            setPrimaryColor={setPrimaryColor}
            buttonColor={buttonColor}
            setButtonColor={setButtonColor}
            backgroundColor={backgroundColor}
            setBackgroundColor={setBackgroundColor}
            textColor={textColor}
            setTextColor={setTextColor}
            onBack={() => setCurrentSubView('mainEditorDashboard')}
          />
        );
      default:
        return (
          <div className="dashboard-container">
            <h2>
              <span role="img" aria-label="funnel">🥞</span> {funnelName} 编辑器
            </h2>
            <p>管理此漏斗的组件。</p>
            <div className="dashboard-card" onClick={() => setCurrentSubView('quizEditorList')}>
              <h3>
                <span role="img" aria-label="quiz">📝</span> 互动测验构建器
              </h3>
              <p>管理此漏斗的测验问题。</p>
            </div>
            <div className="dashboard-card" onClick={() => setCurrentSubView('linkSettings')}>
              <h3>
                <span role="img" aria-label="link">🔗</span> 最终重定向链接设置
              </h3>
              <p>配置用户将被重定向到的自定义链接。</p>
            </div>
            <div className="dashboard-card" onClick={() => setCurrentSubView('colorCustomizer')}>
              <h3>
                <span role="img" aria-label="palette">🎨</span> 颜色定制
              </h3>
              <p>为此漏斗自定义主题颜色。</p>
            </div>
            <button className="back-button" onClick={() => navigate('/')}>
              <span role="img" aria-label="back">←</span> 返回所有漏斗
            </button>
            <div style={{ marginTop: '20px', padding: '10px', border: '1px dashed #ccc', fontSize: '0.8em', wordBreak: 'break-all', textAlign: 'left' }}>
              <strong>DEBUG:</strong> {finalRedirectLink || 'Empty'}
            </div>
          </div>
        );
    }
  };

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (!isDataLoaded) {
    return <p>正在加载漏斗...</p>;
  }

  return <div className="App">{renderEditorContent()}</div>;
};

interface QuizPlayerProps {
  db: Firestore;
}

const QuizPlayer: React.FC<QuizPlayerProps> = ({ db }) => {
  const { funnelId } = useParams<{ funnelId: string }>();
  const navigate = useNavigate();
  const [funnelData, setFunnelData] = useState<FunnelData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [clickedAnswerIndex, setClickedAnswerIndex] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getFunnelForPlay = async () => {
      if (!funnelId) {
        setError('未提供漏斗ID！');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const funnelDocRef = doc(db, 'funnels', funnelId);
        const funnelDoc = await getDoc(funnelDocRef);
        if (funnelDoc.exists()) {
          const funnel = funnelDoc.data() as Funnel;
          setFunnelData({ ...defaultFunnelData, ...funnel.data });
          console.log('QuizPlayer: 加载漏斗数据:', funnel.data);
        } else {
          setError('漏斗不存在！请检查链接或联系漏斗创建者。');
        }
      } catch (err: any) {
        console.error('加载漏斗失败:', err);
        setError('无法加载测验，请检查网络连接和Firebase规则。');
      } finally {
        setIsLoading(false);
      }
    };
    getFunnelForPlay();
  }, [funnelId, db]);

  const handleAnswerClick = (answerIndex: number) => {
    if (isAnimating || !funnelData) return;

    setIsAnimating(true);
    setClickedAnswerIndex(answerIndex);

    setTimeout(() => {
      setIsAnimating(false);
      setClickedAnswerIndex(null);

      if (!funnelData || funnelData.questions.length === 0) return;

      if (currentQuestionIndex === 5 && funnelData.questions.length === 6) {
        let redirectLink = funnelData.finalRedirectLink || 'https://example.com/default-final-redirect-link';
        if (funnelData.tracking && funnelData.tracking.trim() !== '') {
          const hasQueryParams = redirectLink.includes('?');
          redirectLink = `${redirectLink}${hasQueryParams ? '&' : '?'}${funnelData.tracking.trim()}`;
        }
        console.log('QuizPlayer: 重定向到:', redirectLink);
        window.location.href = redirectLink;
        return;
      }

      if (currentQuestionIndex < funnelData.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        alert('测验完成！没有更多问题。');
      }
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="quiz-player-container" style={{ textAlign: 'center', marginTop: '80px' }}>
        <h2
          style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#ff4f81',
            animation: 'pulse 1.5s infinite',
          }}
        >
          准备好解锁你的秘密匹配了吗？🔥
        </h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-player-container">
        <h2>加载测验错误</h2>
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (!funnelData || funnelData.questions.length === 0 || funnelData.questions.length < 6) {
    return (
      <div className="quiz-player-container">
        <h2>测验未准备好</h2>
        <p>此漏斗没有问题或问题少于所需的6个问题。请联系漏斗创建者。</p>
      </div>
    );
  }

  const currentQuestion = funnelData.questions[currentQuestionIndex];

  const quizPlayerContainerStyle = {
    '--primary-color': funnelData.primaryColor,
    '--button-color': funnelData.buttonColor,
    '--background-color': funnelData.backgroundColor,
    '--text-color': funnelData.textColor,
    backgroundColor: funnelData.backgroundColor,
    color: funnelData.textColor,
  } as React.CSSProperties;

  return (
    <div className="quiz-player-container" style={quizPlayerContainerStyle}>
      <h3 style={{ color: 'var(--text-color)' }}>{currentQuestion.title}</h3>
      <div className="quiz-answers-container">
        {currentQuestion.answers.map((answer, index) => (
          <button
            key={answer.id}
            className={`quiz-answer-button ${clickedAnswerIndex === index ? 'selected-answer animating' : ''}`}
            onClick={() => handleAnswerClick(index)}
            disabled={isAnimating}
            style={{
              backgroundColor: 'var(--button-color)',
              color: 'var(--text-color)',
              borderColor: 'var(--primary-color)',
            }}
          >
            {answer.text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [uid, setUid] = useState<string | null>(null);
  const [entered, setEntered] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // 控制UID显示
  const showUid = process.env.REACT_APP_SHOW_UID === 'true';

  // 认证和密码验证
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
        setIsLoading(false);
        console.log('用户已登录，UID:', user.uid);
      } else {
        setUid(null);
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleCheckPassword = async () => {
    if (password === 'myFunnel888yong') {
      setIsLoading(true);
      try {
        await signInAnonymously(auth);
        setEntered(true);
      } catch (error: any) {
        console.error('匿名登录失败:', error.message);
        alert(`登录失败: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    } else {
      alert('❌ 密码错误，请重试');
      setPassword('');
    }
  };

  // 修复旧漏斗数据
  useEffect(() => {
    const fixOldFunnels = async () => {
      if (!db || !uid) return;

      const funnelsCollectionRef = collection(db, 'funnels');
      const snapshot = await getDocs(funnelsCollectionRef);
      const updates = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (!data.ownerId) {
          const docRef = doc(db, 'funnels', docSnap.id);
          updates.push(updateDoc(docRef, { ownerId: data.uid || uid }));
        }
        if (data.uid) {
          const docRef = doc(db, 'funnels', docSnap.id);
          updates.push(updateDoc(docRef, { uid: deleteField() }));
        }
      });

      if (updates.length > 0) {
        await Promise.all(updates);
        console.log('✅ 所有旧漏斗数据已补上 ownerId 并清理 uid 字段');
      }
    };

    fixOldFunnels();
  }, [db, uid]);

  // 获取漏斗数据
  const getFunnels = useCallback(async () => {
    if (!db || !uid) {
      alert('请先登录！');
      return;
    }

    try {
      const funnelsCollectionRef = collection(db, 'funnels');
      const q = query(funnelsCollectionRef, where('ownerId', '==', uid));
      const data = await getDocs(q);
      const loadedFunnels = data.docs.map((doc) => {
        const docData = doc.data() as Partial<Funnel>;
        return {
          ...(docData as Funnel),
          id: doc.id,
          ownerId: docData.ownerId || uid,
          data: { ...defaultFunnelData, ...docData.data },
          createdAt: docData.createdAt ? new Date(docData.createdAt) : new Date(),
        };
      });
      setFunnels(loadedFunnels);
      console.log('已加载漏斗:', loadedFunnels);
    } catch (error: any) {
      console.error('读取漏斗失败:', error.message);
      if (error.message.includes('permission-denied')) {
        alert('权限错误：无法读取数据，请检查数据权限或登录状态');
      } else if (error.message.includes('index')) {
        alert('查询需要索引，请在Firebase控制台创建索引');
      } else {
        alert(`读取漏斗失败: ${error.message}`);
      }
    }
  }, [db, uid]);

  // 创建漏斗
  const createFunnel = async (name: string) => {
    if (!db || !uid) {
      alert('请先登录！');
      return;
    }

    const funnelData = {
      name,
      data: defaultFunnelData,
      ownerId: uid,
      createdAt: new Date(),
    };

    try {
      const funnelsCollectionRef = collection(db, 'funnels');
      const newFunnelRef = await addDoc(funnelsCollectionRef, funnelData);
      alert(`漏斗 "${name}" 创建成功！`);
      await getFunnels();
      navigate(`/edit/${newFunnelRef.id}`);
    } catch (error: any) {
      console.error('创建漏斗失败:', error.message);
      if (error.message.includes('permission-denied')) {
        alert('权限错误：无法创建漏斗，请检查数据格式或登录状态');
      } else {
        alert(`创建漏斗失败: ${error.message}`);
      }
    }
  };

  // 删除漏斗
  const deleteFunnel = async (funnelId: string) => {
    if (!db || !uid) {
      alert('请先登录！');
      return;
    }

    if (window.confirm('确定要删除这个漏斗吗？')) {
      try {
        const funnelDoc = doc(db, 'funnels', funnelId);
        await deleteDoc(funnelDoc);
        alert('漏斗已删除');
        await getFunnels();
        navigate('/');
      } catch (error: any) {
        console.error('删除漏斗失败:', error.message);
        if (error.message.includes('permission-denied')) {
          alert('权限错误：无法删除漏斗，请检查数据权限');
        } else {
          alert(`删除漏斗失败: ${error.message}`);
        }
      }
    }
  };

  // 更新漏斗数据
  const updateFunnelData = async (funnelId: string, newData: FunnelData) => {
    if (!db || !uid) {
      alert('请先登录！');
      return;
    }

    try {
      const funnelDoc = doc(db, 'funnels', funnelId);
      await updateDoc(funnelDoc, {
        data: newData,
        ownerId: uid,
      });
      console.log('✅ 漏斗更新成功:', funnelId);
      await getFunnels();
    } catch (error: any) {
      console.error('更新漏斗失败:', error.message);
      if (error.message.includes('permission-denied')) {
        alert('权限错误：无法更新漏斗，请检查数据权限');
      } else {
        alert(`更新漏斗失败: ${error.message}`);
      }
    }
  };

  // 自动加载漏斗
  useEffect(() => {
    if (uid && entered) getFunnels();
  }, [uid, entered, getFunnels]);

  // 密码验证界面
  const isEditorPath = location.pathname === '/' || location.pathname.startsWith('/edit/');
  if (isEditorPath && !entered) {
    return (
      <div style={{ padding: 40, fontFamily: 'Arial', textAlign: 'center' }}>
        <h2>🔐 请输入访问密码</h2>
        <label htmlFor="password" style={{ display: 'block', marginBottom: 10 }}>
          密码
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCheckPassword();
          }}
          placeholder="请输入密码"
          style={{ padding: 10, fontSize: 16, marginRight: 10 }}
          aria-describedby="password-error"
        />
        <button
          onClick={handleCheckPassword}
          style={{ padding: '10px 20px', fontSize: 16 }}
          disabled={isLoading}
        >
          {isLoading ? '加载中...' : '进入'}
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, fontFamily: 'Arial' }}>
      {showUid && uid && isEditorPath && (
        <p style={{ color: 'green' }}>
          已登录 UID: <code>{uid}</code>
        </p>
      )}
      <Routes>
        <Route
          path="/"
          element={
            <FunnelDashboard
              db={db}
              funnels={funnels}
              setFunnels={setFunnels}
              createFunnel={createFunnel}
              deleteFunnel={deleteFunnel}
            />
          }
        />
        <Route path="/edit/:funnelId" element={<FunnelEditor db={db} updateFunnelData={updateFunnelData} />} />
        <Route path="/play/:funnelId" element={<QuizPlayer db={db} />} />
        <Route path="*" element={<h2>404 未找到</h2>} />
      </Routes>
    </div>
  );
}
