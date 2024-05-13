import React, { useState } from 'react';
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
  
  const t1Clients = clients.filter(client => client.productCode === 'T1');
  const t2Clients = clients.filter(client => client.productCode === 'T2');

  return (
    <div className="content">
      <div className="tab">
        <button className={`tablinks ${activeTab === 'T1' ? 'active' : ''}`} onClick={() => setActiveTab('T1')}>T1</button>
        <button className={`tablinks ${activeTab === 'T2' ? 'active' : ''}`} onClick={() => setActiveTab('T2')}>T2</button>
      </div>

      {activeTab === 'T1' && (
        <div className="tabcontent">
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
              {t1Clients.map((client, index) => (
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
        <div className="tabcontent">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Business Number</th>
                <th>Year End</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {t2Clients.map((client, index) => (
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
