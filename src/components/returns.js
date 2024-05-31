import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import ReactPaginate from 'react-paginate';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './returns.css';

const Returns = () => {
  const { clientId } = useParams();
  const location = useLocation();
  const [clientInfo, setClientInfo] = useState(null);
  const [clientReturnsData, setClientReturnsData] = useState(location.state?.clientReturnsData || []);
  const [currentPage, setCurrentPage] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState('Cur Yr');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [checkBoxState, setCheckBoxState] = useState({
    selfEmployed: false,
    foreignTaxFilingRequired: false,
    discountedReturn: false,
    gstDue: false,
    expectedRefund: false,
    payrollSlipsDue: false,
  });
  const itemsPerPage = 15;

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const clientInfoResponse = await fetch(`/src/components/clientdata.json`);
        const clientInfoData = await clientInfoResponse.json();
        const client = clientInfoData.find(client => client.ClientId === clientId);
        setClientInfo(client);

        if (!clientReturnsData.length) {
          const clientReturnsResponse = await fetch(`/src/components/returndata/${clientId}.json`);
          const clientReturnsData = await clientReturnsResponse.json();
          setClientReturnsData(clientReturnsData);
        }
      } catch (error) {
        console.error('Error fetching client data:', error);
      }
    };
    fetchClientData();
  }, [clientId, clientReturnsData]);

  const columns = [
    { key: 'Tags', label: 'Tags' },
    { key: 'Firstnames', label: 'Name' },
    { key: 'Spouse', label: 'Spouse' },
    { key: 'FileStatus', label: 'File Status' },
    { key: 'LastUpdated', label: 'Last Updated' },
  ];

  const handleStartDateChange = (date) => {
    setStartDate(date);
    setIsStartOpen(false);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
    setIsEndOpen(false);
  };

  const handleCheckboxChange = (event) => {
    const { name } = event.target;
    setCheckBoxState((prevState) => ({
      ...prevState,
      [name]: !prevState[name],
    }));
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  const handleLocationChange = (e) => {
    setSelectedLocation(e.target.value);
  };

  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectedYear('Cur Yr');
    setSelectedLocation('');
    setCheckBoxState({
      selfEmployed: false,
      foreignTaxFilingRequired: false,
      discountedReturn: false,
      gstDue: false,
      expectedRefund: false,
      payrollSlipsDue: false,
    });
  };

  const applyFilters = () => {
    console.log('Applying filters...');
  };

  return (
    <div className="main-container">
      {clientInfo ? (
        <>
          <div className="client-info">
            <p><strong>Client Name</strong> <span>{clientInfo.Firstnames} {clientInfo.Surname}</span></p>
            <p><strong>Client ID</strong> <span>{clientId}</span></p>
            <p><strong>Phone Number</strong> <span>{clientInfo.PhoneNo}</span></p>
            <p><strong>Email</strong> <span>{clientInfo.Email}</span></p>
          </div>
          
          <div className="status-container">
            <div className="status-item">All <span className="status-count">0</span></div>
            <div className="status-item">Work in process <span className="status-count">0</span></div>
            <div className="status-item">Review Pending <span className="status-count">0</span></div>
            <div className="status-item">Accepted <span className="status-count">0</span></div>
            <div className="status-item">Paper Filed <span className="status-count">0</span></div>
          </div>

          <div className="main-content">
            <div className="filter-container">
              <div className="filter-category">
                <h3>Date Range</h3>
                <div className="date-picker-container">
                  <button className="date-button" onClick={() => setIsStartOpen(true)}>Select From Date</button>
                  {isStartOpen && (
                    <DatePicker
                      selected={startDate}
                      onChange={handleStartDateChange}
                      onClickOutside={() => setIsStartOpen(false)}
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                      inline
                      minDate={new Date(1990, 0, 1)}
                      maxDate={new Date()}
                      onCalendarOpen={() => {
                        if (startDate) {
                          setEndDate(startDate);
                        }
                      }}
                    />
                  )}
                </div>
                <div className="date-picker-container">
                  <button className="date-button" onClick={() => setIsEndOpen(true)}>Select To Date</button>
                  {isEndOpen && (
                    <DatePicker
                      selected={endDate}
                      onChange={handleEndDateChange}
                      onClickOutside={() => setIsEndOpen(false)}
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                      inline
                      minDate={startDate || new Date(1990, 0, 1)}
                      maxDate={new Date()}
                      openToDate={startDate}
                    />
                  )}
                </div>
                <p className="date-range-display">
                  <span>From: {startDate ? startDate.toLocaleDateString() : 'Select a date'}</span>
                  <span>To: {endDate ? endDate.toLocaleDateString() : 'Select a date'}</span>
                </p>
              </div>

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
                <h3>Client Filters</h3>
                <div className="filter-year-toggle">
                  <button
                    className={`year-button ${selectedYear === 'Cur Yr' ? 'active' : ''}`}
                    onClick={() => handleYearChange('Cur Yr')}
                  >
                    Current Year
                  </button>
                  <button
                    className={`year-button ${selectedYear === 'Prev Yr' ? 'active' : ''}`}
                    onClick={() => handleYearChange('Prev Yr')}
                  >
                    Previous Year
                  </button>
                </div>
                <div className="filter-item">
                  <label htmlFor="selfEmployed">Self Employed</label>
                  <input
                    type="checkbox"
                    id="selfEmployed"
                    name="selfEmployed"
                    checked={checkBoxState.selfEmployed}
                    onChange={handleCheckboxChange}
                  />
                </div>
                <div className="filter-item">
                  <label htmlFor="foreignTaxFilingRequired">Foreign Tax Filing Required</label>
                  <input
                    type="checkbox"
                    id="foreignTaxFilingRequired"
                    name="foreignTaxFilingRequired"
                    checked={checkBoxState.foreignTaxFilingRequired}
                    onChange={handleCheckboxChange}
                  />
                </div>
                <div className="filter-item">
                  <label htmlFor="discountedReturn">Discounted Return</label>
                  <input
                    type="checkbox"
                    id="discountedReturn"
                    name="discountedReturn"
                    checked={checkBoxState.discountedReturn}
                    onChange={handleCheckboxChange}
                  />
                </div>
                <div className="filter-item">
                  <label htmlFor="gstDue">GST Due</label>
                  <input
                    type="checkbox"
                    id="gstDue"
                    name="gstDue"
                    checked={checkBoxState.gstDue}
                    onChange={handleCheckboxChange}
                  />
                </div>
                <div className="filter-item">
                  <label htmlFor="expectedRefund">Expected Refund</label>
                  <input
                    type="checkbox"
                    id="expectedRefund"
                    name="expectedRefund"
                    checked={checkBoxState.expectedRefund}
                    onChange={handleCheckboxChange}
                  />
                </div>
                <div className="filter-item">
                  <label htmlFor="payrollSlipsDue">Payroll Slips Due</label>
                  <input
                    type="checkbox"
                    id="payrollSlipsDue"
                    name="payrollSlipsDue"
                    checked={checkBoxState.payrollSlipsDue}
                    onChange={handleCheckboxChange}
                  />
                </div>
              </div>

              <div className="buttons">
                <button onClick={handleReset} className="reset-button">Reset</button>
                <button className="apply-button" onClick={applyFilters}>Apply</button>
              </div>
            </div>

            <div className="table-container">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Search Fields..."
                  onChange={(e) => {
                    // Add search functionality here
                  }}
                />
              </div>
              <div className="tabcontent active">
                <table className="custom-table">
                  <thead>
                    <tr>
                      {columns.map((column) => (
                        <th key={column.key}>
                          {column.label}
                        </th>
                      ))}
                    </tr>
                    <tr>
                      <td>Tags</td>
                      <td>Name</td>
                      <td>Spouse</td>
                      <td>File Status</td>
                      <td>Last Updated</td>
                    </tr>
                  </thead>
                  <tbody>
                    {clientReturnsData.map((returnItem, index) => (
                      <tr key={index}>
                        {columns.map((column) => (
                          <td key={column.key}>
                            {column.key === 'LastUpdated'
                              ? new Date(returnItem[column.key]).toLocaleDateString()
                              : returnItem[column.key]}
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
                  pageCount={Math.ceil(clientReturnsData.length / itemsPerPage)}
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
                  forcePage={currentPage}
                />
              </div>
            </div>
          </div>
        </>
      ) : (
        <p>Loading client data...</p>
      )}
    </div>
  );
};

export default Returns;
