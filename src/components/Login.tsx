import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginView, setIsLoginView] = useState(true);
  const auth = getAuth();

  const handleSubmit = () => {
    if (isLoginView) {
      // 处理登录
      signInWithEmailAndPassword(auth, email, password)
        .catch(error => alert(`Login Failed: ${error.message}`));
    } else {
      // 处理注册
      createUserWithEmailAndPassword(auth, email, password)
        .catch(error => alert(`Registration failed: ${error.message}`));
    }
  };

  return (
    <div style={{ padding: 40, fontFamily: 'Arial', textAlign: 'center', maxWidth: '400px', margin: '100px auto', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>{isLoginView ? 'Editor Login' : 'Editor Registration'}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          placeholder="Company Email" 
          style={{ padding: 12, fontSize: 16 }} 
        />
        <input 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          placeholder="password" 
          style={{ padding: 12, fontSize: 16 }}
        />
        <button 
          onClick={handleSubmit} 
          style={{ padding: '12px 20px', fontSize: 16, cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          {isLoginView ? 'Log in' : 'register'}
        </button>
        <p onClick={() => setIsLoginView(!isLoginView)} style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}>
          {isLoginView ? 'Don't have an account yet? Click here to register' : 'Already have an account? Log in'}
        </p>
      </div>
    </div>
  );
}
