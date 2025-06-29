import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom'; // Keep HashRouter for GitHub Pages subdirectory compatibility
import App from './App.tsx';
import './index.css';

// Firebase imports
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration (从 Firebase 控制台复制并粘贴到这里！)
// IMPORTANT: Replace the placeholder values with YOUR actual Firebase config!
const firebaseConfig = {
  apiKey: "AIzaSyDHBf2aP49nxmxHS3DuZsDOhofvECOkM-g", // <-- 替换为你的实际 API Key
  authDomain: "myfunneleditorapp.firebaseapp.com", // <-- 替换为你的实际 authDomain
  projectId: "myfunneleditorapp", // <-- 替换为你的实际 Project ID
  storageBucket: "myfunneleditorapp.firebasestorage.app", // <-- 替换为你的实际 Storage Bucket
  messagingSenderId: "132054308840", // <-- 替换为你的实际 Messaging Sender ID
  appId: "1:132054308840:web:3ab09ebc8e73522836765d", // <-- 替换为你的实际 App ID
  // measurementId: "G-XXXXXXXXXX" // 如果你启用了 Google Analytics，也包含这行
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Create a React root
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

// Render the application
root.render(
  <React.StrictMode>
    <HashRouter> {/* HashRouter for GitHub Pages subdirectory */}
      <App db={db} /> {/* Pass Firestore instance to App component */}
    </HashRouter>
  </React.StrictMode>
);

