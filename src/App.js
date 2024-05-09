import React from 'react';
import './App.css';
import Dashboard from './components/dashboard';
import Reminders from './components/reminders';
import Filter from './components/filter'

function App() {
  return (
    <div className="App">
      <Dashboard />
      <Reminders />
      <Filter />
    </div>
  );
}

export default App;