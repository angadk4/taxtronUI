import React, { useState } from 'react';
import ReactPaginate from 'react-paginate';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './filtertable.css';

const Returns = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);
  const itemsPerPage = 15;

  const columns = [
    { key: 'Tags', label: 'Tags' },
    { key: 'Name', label: 'Name' },
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

  return (
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
              />
            )}
          </div>
          <p className="date-range-display">
            From: {startDate ? startDate.toLocaleDateString() : 'Select a date'}<br />
            To: {endDate ? endDate.toLocaleDateString() : 'Select a date'}
          </p>
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
            </thead>
            <tbody>
              {/* Table rows will go here */}
            </tbody>
          </table>
          <ReactPaginate
            previousLabel={'‹'}
            nextLabel={'›'}
            breakLabel={'...'}
            pageCount={1} // Set dynamically based on data length
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
  );
};

export default Returns;
