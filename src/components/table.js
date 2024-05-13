import React from 'react';
import './table.css';

function Table() {
  return (
    <div className="content">
      <table className="custom-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>SIN</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {[...Array(10)].map((_, index) => (
            <tr key={index}>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;