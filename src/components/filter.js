import React, { useState } from 'react';
import './filter.css';

const months = Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('en-US', { month: 'long' }));

function Filter() {
  const [selectedMonth, setSelectedMonth] = useState(months[0]);
  const [checkBoxState, setCheckBoxState] = useState({
    selfEmploymentIncome: false,
    nonResidentReturns: false,
    balanceOwing: false,
    gstPayroll: false,
    returnEFile: false,
    t1135EFile: false,
    padEFile: false,
    succeeded: false,
    pending: false,
    failed: false,
    cancelled: false
  });

  const handleCheckboxChange = (event) => {
    const { name } = event.target;
    setCheckBoxState(prevState => ({
      ...prevState,
      [name]: !prevState[name]
    }));
  };

  return (
    <div className="container">
      <div className="sidebar">
        <div className="filter-category">
          <h3>By Date</h3>
          <div className="filter-item">
            <label htmlFor="month-select">Month:</label>
            <select 
              id="month-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {months.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
          <div className="filter-item">
            <button className="calendar-button">Calendar</button>
          </div>
        </div>
        
        <div className="filter-category">
          <h3>By Type</h3>
          {renderCheckbox("selfEmploymentIncome", "Self-Employment Income")}
          {renderCheckbox("nonResidentReturns", "Non-Resident Returns")}
          {renderCheckbox("balanceOwing", "Balance Owing")}
          {renderCheckbox("gstPayroll", "GST Payroll")}
        </div>
        
        <div className="filter-category">
          <h3>Filing Status</h3>
          {renderCheckbox("returnEFile", "Return ready to e-file")}
          {renderCheckbox("t1135EFile", "T1135 ready to e-file")}
          {renderCheckbox("padEFile", "PAD ready to e-file")}
        </div>

        <div className="filter-category">
          <h3>Payment Status</h3>
          {renderCheckbox("succeeded", "Succeeded")}
          {renderCheckbox("pending", "Pending")}
          {renderCheckbox("failed", "Failed")}
          {renderCheckbox("cancelled", "Cancelled")}
        </div>
      </div>
      <div className="content">
        <div className="table-placeholder">Table Placeholder</div>
      </div>
    </div>
  );

  function renderCheckbox(name, label) {
    return (
      <div className="filter-item">
        <label htmlFor={name}>{label}</label>
        <input
          type="checkbox"
          id={name}
          name={name}
          checked={checkBoxState[name]}
          onChange={handleCheckboxChange}
        />
      </div>
    );
  }  
}

export default Filter;
