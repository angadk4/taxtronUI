import React, { useState, useMemo, useEffect, useCallback } from 'react';
import ReactPaginate from 'react-paginate';
import './filtertable.css';
import { parseISO, format, parse } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import APIController from './clientfetch';

const baseURL = '/clientsearch/getclientsdata/000779638e3141fcb06a56bdc5cc484e';

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'; // Handle undefined or null date strings
  let parsedDate;

  // Try ISO format first
  try {
    parsedDate = parseISO(dateStr);
    if (!isNaN(parsedDate)) return format(parsedDate, 'yyyy/MM/dd HH:mm:ss');
  } catch (error) {
    // continue to next format
  }

  // Try 'MM/dd/yyyy hh:mm:ss a' format
  try {
    parsedDate = parse(dateStr, 'MM/dd/yyyy hh:mm:ss a', new Date());
    if (!isNaN(parsedDate)) return format(parsedDate, 'yyyy/MM/dd HH:mm:ss');
  } catch (error) {
    // continue to next format
  }

  return 'N/A';
};

const normalizeString = (str) => str.toLowerCase().replace(/\s+/g, ' ').trim();

const YearSelector = ({ selectedYear, onChange }) => {
  return (
    <div className="year-selector">
      <button
        className={`year-button ${selectedYear === 'Cur Yr' ? 'active' : ''}`}
        onClick={() => onChange('Cur Yr')}
      >
        Current Year
      </button>
      <button
        className={`year-button ${selectedYear === 'Prev Yr' ? 'active' : ''}`}
        onClick={() => onChange('Prev Yr')}
      >
        Previous Year
      </button>
    </div>
  );
};

