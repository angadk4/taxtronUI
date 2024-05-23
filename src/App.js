import React from 'react';
import './App.css';
import Dashboard from './components/dashboard';
import Reminders from './components/reminders';
import FilterTable from './components/filtertable';

function App() {
  return (
    <div className="App">
      <div className="top-section">
      </div>
      <div className="bottom-section">
        <FilterTable />
      </div>
    </div>
  );
}

export default App;
