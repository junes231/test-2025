import React, { useState } from 'react';

interface PasswordPromptProps {
  onSuccess: () => void;
}

const PasswordPrompt: React.FC<PasswordPromptProps> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = 'myFunnel888musk'; // ← 你可以替换成自己的密码

    if (password === correctPassword) {
      localStorage.setItem('passwordVerified', 'true');
      onSuccess();
    } else {
      setError('Incorrect password.');
    }
  };

  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h2>🔐 Enter Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: '10px',
            fontSize: '16px',
            width: '250px',
            marginBottom: '10px',
          }}
        />
        <br />
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          Submit
        </button>
        {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}
      </form>
    </div>
  );
};

export default PasswordPrompt;
