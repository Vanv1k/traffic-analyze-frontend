import React, { useState, useEffect } from 'react';
import axios from 'axios';

function DroneSelector({ setSelectedDrone }) {
  const [drones, setDrones] = useState([]);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8000/drones')
      .then(response => setDrones(response.data))
      .catch(error => console.error('Error fetching drones:', error));
  }, []);

  const handleSelect = (e) => {
    const droneId = parseInt(e.target.value);
    const drone = drones.find(d => d.drone_id === droneId);
    setSelected(droneId);
    setSelectedDrone(drone);
  };

  return (
    <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
      <label className="block text-gray-800 font-medium mb-2">Выберете дрон</label>
      <select
        value={selected}
        onChange={handleSelect}
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
      >
        <option value="">Список дронов</option>
        {drones.map(drone => (
          <option key={drone.drone_id} value={drone.drone_id}>{drone.drone_name}</option>
        ))}
      </select>
    </div>
  );
}

export default DroneSelector;