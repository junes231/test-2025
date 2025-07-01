import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// Firebase imports
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDHBf2aP49nxmxHS3DuZsDOhofvECOkM-g",
  authDomain: "myfunneleditorapp.firebaseapp.com",
  projectId: "myfunneleditorapp",
  storageBucket: "myfunneleditorapp.firebasestorage.app",
  messagingSenderId: "132054308840",
  appId: "1:132054308840:web:3ab09ebc8e73522836765d",
  measurementId: "G-RVRL76REP7"
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
