import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.tsx'; // 确保导入 App
import './index.css';

// Firebase imports
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyA8rJiJnyB6QHgkesFekaRy7f0oftXaF0c',
  authDomain: 'funnel-editor-netlify.firebaseapp.com',
  projectId: 'funnel-editor-netlify',
  storageBucket: 'funnel-editor-netlify.firebasestorage.app',
  messagingSenderId: '498506838505',
  appId: '1:498506838505:web:95f20fdfbb260c2b271b78',
  measurementId: 'G-RVRL76REP7',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Create a React root
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

// Render the application
root.render(
  <React.StrictMode>
    <HashRouter>
      <App db={db} />
    </HashRouter>
  </React.StrictMode>
);