const FilterTable = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('T1');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedBirthMonth, setSelectedBirthMonth] = useState('');
  const [selectedBirthDate, setSelectedBirthDate] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({});
  const [checkBoxState, setCheckBoxState] = useState({
    selfEmployed: false,
    foreignTaxFilingRequired: false,
    discountedReturn: false,
    gstDue: false,
    expectedRefund: false,
    payrollSlipsDue: false,
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [filteredClients, setFilteredClients] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedYear, setSelectedYear] = useState('Cur Yr');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [error, setError] = useState('');
  const itemsPerPage = 25;

  const months = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('en-US', { month: 'long' }))
  , []);

  const buildURL = useCallback(() => {
    let url = `${baseURL}?Prod=${activeTab}`;
    
    if (debouncedSearchQuery) {
      url += `&SearchText=${debouncedSearchQuery}`;
    }

    if (selectedLocation) {
      url += `&Location=${selectedLocation}`;
    }

    const filters = [];
    const prefix = selectedYear === 'Cur Yr' ? '' : 'Pre_';

    if (checkBoxState.selfEmployed) filters.push(`${prefix}bSelfEmployed eq true`);
    if (checkBoxState.foreignTaxFilingRequired) filters.push(`${prefix}bForeignTaxFilingRequired eq true`);
    if (checkBoxState.discountedReturn) filters.push(`${prefix}bDicountedRet eq true`);
    if (checkBoxState.gstDue) filters.push(`${prefix}bGSTDue eq true`);
    if (checkBoxState.expectedRefund) filters.push(`${prefix}bExpectedRefund eq true`);
    if (checkBoxState.payrollSlipsDue) filters.push(`${prefix}bPayRollSlipsDue eq true`);

    if (filters.length > 0) {
      url += `&FilterText=${filters.join(' and ')}`;
    }

    url += `&Size=${itemsPerPage}`;
    if (currentPage > 0) {
      url += `&Skip=${currentPage * itemsPerPage}`;
    }

    return url;
  }, [activeTab, debouncedSearchQuery, selectedLocation, selectedYear, checkBoxState, currentPage]);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedSearchQuery(searchQuery), 3000);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const applyFilters = () => {
    setCurrentPage(0);
    const url = buildURL();
    setFilteredClients(url);
  };

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

  const handleClientClick = async (clientId) => {
    try {
      const response = await fetch(`/returndata/${clientId}.json`);
      const responseText = await response.text();
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const clientReturnsData = JSON.parse(responseText);
      navigate(`/returns/${clientId}`, { state: { clientReturnsData } });
    } catch (error) {
      setError('Error fetching client return data.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const exportToCSV = () => {
    const csvData = sortedClients.map(client => {
      const { clientId, firstnames, surname, sin, phoneNo, email, lastUpdated, companyName, bnFull, fyEnd } = client;
      const csvRow = activeTab === 'T2' ? {
        'Company Name': companyName,
        'Business Number': bnFull,
        'Year End': fyEnd,
        'Last Updated': formatDate(lastUpdated),
      } : {
        'First Name': firstnames,
        'Surname': surname,
        'SIN': sin,
        'Phone': phoneNo,
        'Email': email,
        'Last Updated': formatDate(lastUpdated),
      };
      return csvRow;
    });
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'filtered_clients.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = useMemo(() => {
    if (activeTab === 'T3') {
      return [
        { key: 'estateName', label: 'Estate Name', className: 'estate-name' },
        { key: 'SNFull', label: 'Trust Number', className: 'trust-number' },
        { key: 'lastUpdated', label: 'Last Updated', className: 'last-updated' },
      ];
    } else if (activeTab === 'T1') {
      return [
        { key: 'firstnames', label: 'First Name', className: 'first-name' },
        { key: 'surname', label: 'Surname', className: 'surname' },
        { key: 'sin', label: 'SIN', className: 'sin' },
        { key: 'phoneNo', label: 'Phone', className: 'phone' },
        { key: 'email', label: 'Email', className: 'email' },
        { key: 'lastUpdated', label: 'Last Updated', className: 'last-updated' },
      ];
    } else if (activeTab === 'T2') {
      return [
        { key: 'companyName', label: 'Company Name', className: 'company-name' },
        { key: 'bnFull', label: 'Business Number', className: 'business-number' },
        { key: 'fyEnd', label: 'Year End', className: 'year-end' },
        { key: 'lastUpdated', label: 'Last Updated', className: 'last-updated' },
      ];
    } else {
      return [
        { key: 'companyName', label: 'Company Name', className: 'company-name' },
        { key: 'bnFull', label: 'Business Number', className: 'business-number' },
        { key: 'fyEnd', label: 'Year End', className: 'year-end' },
        { key: 'lastUpdated', label: 'Last Updated', className: 'last-updated' },
      ];
    }
  }, [activeTab]);

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
    setSelectedLocation('');
    setCheckBoxState({
      selfEmployed: false,
      foreignTaxFilingRequired: false,
      discountedReturn: false,
      gstDue: false,
      expectedRefund: false,
      payrollSlipsDue: false,
    });
    setAppliedFilters({});
    setCurrentPage(0);
    setFilteredClients([]);
    setSelectedYear('Cur Yr');
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  const handleLocationChange = (e) => {
    setSelectedLocation(e.target.value);
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
      <div className="calendar-overlay" onClick={() => setShowCalendar(false)}>
        <div className="calendar-container" onClick={(e) => e.stopPropagation()}>
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
      </div>
    );
  };

  return (
    <div className="main-content">
      <div className="filter-container">
        <div className="filter-category">
          <h3>By Location</h3>
          <div className="filter-item">
            <label htmlFor="location-select">Location:</label>
            <select
              id="location-select"
              value={selectedLocation}
              onChange={handleLocationChange}
              className="custom-select"
            >
              <option value="">Select a location</option>
              <option value="HeadOffice">Main Office</option>
              <option value="SubOffice">Sub Office</option>
            </select>
          </div>
        </div>

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
          <h3>Client Filters</h3>
          <div className="filter-year-toggle">
            <YearSelector selectedYear={selectedYear} onChange={handleYearChange} />
          </div>
          {renderCheckbox("selfEmployed", "Self Employed")}
          {renderCheckbox("foreignTaxFilingRequired", "Foreign Tax Filing Required")}
          {renderCheckbox("discountedReturn", "Discounted Return")}
          {renderCheckbox("gstDue", "GST Due")}
          {renderCheckbox("expectedRefund", "Expected Refund")}
          {renderCheckbox("payrollSlipsDue", "Payroll Slips Due")}
        </div>

        <div className="buttons">
          <button onClick={handleReset} className="reset-button">Reset</button>
          <button className="apply-button" onClick={applyFilters}>Apply</button>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <div className="tab-wrapper">
            <div className="tab">
              <button className={`tablinks ${activeTab === 'T1' ? 'active' : ''}`} onClick={() => setActiveTab('T1')}>T1</button>
              <button className={`tablinks ${activeTab === 'T2' ? 'active' : ''}`} onClick={() => setActiveTab('T2')}>T2</button>
              <button className={`tablinks ${activeTab === 'T3' ? 'active' : ''}`} onClick={() => setActiveTab('T3')}>T3</button>
            </div>
          </div>
          <button className="export-button" onClick={exportToCSV}>Export to CSV</button>
        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search Fields..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(0);
            }}
          />
        </div>
        {error && <div className="error-popup">{error}</div>}
        <APIController url={buildURL()} setData={setFilteredClients} />
        <div className="tabcontent active">
          <table className="custom-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className={column.className} onClick={() => requestSort(column.key)}>
                    {column.label} {sortConfig.key === column.key ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedClients.map((client, index) => (
                <tr key={index} onClick={() => handleClientClick(client.clientId)}>
                  {columns.map((column) => (
                    <td key={column.key} className={column.className}>
                      {column.key === 'lastUpdated'
                        ? formatDate(client[column.key])
                        : client[column.key] || 'N/A'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <ReactPaginate
            previousLabel={'‹'}
            nextLabel={'›'}
            breakLabel={'...'}
            pageCount={Math.max(Math.ceil(sortedClients.length / itemsPerPage), 1)}
            marginPagesDisplayed={1}
            pageRangeDisplayed={5}
            onPageChange={({ selected }) => setCurrentPage(selected)}
            containerClassName={'pagination'}
            activeClassName={'active'}
            disabledClassName={'disabled'}
            pageClassName={'page-item'}
            pageLinkClassName={'page-link'}
            previousClassName={'page-item'}
            previousLinkClassName={'page-link'}
            nextClassName={'page-item'}
            nextLinkClassName={'page-link'}
            breakClassName={'page-item'}
            breakLinkClassName={'page-link'}
            forcePage={Math.min(currentPage, Math.max(Math.ceil(sortedClients.length / itemsPerPage) - 1, 0))}
          />
        </div>
      </div>
    </div>
  );
};

export default FilterTable;
