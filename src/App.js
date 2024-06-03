import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from 'react-router-dom';
import './App.css';
import FilterTable from './components/filtertable';
import Returns from './components/returns';

function NavigationButton() {
  const location = useLocation();

  return (
    <div className="top-section">
      {location.pathname.includes('/returns') && (
        <Link to="/">
          <button className="navigate-button">Back to Filter Table</button>
        </Link>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <NavigationButton />
        <div className="bottom-section">
          <Routes>
            <Route path="/" element={<FilterTable />} />
            <Route path="/returns/:clientId" element={<Returns />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
