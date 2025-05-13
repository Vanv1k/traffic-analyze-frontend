import React, { useState, useEffect } from 'react';
import axios from 'axios';

function DatabaseViewer() {
  const [table, setTable] = useState('tracked_objects');
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    axios.get(`http://localhost:8000/db?table=${table}`)
      .then(response => setData(response.data))
      .catch(error => console.error('Error fetching data:', error));
  }, [table]);

  const filteredData = filter
    ? data.filter(row => row.class_name && row.class_name.toLowerCase().includes(filter.toLowerCase()))
    : data;

  const handleExport = () => {
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${table}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Database Viewer</h2>
      <div className="mb-6">
        <label className="block text-gray-800 font-medium mb-2">Select Table</label>
        <select
          value={table}
          onChange={e => setTable(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
        >
          <option value="drones">Drones</option>
          <option value="missions">Missions</option>
          <option value="tracked_objects">Tracked Objects</option>
        </select>
      </div>
      {table === 'tracked_objects' && (
        <div className="mb-6">
          <label className="block text-gray-800 font-medium mb-2">Filter by Class</label>
          <input
            type="text"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            placeholder="e.g., car"
          />
        </div>
      )}
      <button
        onClick={handleExport}
        className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-200 shadow-sm mb-6"
      >
        Export to CSV
      </button>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              {data[0] && Object.keys(data[0]).map(key => (
                <th key={key} className="border border-gray-300 p-3 text-gray-800 font-semibold">{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => (
              <tr key={index} className="border border-gray-300 hover:bg-gray-50 transition duration-200">
                {Object.values(row).map((value, i) => (
                  <td key={i} className="border border-gray-300 p-3 text-gray-700">{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DatabaseViewer;