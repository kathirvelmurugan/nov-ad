import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { purgeLegacyStorage } from './utils/storagePurge';

// Automatically purge legacy v2.4 caches for tester browsers on boot
purgeLegacyStorage();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
