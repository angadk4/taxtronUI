import React, { useState, useMemo, useEffect, useCallback } from 'react';
import ReactPaginate from 'react-paginate';
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
  const [selectedBirthMonth, setSelectedBirthMonth] = useState('');
  const [selectedBirthDate, setSelectedBirthDate] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({});
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
  const [currentPage, setCurrentPage] = useState(0);
  const [filteredClients, setFilteredClients] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const itemsPerPage = 50;

  const months = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('en-US', { month: 'long' }))
  , []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(0);
    handleReset();
  };

  const applyFilters = () => {
    const filters = {
      selectedBirthMonth,
      selectedBirthDate,
      checkBoxState,
    };
    setAppliedFilters(filters);
    setCurrentPage(0); // Reset to first page
    loadClients(filters);
  };

  const loadClients = useCallback((filters) => {
    let filteredData = clientsData.filter(client => client.productCode === activeTab);

    if (filters.selectedBirthMonth) {
      filteredData = filteredData.filter(client => {
        const dob = new Date(client.dob);
        return dob.toLocaleString('en-US', { month: 'long' }) === filters.selectedBirthMonth;
      });
    }

    if (filters.selectedBirthDate) {
      filteredData = filteredData.filter(client => {
        const dob = new Date(client.dob);
        return dob.getDate() === parseInt(filters.selectedBirthDate, 10);
      });
    }

    const queryParts = searchQuery.toLowerCase().split(' ').filter(Boolean);
    if (queryParts.length > 0) {
      filteredData = filteredData.filter(client => {
        return queryParts.every(queryPart =>
          Object.values(client).some(value => normalizeString(String(value)).includes(queryPart))
        );
      });
    }

    setFilteredClients(filteredData);
  }, [activeTab, searchQuery]);

  useEffect(() => {
    loadClients(appliedFilters);
  }, [activeTab, appliedFilters, loadClients]);

  useEffect(() => {
    setCurrentPage(0); // Reset to first page
    loadClients(appliedFilters);
  }, [searchQuery, appliedFilters, loadClients]);

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

  const paginatedClients = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    return sortedClients.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedClients, currentPage]);

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
    setSelectedBirthMonth(e.target.value);
    setShowCalendar(false);
    setSelectedBirthDate('');
  };

  const handleDateChange = (date) => {
    setSelectedBirthDate(date);
    setShowCalendar(false);
  };

  const handleReset = () => {
    setSelectedBirthMonth('');
    setSelectedBirthDate('');
    setSearchQuery('');
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
    setAppliedFilters({});
    setCurrentPage(0);
    setFilteredClients([]);
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

  const renderCalendar = () => {
    if (!selectedBirthMonth) return null;

    const monthIndex = months.indexOf(selectedBirthMonth);
    const daysInMonth = new Date(2024, monthIndex + 1, 0).getDate();

    return (
      <div className="calendar-container">
        <div className="calendar-header">
          <h4>{selectedBirthMonth}</h4>
        </div>
        <div className="calendar-grid">
          {[...Array(daysInMonth)].map((_, i) => (
            <button
              key={i + 1}
              className={`calendar-day ${selectedBirthDate === (i + 1) ? 'selected' : ''}`}
              onClick={() => handleDateChange(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="main-content">
      <div className="filter-container">
        <div className="filter-category">
          <h3>By Birthdate</h3>
          <div className="filter-item">
            <label htmlFor="month-select">Birth Month:</label>
            <select 
              id="month-select"
              value={selectedBirthMonth}
              onChange={handleMonthChange}
              className="custom-select"
            >
              <option value="">Select a month</option>
              {months.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
          <div className={`filter-item ${selectedBirthMonth ? '' : 'inactive'}`}>
            <label htmlFor="date-select">Birth Date:</label>
            <span className="date-display">{selectedBirthDate ? `${selectedBirthMonth} ${selectedBirthDate}` : 'Select a date'}</span>
            <button 
              className="calendar-button" 
              onClick={() => setShowCalendar(true)} 
              disabled={!selectedBirthMonth}
            >
              Select Date
            </button>
          </div>
          {showCalendar && renderCalendar()}
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
          <button className="apply-button" onClick={applyFilters}>Apply</button>
        </div>
      </div>

      <div className="table-container">
        <div className="tab">
          <button className={`tablinks ${activeTab === 'T1' ? 'active' : ''}`} onClick={() => handleTabChange('T1')}>T1</button>
          <button className={`tablinks ${activeTab === 'T2' ? 'active' : ''}`} onClick={() => handleTabChange('T2')}>T2</button>
        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search Fields..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(0); // Reset to first page
            }}
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
              {paginatedClients.map((client, index) => (
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
          <ReactPaginate
            previousLabel={'Previous'}
            nextLabel={'Next'}
            breakLabel={'...'}
            pageCount={Math.ceil(sortedClients.length / itemsPerPage)}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={({ selected }) => setCurrentPage(selected)}
            containerClassName={'pagination'}
            activeClassName={'active'}
            forcePage={currentPage} // Ensure pagination component reflects current page
          />
        </div>
      </div>
    </div>
  );
};

export default FilterTable;
