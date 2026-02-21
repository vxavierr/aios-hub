import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DomainDetail from './pages/DomainDetail';
import Header from './components/shared/Header';
import { ThemeProvider } from './context/ThemeContext';
import './styles/App.css';

function App() {
  return (
    <ThemeProvider>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/domain/:domainId" element={<DomainDetail />} />
          </Routes>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
