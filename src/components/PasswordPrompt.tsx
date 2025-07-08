import React, { useState } from 'react';

interface PasswordPromptProps {
  onSuccess: () => void;
}

const PasswordPrompt: React.FC<PasswordPromptProps> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = '123456'; // ← 你可以改成你自己的密码

    if (password === correctPassword) {
      localStorage.setItem('passwordVerified', 'true');
      onSuccess();
    } else {
      setError('Incorrect password. Please try again.');
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
          style={{ padding: 8, width: 200 }}
        />
        <br /><br />
        <button type="submit" style={{ padding: '8px 16px' }}>
          Submit
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default PasswordPrompt;
