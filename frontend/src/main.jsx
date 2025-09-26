// frontend/src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// 1. Import Redux requirements
import { Provider } from 'react-redux';
import { store } from './redux/store'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. Wrap the App with the Redux Provider */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);