import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginView, setIsLoginView] = useState(true);
  const auth = getAuth();

  const handleSubmit = () => {
    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    if (isLoginView) {
      // Handle Login
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Signed in 
          console.log("User logged in:", userCredential.user);
        })
        .catch(error => alert(`Login Failed: ${error.message}`));
    } else {
      // Handle Sign Up
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Signed up 
          console.log("User signed up:", userCredential.user);
        })
        .catch(error => alert(`Sign Up Failed: ${error.message}`));
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
          {isLoginView ? 'Don\'t have an account yet? Click here to register' : 'Already have an account? Log in'}
          {/* ===== START: ADD THIS CODE BLOCK ===== */}
<div className="mt-6 text-center text-sm text-gray-500">
  <p className="mb-2">By logging in, you agree to our</p>
  <div className="flex flex-col items-center [&>*]:block [&>*]:w-full space-y-2">
    <a 
      href="https://github.com/junes231/myfunnel-legal/blob/main/PRIVACY_POLICY.md" 
      target="_blank" 
      rel="noopener noreferrer" 
      className="text-gray-600 hover:text-gray-800 hover:underline transition-colors duration-200"
    >
      Privacy Policy
    </a>
    <a 
      href="https://github.com/junes231/myfunnel-legal/blob/main/TERMS_OF_SERVICE.md" 
      target="_blank" 
      rel="noopener noreferrer" 
      className="text-gray-600 hover:text-gray-800 hover:underline transition-colors duration-200"
    >
      Terms of Service
    </a>
  </div>
</div>
      </p>
      </div>
    </div>
  );
}
