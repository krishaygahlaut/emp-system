import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Force clear old tokens without role field
const token = localStorage.getItem('token');
if (token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.role) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
