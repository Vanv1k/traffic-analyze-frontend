import React, { useState, useEffect } from 'react';
import axios from 'axios';

function DatabaseViewer() {
  const [table, setTable] = useState('tracked_objects');
  const [data, setData] = useState([]);
  const [classNames, setClassNames] = useState([]);
  const [missions, setMissions] = useState([]);
  const [drones, setDrones] = useState([]);

  const [classFilter, setClassFilter] = useState('');
  const [missionFilter, setMissionFilter] = useState('');
  const [droneFilter, setDroneFilter] = useState('');

  useEffect(() => {
    if (table === 'tracked_objects') {
      axios.get('http://localhost:8000/filters/class_names').then(res => setClassNames(res.data));
      axios.get('http://localhost:8000/filters/mission_ids').then(res => setMissions(res.data));
    }
    if (table === 'missions') {
      axios.get('http://localhost:8000/filters/drone_ids').then(res => setDrones(res.data));
    }
  }, [table]);

  useEffect(() => {
    axios.get(`http://localhost:8000/db?table=${table}`)
      .then(res => setData(res.data))
      .catch(err => console.error('Error:', err));
  }, [table]);

  const filteredData = data.filter(row => {
    if (table === 'tracked_objects') {
      return (!classFilter || row.class_name === classFilter) &&
             (!missionFilter || row.mission_id === parseInt(missionFilter));
    }
    if (table === 'missions') {
      return (!droneFilter || row.drone_id === parseInt(droneFilter));
    }
    return true;
  });

  return (
    <div className="p-6 bg-gray-100 min-h-screen text-gray-900">
      <h2 className="text-2xl font-bold mb-6">Database Viewer</h2>

      <div className="mb-4">
        <label className="mr-2 font-medium">Table:</label>
        <select
          className="p-2 border rounded"
          value={table}
          onChange={e => setTable(e.target.value)}
        >
          <option value="drones">Drones</option>
          <option value="missions">Missions</option>
          <option value="tracked_objects">Tracked Objects</option>
        </select>
      </div>

      {table === 'tracked_objects' && (
        <>
          <div className="mb-2">
            <label className="mr-2 font-medium">Class:</label>
            <select
              className="p-2 border rounded"
              value={classFilter}
              onChange={e => setClassFilter(e.target.value)}
            >
              <option value="">All</option>
              {classNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div className="mb-2">
            <label className="mr-2 font-medium">Mission:</label>
            <select
              className="p-2 border rounded"
              value={missionFilter}
              onChange={e => setMissionFilter(e.target.value)}
            >
              <option value="">All</option>
              {missions.map(mid => (
                <option key={mid} value={mid}>Mission {mid}</option>
              ))}
            </select>
          </div>
        </>
      )}

      {table === 'missions' && (
        <div className="mb-2">
          <label className="mr-2 font-medium">Drone:</label>
          <select
            className="p-2 border rounded"
            value={droneFilter}
            onChange={e => setDroneFilter(e.target.value)}
          >
            <option value="">All</option>
            {drones.map(dr => (
              <option key={dr.drone_id} value={dr.drone_id}>
                {dr.drone_name} (ID: {dr.drone_id})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="overflow-x-auto mt-6">
        {filteredData.length === 0 ? (
          <p className="text-gray-500 italic">Нет данных для отображения.</p>
        ) : (
          <table className="min-w-full border border-gray-300 text-sm text-left">
            <thead className="bg-gray-200 text-gray-900">
              <tr>
                {Object.keys(filteredData[0]).map(col => (
                  <th key={col} className="p-2 border font-semibold">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {Object.values(row).map((val, i) => (
                    <td key={i} className="p-2 border">{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default DatabaseViewer;
