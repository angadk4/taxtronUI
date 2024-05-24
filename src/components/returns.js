import React, { useState } from 'react';
import ReactPaginate from 'react-paginate';
import './filtertable.css';

const FilterTable = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 15;

  const columns = [
    { key: 'Name', label: 'Name' },
    { key: 'SIN', label: 'SIN' },
    { key: 'Phone', label: 'Phone' },
    { key: 'Email', label: 'Email' },
    { key: 'LastUpdated', label: 'Last Updated' },
  ];

  return (
    <div className="main-content">
      <div className="filter-container">
        <div className="filter-category">
          <h3>Date Range</h3>
          {/* Date Range Filter Section */}
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

export default FilterTable;
