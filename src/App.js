import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from 'react-router-dom';
import './App.css';
import FilterTable from './components/filtertable';
import Returns from './components/returns';
import APIController from './components/clientfetch';

function NavigationButton() {
  const location = useLocation();

  return (
    <div className="top-section">
      {location.pathname.includes('/returns') && (
        <Link to="/">
          <button className="navigate-button">Back to Clients</button>
        </Link>
      )}
    </div>
  );
}

function App() {
  const [data, setData] = useState(null);

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
        <div className="data-section">
          <APIController url="https://ds.taxtron.ca/clientsearch/getclientsdata/000779638e3141fcb06a56bdc5cc484e?Prod=T1" setData={setData} />
          {data && (
            <div className="fetched-data">
              <h2>Fetched Data</h2>
              <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </Router>
  );
}

export default App;
