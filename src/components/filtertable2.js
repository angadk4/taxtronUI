import React, { useState, useMemo, useEffect, useCallback } from 'react';
import ReactPaginate from 'react-paginate';
import './filtertable.css';
import clientsData from './clientdata.json';
import { parseISO, format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import APIController from './clientfetch';

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

const normalizeString = (str) => str.toLowerCase().replace(/\\s+/g, ' ').trim();

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
  const itemsPerPage = 15;

  const months = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('en-US', { month: 'long' }))
  , []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(0);
    handleReset();
  };

  const buildLink = () => {
    let link = `https://ds.taxtron.ca/clientsearch/getclientsdata/000779638e3141fcb06a56bdc5cc484e?Prod=${activeTab}`;

    if (searchQuery) {
      link += `&SearchText=${encodeURIComponent(searchQuery)}`;
    }

    Object.entries(appliedFilters).forEach(([key, value]) => {
      if (value) {
        link += `&FilterText=${encodeURIComponent(key)}=true`;
      }
    });

    link += `&Size=${itemsPerPage}`;

    if (currentPage > 0) {
      link += `&Skip=${currentPage * itemsPerPage}`;
    }

    return link;
  };

  const applyFilters = () => {
    const filters = {
      selectedBirthMonth,
      selectedBirthDate,
      checkBoxState,
      filterYear: selectedYear,
      selectedLocation,
    };
    setAppliedFilters(filters);
    setCurrentPage(0);
    fetchClients(buildLink());
  };

  const fetchClients = (link) => {
    setFilteredClients([]);
    APIController({ url: link, setData: setFilteredClients });
  };

  useEffect(() => {
    fetchClients(buildLink());
  }, [activeTab, appliedFilters, currentPage]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchClients(buildLink());
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

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
      console.log('Response text:', responseText); // Log the response text
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const clientReturnsData = JSON.parse(responseText); // Parse the response text as JSON
      navigate(`/returns/${clientId}`, { state: { clientReturnsData } });
    } catch (error) {
      setError('Error fetching client return data.');
      console.error('Fetch error:', error); // Log the error to the console for debugging
      setTimeout(() => setError(''), 3000);
    }
  };

  const exportToCSV = () => {
    const csvData = sortedClients.map(client => {
      const { ClientId, Firstnames, Surname, SIN, PhoneNo, Email, LastUpdated, ...rest } = client;
      const csvRow = {
        Name: `${Firstnames} ${Surname}`,
        SIN,
        Phone: PhoneNo,
        Email,
        'Last Updated': formatDate(LastUpdated),
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

  const columns = activeTab === 'T1' || activeTab === 'T3'
    ? [
        { key: 'Firstnames', label: 'Name', className: 'name' },
        { key: 'SIN', label: 'SIN', className: 'sin' },
        { key: 'PhoneNo', label: 'Phone', className: 'phone' },
        { key: 'Email', label: 'Email', className: 'email' },
        { key: 'LastUpdated', label: 'Last Updated', className: 'last-updated' },
      ]
    : [
        { key: 'CompanyName', label: 'Company Name', className: 'name' },
        { key: 'BNFull', label: 'Business Number', className: 'sin' },
        { key: 'FYEnd', label: 'Year End', className: 'phone' },
        { key: 'LastUpdated', label: 'Last Updated', className: 'last-updated' },
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
              <button className={`tablinks ${activeTab === 'T1' ? 'active' : ''}`} onClick={() => handleTabChange('T1')}>T1</button>
              <button className={`tablinks ${activeTab === 'T2' ? 'active' : ''}`} onClick={() => handleTabChange('T2')}>T2</button>
              <button className={`tablinks ${activeTab === 'T3' ? 'active' : ''}`} onClick={() => handleTabChange('T3')}>T3</button>
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
              {filteredClients.map((client, index) => (
                <tr key={index} onClick={() => handleClientClick(client.ClientId)}>
                  {columns.map((column) => (
                    <td key={column.key} className={column.className}>
                      {column.key === 'Firstnames'
                        ? `${client.Firstnames} ${client.Surname}`
                        : column.key === 'LastUpdated'
                        ? formatDate(client[column.key])
                        : client[column.key]}
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
            pageCount={Math.max(Math.ceil(filteredClients.length / itemsPerPage), 1)}
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
            forcePage={Math.min(currentPage, Math.max(Math.ceil(filteredClients.length / itemsPerPage) - 1, 0))}
          />
        </div>
      </div>
    </div>
  );
};

export default FilterTable;
