import React from 'react';
import './App.css';
import Dashboard from './components/dashboard';
import Reminders from './components/reminders';
import Filter from './components/filter'
import Table from './components/table'

function App() {
  return (
    <div className="App">
      <div className="top-section">
        <Dashboard />
        <Reminders />
      </div>
      <div className="bottom-section">
        <Filter />
        <Table />
      </div>
    </div>
  );
}

export default App;
