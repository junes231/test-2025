import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Routes, Route, useParams } from 'react-router-dom';
import { collection, getDocs, updateDoc, doc, addDoc, query, where, getDoc, deleteDoc, deleteField } from 'firebase/firestore';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import './App.css';

interface AppProps {
  db: any; // Firestore 实例
  auth: any; // Authentication 实例
}

const App: React.FC<AppProps> = ({ db, auth }) => {
  const [uid, setUid] = useState<string | null>(null);
  const [funnels, setFunnels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isEditorPath = location.pathname.startsWith('/edit/');
  const showUid = process.env.REACT_APP_SHOW_UID === 'true';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
      } else {
        signInAnonymously(auth).catch((err) => {
          console.error('匿名登录失败:', err.message);
          setError('无法登录，请检查网络连接。');
        });
      }
    });
    return () => unsubscribe();
  }, [auth]);

  const fetchFunnels = useCallback(async () => {
    if (!uid) return;
    setIsLoading(true);
    try {
      const q = query(collection(db, 'funnels'), where('ownerId', '==', uid));
      const querySnapshot = await getDocs(q);
      const fetchedFunnels = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFunnels(fetchedFunnels);
    } catch (err: any) {
      console.error('获取漏斗失败:', err);
      setError('无法加载漏斗，请检查网络连接和Firebase规则。');
    } finally {
      setIsLoading(false);
    }
  }, [db, uid]);

  useEffect(() => {
    fetchFunnels();
  }, [fetchFunnels]);

  const createFunnel = async (name: string) => {
    if (!uid) return;
    setIsLoading(true);
    try {
      const newFunnel = {
        name,
        data: { ...defaultFunnelData },
        ownerId: uid,
        createdAt: new Date().toISOString(),
      };
      const docRef = await addDoc(collection(db, 'funnels'), newFunnel);
      await fetchFunnels();
      navigate(`/edit/${docRef.id}`);
    } catch (err: any) {
      console.error('创建漏斗失败:', err);
      setError('无法创建漏斗，请检查网络连接和Firebase规则。');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFunnel = async (funnelId: string) => {
    if (!uid) return;
    setIsLoading(true);
    try {
      const funnelDocRef = doc(db, 'funnels', funnelId);
      await deleteDoc(funnelDocRef);
      await fetchFunnels();
    } catch (err: any) {
      console.error('删除漏斗失败:', err);
      setError('无法删除漏斗，请检查网络连接和Firebase规则。');
    } finally {
      setIsLoading(false);
    }
  };

  const fixOldFunnels = useCallback(async () => {
    if (!uid) return;
    setIsLoading(true);
    try {
      const q = query(collection(db, 'funnels'), where('ownerId', '==', uid));
      const querySnapshot = await getDocs(q);
      const updates = querySnapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        if (data.uid && !data.ownerId) {
          await updateDoc(doc(db, 'funnels', docSnap.id), {
            ownerId: uid,
            uid: deleteField(),
          });
        }
      });
      await Promise.all(updates);
      await fetchFunnels();
    } catch (err: any) {
      console.error('修复旧漏斗失败:', err);
    } finally {
      setIsLoading(false);
    }
  }, [db, uid]);

  useEffect(() => {
    fixOldFunnels();
  }, [fixOldFunnels]);

  const defaultFunnelData = {
    questions: [],
    finalRedirectLink: '',
    tracking: '',
    conversionGoal: 'Product Purchase',
    primaryColor: '#007bff',
    buttonColor: '#28a745',
    backgroundColor: '#f8f9fa',
    textColor: '#333333',
  };

  // FunnelDashboard 逻辑
  const FunnelDashboard = () => {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const handlePasswordSubmit = () => {
      if (password === 'myFunnel888yong') {
        setIsAuthenticated(true);
      } else {
        alert('密码错误！请使用 "myFunnel888yong"');
      }
    };

    if (!isAuthenticated) {
      return (
        <div className="password-container">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码"
          />
          <button onClick={handlePasswordSubmit} disabled={!password}>
            登录
          </button>
        </div>
      );
    }

    return (
      <div className="dashboard-container">
        <h2>我的漏斗</h2>
        {isLoading && <p>加载中...</p>}
        {error && <p className="error-message">{error}</p>}
        <input
          type="text"
          placeholder="输入新漏斗名称"
          onKeyPress={(e) => e.key === 'Enter' && createFunnel(e.currentTarget.value)}
        />
        <ul>
          {funnels.map((funnel) => (
            <li key={funnel.id}>
              {funnel.name}
              <button onClick={() => navigate(`/edit/${funnel.id}`)}>编辑</button>
              <button onClick={() => deleteFunnel(funnel.id)}>删除</button>
              <button onClick={() => handleCopyLink(funnel.id)}>复制链接</button>
            </li>
          ))}
        </ul>
      </div>
    );

    const handleCopyLink = (funnelId: string) => {
      const url = `https://your-username.github.io/funnel-editor-2025/#/play/${funnelId}`; // 调整为你的部署 URL
      navigator.clipboard.writeText(url);
      alert('测验链接已复制到剪贴板！');
    };
  };

  // FunnelEditor 逻辑
  const FunnelEditor = ({ funnelId }: { funnelId: string }) => {
    const [funnelData, setFunnelData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'questions' | 'links' | 'colors'>('questions');

    useEffect(() => {
      const loadFunnel = async () => {
        if (!funnelId || !uid) return;
        try {
          const funnelDocRef = doc(db, 'funnels', funnelId);
          const funnelDoc = await getDoc(funnelDocRef);
          if (funnelDoc.exists()) {
            setFunnelData({ ...defaultFunnelData, ...funnelDoc.data().data });
          }
        } catch (err: any) {
          console.error('加载漏斗失败:', err);
        }
      };
      loadFunnel();
    }, [funnelId, db, uid]);

    const updateFunnelData = async (newData: any) => {
      if (!funnelId || !uid) return;
      try {
        const funnelDocRef = doc(db, 'funnels', funnelId);
        await updateDoc(funnelDocRef, { data: newData });
        console.log('Funnel data updated successfully');
      } catch (err: any) {
        console.error('更新漏斗数据失败:', err);
      }
    };

    // 问题编辑逻辑（原 QuizEditorComponent 功能）
    const handleAddQuestion = () => {
      setFunnelData(prev => ({
        ...prev,
        questions: [...prev.questions, { id: Date.now().toString(), title: '', type: 'single-choice', answers: [{ id: '1', text: '' }] }],
      }));
    };

    const handleSaveQuestion = (questionIndex: number, updatedQuestion: any) => {
      setFunnelData(prev => {
        const newQuestions = [...prev.questions];
        newQuestions[questionIndex] = updatedQuestion;
        return { ...prev, questions: newQuestions };
      });
      updateFunnelData(funnelData);
    };

    // 链接设置逻辑（原 LinkSettingsComponent 功能）
    const handleUpdateLink = (field: string, value: string) => {
      setFunnelData(prev => ({ ...prev, [field]: value }));
      updateFunnelData(funnelData);
    };

    // 颜色自定义逻辑（原 ColorCustomizerComponent 功能）
    const handleUpdateColor = (field: string, value: string) => {
      setFunnelData(prev => ({ ...prev, [field]: value }));
      updateFunnelData(funnelData);
    };

    if (!funnelData) return <p>加载中...</p>;

    return (
      <div className="editor-container">
        <div className="tab-buttons">
          <button onClick={() => setActiveTab('questions')}>问题</button>
          <button onClick={() => setActiveTab('links')}>链接</button>
          <button onClick={() => setActiveTab('colors')}>颜色</button>
        </div>
        {activeTab === 'questions' && (
          <div>
            <button onClick={handleAddQuestion}>添加问题</button>
            {funnelData.questions.map((q: any, index: number) => (
              <div key={q.id}>
                <input
                  value={q.title}
                  onChange={(e) => handleSaveQuestion(index, { ...q, title: e.target.value })}
                  placeholder="问题标题"
                />
                {/* 简单答案输入，实际可扩展 */}
                <input
                  value={q.answers[0]?.text || ''}
                  onChange={(e) => handleSaveQuestion(index, { ...q, answers: [{ ...q.answers[0], text: e.target.value }] })}
                  placeholder="答案"
                />
              </div>
            ))}
          </div>
        )}
        {activeTab === 'links' && (
          <div>
            <input
              value={funnelData.finalRedirectLink}
              onChange={(e) => handleUpdateLink('finalRedirectLink', e.target.value)}
              placeholder="最终重定向链接"
            />
            <input
              value={funnelData.tracking}
              onChange={(e) => handleUpdateLink('tracking', e.target.value)}
              placeholder="跟踪参数"
            />
          </div>
        )}
        {activeTab === 'colors' && (
          <div>
            <input
              type="color"
              value={funnelData.primaryColor}
              onChange={(e) => handleUpdateColor('primaryColor', e.target.value)}
            />
            <input
              type="color"
              value={funnelData.buttonColor}
              onChange={(e) => handleUpdateColor('buttonColor', e.target.value)}
            />
            <input
              type="color"
              value={funnelData.backgroundColor}
              onChange={(e) => handleUpdateColor('backgroundColor', e.target.value)}
            />
            <input
              type="color"
              value={funnelData.textColor}
              onChange={(e) => handleUpdateColor('textColor', e.target.value)}
            />
          </div>
        )}
      </div>
    );
  };

  // QuizPlayer 逻辑
  const QuizPlayer = () => {
    const { funnelId } = useParams<{ funnelId: string }>();
    const [funnelData, setFunnelData] = useState<any>(null);
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
            const funnel = funnelDoc.data() as any;
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
          {currentQuestion.answers.map((answer: any, index: number) => (
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

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<FunnelDashboard />} />
        <Route path="/edit/:funnelId" element={<FunnelEditor funnelId={useParams<{ funnelId: string }>().funnelId || ''} />} />
        <Route path="/play/:funnelId" element={<QuizPlayer />} />
      </Routes>
      {showUid && uid && isEditorPath && (
        <p style={{ color: 'green' }}>
          已登录 UID: <code>{uid}</code>
        </p>
      )}
    </div>
  );
};

export default App;


