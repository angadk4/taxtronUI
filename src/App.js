import React from 'react';
import './App.css';
import Dashboard from './components/dashboard'; // Import the DashboardItem component

function App() {
  return (
    <div className="App">
      <Dashboard /> {/* Use the DashboardItem component */}
    </div>
  );
}

export default App;