import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { UploadPage } from './pages/upload';
import { AnalysisPage } from './pages/analysis';
import { SettingsPage } from './pages/settings';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <div className="mx-auto min-h-screen max-w-6xl p-6">
        <header className="mb-8 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-accent">SonicCritique</Link>
          <nav className="flex gap-4 text-sm text-zinc-300">
            <Link to="/">Upload</Link>
            <Link to="/settings">Settings</Link>
          </nav>
        </header>
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/analysis/:id" element={<AnalysisPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
