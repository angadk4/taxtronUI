import React, { useState, useEffect, useMemo } from 'react';
import './table.css';
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

const Table = () => {
  const [activeTab, setActiveTab] = useState('T1');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <div className="content">
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
  );
};

export default Table;
