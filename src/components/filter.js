import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './filter.css';

const months = Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('en-US', { month: 'long' }));

function Filter() {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [datePickerVisibility, setDatePickerVisibility] = useState(false);
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

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
    setSelectedDate(null); // Clear the date selection
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedMonth(''); // Clear the month selection
    setDatePickerVisibility(false); // Hide the date picker
  };

  const handleReset = () => {
    setSelectedMonth('');
    setSelectedDate(null);
    setCheckBoxState({
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
              onChange={handleMonthChange}
            >
              <option value="">Select a month</option>
              {months.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
          <div className="filter-item">
            <label htmlFor="date-select">Date:</label>
            <span className="date-display">{selectedDate ? selectedDate.toISOString().split('T')[0] : 'No date selected'}</span>
            <button
              className="calendar-button"
              onClick={() => setDatePickerVisibility(true)}
              aria-label="Open calendar for date selection"
            >
              Calendar
            </button>
            {datePickerVisibility && (
              <div className="date-picker-overlay">
                <button onClick={() => setDatePickerVisibility(false)} style={{ float: 'right', margin: '10px' }}>Close</button>
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDateChange}
                  inline
                />
              </div>
            )}
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
        <div className="buttons">
          <button onClick={handleReset} className="reset-button">Reset</button>
          <button className="apply-button">Apply</button>
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
