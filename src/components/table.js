import React from 'react';
import './table.css';
import clients from './clientdata.json';  // Import the JSON data

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
          {clients.map((client, index) => (
            <tr key={index}>
              <td>{`${client.firstnames} ${client.surname}`}</td>
              <td>{client.sin}</td>
              <td>{client.phoneNo}</td>
              <td>{client.email}</td>
              <td>{client.lastUpdated}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
