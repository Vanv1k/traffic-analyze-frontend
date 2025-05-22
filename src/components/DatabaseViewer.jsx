import React, { useState, useEffect } from 'react';
import axios from 'axios';

function DatabaseViewer() {
  const [table, setTable] = useState('tracked_objects');
  const [data, setData] = useState([]);
  const [classNames, setClassNames] = useState([]);
  const [missions, setMissions] = useState([]);
  const [drones, setDrones] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [classFilter, setClassFilter] = useState('');
  const [missionFilter, setMissionFilter] = useState('');
  const [droneFilter, setDroneFilter] = useState('');

  useEffect(() => {
    setCurrentPage(1); // Сброс страницы при смене таблицы
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

  // Пагинация
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-indigo-800 mb-6">Просмотр базы данных</h2>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Таблица:</label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            value={table}
            onChange={e => setTable(e.target.value)}
          >
            <option value="drones">Дроны</option>
            <option value="missions">Миссии</option>
            <option value="tracked_objects">Отслеживаемые объекты</option>
          </select>
        </div>

        {table === 'tracked_objects' && (
          <>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Класс объекта:</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={classFilter}
                onChange={e => setClassFilter(e.target.value)}
              >
                <option value="">Все классы</option>
                {classNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Миссия:</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={missionFilter}
                onChange={e => setMissionFilter(e.target.value)}
              >
                <option value="">Все миссии</option>
                {missions.map(mid => (
                  <option key={mid} value={mid}>Миссия {mid}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {table === 'missions' && (
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Дрон:</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={droneFilter}
              onChange={e => setDroneFilter(e.target.value)}
            >
              <option value="">Все дроны</option>
              {drones.map(dr => (
                <option key={dr.drone_id} value={dr.drone_id}>
                  {dr.drone_name} (ID: {dr.drone_id})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        {currentItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500 italic">
            Нет данных для отображения
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {Object.keys(currentItems[0]).map(col => (
                  <th 
                    key={col} 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  {Object.values(row).map((val, i) => (
                    <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Пагинация */}
      {filteredData.length > itemsPerPage && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Показано <span className="font-medium">{indexOfFirstItem + 1}</span> -{' '}
            <span className="font-medium">
              {Math.min(indexOfLastItem, filteredData.length)}
            </span>{' '}
            из <span className="font-medium">{filteredData.length}</span> записей
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-indigo-100 text-indigo-300 hover:bg-indigo-200'}`}
            >
              Назад
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => paginate(pageNum)}
                  className={`px-3 py-1 rounded-md ${currentPage === pageNum ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-300 hover:bg-indigo-200'}`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-indigo-100 text-indigo-300 hover:bg-indigo-200'}`}
            >
              Вперед
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DatabaseViewer;