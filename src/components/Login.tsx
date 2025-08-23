import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    // In a real app, you'd have authentication logic here.
    // For this example, we'll just navigate to the editor page on successful login.
    if (email && password) {
      console.log('Logging in with:', { email, password });
      navigate('/editor');
    } else {
      alert('Please enter both email and password.');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-6 text-center">Editor Login</h2>
        <input
          type="email"
          placeholder="Company Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 mb-4 border rounded focus:outline-none focus:ring focus:border-blue-500"
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 mb-6 border rounded focus:outline-none focus:ring focus:border-blue-500"
        />
        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring focus:bg-blue-600"
        >
          Log in
        </button>
        <p className="mt-4 text-center">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-blue-500 hover:underline">Click here to register</Link>
        </p>

        {/* ===== START: ADDED/MODIFIED CODE BLOCK ===== */}
        <div className="mt-6 text-center text-sm space-y-2">
          <div>
            <a
              href="https://github.com/junes231/myfunnel-legal/blob/main/PRIVACY_POLICY.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:underline"
            >
              Privacy Policy
            </a>
          </div>
          <div>
            <a
              href="https://github.com/junes231/myfunnel-legal/blob/main/TERMS_OF_SERVICE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:underline"
            >
              Terms of Service
            </a>
          </div>
        </div>
        {/* ===== END: ADDED/MODIFIED CODE BLOCK ===== */}
        
      </div>
    </div>
  );
}

export default Login;
