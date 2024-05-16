import React, { useState, useEffect, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './filtertable.css';
import clientsData from './clientdata.json';
import { parseISO, format } from 'date-fns';

const formatDate = (dateStr) => {
  const parsedDate = dateStr.includes('T') ? parseISO(dateStr) : parseCustomDate(dateStr);
  return format(parsedDate, 'yyyy/MM/dd HH:mm:ss');
};

const parseCustomDate = (dateStr) => {
  const [datePart, timePart, period] = dateStr.split(' ');
  const [month, day, year] = datePart.split('/').map(Number);
  let [hours, minutes, seconds] = timePart.split(':').map(Number);

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return new Date(year, month - 1, day, hours, minutes, seconds);
};

const normalizeString = (str) => str.toLowerCase().replace(/\s+/g, ' ').trim();

const FilterTable = () => {
  const [activeTab, setActiveTab] = useState('T1');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredClients = useMemo(() => {
    const clients = activeTab === 'T1'
      ? clientsData.filter(client => client.productCode === 'T1')
      : clientsData.filter(client => client.productCode === 'T2');

    const queryParts = searchQuery.toLowerCase().split(' ').filter(Boolean);

    return clients.filter(client =>
      queryParts.every(queryPart =>
        Object.values(client).some(value => normalizeString(String(value)).includes(queryPart))
      )
    );
  }, [activeTab, searchQuery]);

  const sortedClients = useMemo(() => {
    const sorted = [...filteredClients];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        if (sortConfig.key === 'lastUpdated') {
          return (new Date(a[sortConfig.key]) - new Date(b[sortConfig.key])) * (sortConfig.direction === 'asc' ? 1 : -1);
        }
        return (a[sortConfig.key] || '').localeCompare(b[sortConfig.key] || '') * (sortConfig.direction === 'asc' ? 1 : -1);
      });
    }
    return sorted;
  }, [filteredClients, sortConfig]);

  const requestSort = (key) => {
    setSortConfig((prevState) => ({
      key,
      direction: prevState.key === key && prevState.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const columns = activeTab === 'T1'
    ? [
        { key: 'firstnames', label: 'Name' },
        { key: 'sin', label: 'SIN' },
        { key: 'phoneNo', label: 'Phone' },
        { key: 'email', label: 'Email' },
        { key: 'lastUpdated', label: 'Last Updated' },
      ]
    : [
        { key: 'companyName', label: 'Company Name' },
        { key: 'bnFull', label: 'Business Number' },
        { key: 'fyEnd', label: 'Year End' },
        { key: 'lastUpdated', label: 'Last Updated' },
      ];

  useEffect(() => {
    const fadeIn = (selector) => {
      const element = document.querySelector(selector);
      element.classList.add('fade-in');
      const timer = setTimeout(() => element.classList.remove('fade-in'), 300);
      return () => clearTimeout(timer);
    };

    fadeIn('.tabcontent.active');
    fadeIn('.custom-table tbody');
  }, [activeTab, sortConfig]);

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

  return (
    <div className="main-content">
      <div className="filter-container">
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

      <div className="table-container">
        <div className="tab">
          <button className={`tablinks ${activeTab === 'T1' ? 'active' : ''}`} onClick={() => setActiveTab('T1')}>T1</button>
          <button className={`tablinks ${activeTab === 'T2' ? 'active' : ''}`} onClick={() => setActiveTab('T2')}>T2</button>
        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search Fields..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="tabcontent active">
          <table className="custom-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key} onClick={() => requestSort(column.key)}>
                    {column.label} {sortConfig.key === column.key ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedClients.map((client, index) => (
                <tr key={index}>
                  {columns.map((column) => (
                    <td key={column.key}>
                      {column.key === 'firstnames'
                        ? `${client.firstnames} ${client.surname}`
                        : column.key === 'lastUpdated'
                        ? formatDate(client[column.key])
                        : client[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const months = Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('en-US', { month: 'long' }));

export default FilterTable;
