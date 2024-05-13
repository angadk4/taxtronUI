import React, { useState, useEffect } from 'react';
import './table.css';
import clients from './clientdata.json';
import { parseISO, format } from 'date-fns';

function formatDate(dateStr) {
  let parsedDate;
  if (dateStr.includes('T')) {
    parsedDate = parseISO(dateStr);
  } else {
    const parts = dateStr.split(' ');
    const date = parts[0].split('/').map(num => parseInt(num, 10));
    let [hours, minutes, seconds] = parts[1].split(':').map(num => parseInt(num, 10));

    if (parts[2] === 'PM' && hours !== 12) {
      hours += 12;
    } else if (parts[2] === 'AM' && hours === 12) {
      hours = 0;
    }

    parsedDate = new Date(date[2], date[0] - 1, date[1], hours, minutes, seconds);
  }
  return format(parsedDate, 'yyyy/MM/dd HH:mm:ss');
}

function Table() {
  const [activeTab, setActiveTab] = useState('T1');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const t1Clients = clients.filter(client => client.productCode === 'T1');
  const t2Clients = clients.filter(client => client.productCode === 'T2');

  const sortedClients = (clients) => {
    if (sortConfig.key) {
      return [...clients].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return clients;
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const renderTableHeader = (columns) => {
    return columns.map((column) => (
      <th key={column.key} onClick={() => requestSort(column.key)}>
        {column.label} {sortConfig.key === column.key ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
      </th>
    ));
  };

  useEffect(() => {
    const tabContent = document.querySelector('.tabcontent.active');
    tabContent.classList.add('fade-in');
    const timer = setTimeout(() => tabContent.classList.remove('fade-in'), 500);
    return () => clearTimeout(timer);
  }, [activeTab]);

  useEffect(() => {
    const tableBody = document.querySelector('.custom-table tbody');
    tableBody.classList.add('fade-in');
    const timer = setTimeout(() => tableBody.classList.remove('fade-in'), 500);
    return () => clearTimeout(timer);
  }, [sortConfig]);

  return (
    <div className="content">
      <div className="tab">
        <button className={`tablinks ${activeTab === 'T1' ? 'active' : ''}`} onClick={() => setActiveTab('T1')}>T1</button>
        <button className={`tablinks ${activeTab === 'T2' ? 'active' : ''}`} onClick={() => setActiveTab('T2')}>T2</button>
      </div>

      {activeTab === 'T1' && (
        <div className="tabcontent active">
          <table className="custom-table">
            <thead>
              <tr>
                {renderTableHeader([
                  { key: 'firstnames', label: 'Name' },
                  { key: 'sin', label: 'SIN' },
                  { key: 'phoneNo', label: 'Phone' },
                  { key: 'email', label: 'Email' },
                  { key: 'lastUpdated', label: 'Last Updated' },
                ])}
              </tr>
            </thead>
            <tbody>
              {sortedClients(t1Clients).map((client, index) => (
                <tr key={index}>
                  <td>{`${client.firstnames} ${client.surname}`}</td>
                  <td>{client.sin}</td>
                  <td>{client.phoneNo}</td>
                  <td>{client.email}</td>
                  <td>{formatDate(client.lastUpdated)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'T2' && (
        <div className="tabcontent active">
          <table className="custom-table">
            <thead>
              <tr>
                {renderTableHeader([
                  { key: 'companyName', label: 'Company Name' },
                  { key: 'bnFull', label: 'Business Number' },
                  { key: 'fyEnd', label: 'Year End' },
                  { key: 'lastUpdated', label: 'Last Updated' },
                ])}
              </tr>
            </thead>
            <tbody>
              {sortedClients(t2Clients).map((client, index) => (
                <tr key={index}>
                  <td>{client.companyName}</td>
                  <td>{client.bnFull}</td>
                  <td>{client.fyEnd}</td>
                  <td>{formatDate(client.lastUpdated)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Table;
