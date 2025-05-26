import React, { useState, useEffect } from 'react';
import axios from 'axios';

function DatabaseViewer() {
  const [table, setTable] = useState('tracked_objects');
  const [data, setData] = useState([]);
  const [detectionCounts, setDetectionCounts] = useState({});
  const [filters, setFilters] = useState({
    classNames: [],
    missions: [],
    drones: [],
    classFilter: '',
    missionFilter: '',
    droneFilter: '',
    minSpeedFilter: '',
    minTimeFilter: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });
  const [loading, setLoading] = useState(false);

  const columnNames = {
    drones: {
      drone_id: 'ID дрона',
      drone_name: 'Название дрона',
      description: 'Описание'
    },
    missions: {
      mission_id: 'ID миссии',
      drone_id: 'ID дрона',
      drone_name: 'Дрон',
      video_path: 'Путь к видео',
      start_time: 'Время начала',
      fps: 'FPS',
      detection_count: 'Количество детекций',
      actions: 'Действия'
    },
    tracked_objects: {
      id: 'ID объекта',
      mission_id: 'ID миссии',
      tracker_id: 'ID трекера',
      class_name: 'Класс объекта',
      first_frame_number: 'Первый кадр',
      first_seen_timestamp: 'Время обнаружения',
      avg_speed_kmh: 'Средняя скорость (км/ч)'
    }
  };

  const classTranslations = {
    'car': 'Автомобиль',
    'truck': 'Грузовик',
    'bus': 'Автобус',
    'van': 'Минивэн',
  };

  const hiddenColumns = {
    drones: [],
    missions: ['video_path'],
    tracked_objects: ['bbox_x', 'bbox_y', 'bbox_width', 'bbox_height']
  };


  const formatDateTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(',', '');
    } catch (e) {
      return isoString;
    }
  };

  useEffect(() => {
    const loadFilters = async () => {
      try {
        if (table === 'tracked_objects') {
          const [classRes, missionRes] = await Promise.all([
            axios.get('http://localhost:8000/filters/?type=class_names'),
            axios.get('http://localhost:8000/filters/?type=mission_ids')
          ]);
          setFilters(prev => ({
            ...prev,
            classNames: classRes.data,
            missions: missionRes.data
          }));
        } else if (table === 'missions') {
          const droneRes = await axios.get('http://localhost:8000/filters/?type=drone_ids');
          setFilters(prev => ({
            ...prev,
            drones: droneRes.data
          }));
        }
      } catch (err) {
        console.error('Ошибка загрузки фильтров:', err);
      }
    };

    loadFilters();
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [table]);

  useEffect(() => {
    if (table === 'missions') {
      const fetchDetectionCounts = async () => {
        try {
          const response = await axios.get('http://localhost:8000/detection_counts/');
          setDetectionCounts(response.data);
        } catch (err) {
          console.error('Ошибка загрузки количества детекций:', err);
        }
      };
      fetchDetectionCounts();
    }
  }, [table]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = {
          table,
          limit: pagination.limit,
          page: pagination.page
        };

        if (table === 'missions') {
          params.join = 'drones';
          if (filters.droneFilter) params.drone_id = filters.droneFilter;
        } else if (table === 'tracked_objects') {
          if (filters.classFilter) params.class_name = filters.classFilter;
          if (filters.missionFilter) params.mission_id = filters.missionFilter;
          if (filters.minSpeedFilter) params.min_speed = filters.minSpeedFilter;
          if (filters.minTimeFilter) params.min_time = filters.minTimeFilter;
        }

        const response = await axios.get('http://localhost:8000/data/', { params });
        
        let processedData = response.data.data.map(item => {
          const formattedItem = {...item};
          if (item.first_seen_timestamp) {
            formattedItem.first_seen_timestamp = formatDateTime(item.first_seen_timestamp);
          }
          if (item.start_time) {
            formattedItem.start_time = formatDateTime(item.start_time);
          }
          return formattedItem;
        });

        if (table === 'missions') {
          processedData = processedData.map(mission => ({
            ...mission,
            detection_count: detectionCounts[mission.mission_id] || 0
          }));
        }

        setData(processedData);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.total_pages
        }));
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [table, filters, pagination.page, pagination.limit, detectionCounts]);


  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };


  const getVisibleColumns = () => {
    if (data.length === 0) return [];
    const allColumns = Object.keys(data[0]);

    if (table === 'missions' && !allColumns.includes('actions')) {
      allColumns.push('actions');
    }
    
    return allColumns.filter(col => !hiddenColumns[table]?.includes(col));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const openMissionVideo = (missionId) => {
    window.open(`http://localhost:8000/processed-video/${missionId}`, '_blank');
  };

  const downloadMissionVideo = (missionId, filename) => {
    const link = document.createElement('a');
    link.href = `http://localhost:8000/processed-video/${missionId}`;
    link.download = filename || `mission_${missionId}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-indigo-800 mb-6">Просмотр базы данных</h2>

      {/* Выбор таблицы и фильтры */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Таблица:</label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            value={table}
            onChange={(e) => setTable(e.target.value)}
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
                value={filters.classFilter}
                onChange={(e) => handleFilterChange('classFilter', e.target.value)}
              >
                <option value="">Все классы</option>
                {filters.classNames.map((name) => (
                  <option key={name} value={name}>
                    {classTranslations[name] || name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Миссия:</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={filters.missionFilter}
                onChange={(e) => handleFilterChange('missionFilter', e.target.value)}
              >
                <option value="">Все миссии</option>
                {filters.missions.map((mid) => (
                  <option key={mid} value={mid}>
                    Миссия {mid}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Мин. скорость (км/ч):</label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Минимальная скорость"
                value={filters.minSpeedFilter}
                onChange={(e) => handleFilterChange('minSpeedFilter', e.target.value)}
                min="0"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Обнаружено после:</label>
              <input
                type="datetime-local"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={filters.minTimeFilter}
                onChange={(e) => handleFilterChange('minTimeFilter', e.target.value)}
              />
            </div>
          </>
        )}

        {table === 'missions' && (
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Дрон:</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={filters.droneFilter}
              onChange={(e) => handleFilterChange('droneFilter', e.target.value)}
            >
              <option value="">Все дроны</option>
              {filters.drones.map((drone) => (
                <option key={drone.drone_id} value={drone.drone_id}>
                  {drone.drone_name} (ID: {drone.drone_id})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Таблица с данными */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Загрузка данных...</div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center text-gray-500 italic">
            Нет данных для отображения
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {getVisibleColumns().map((col) => (
                  <th
                    key={col}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {columnNames[table]?.[col] || col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  {getVisibleColumns().map((col) => {
                    if (col === 'actions' && table === 'missions') {
                      return (
                        <td key={col} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => downloadMissionVideo(row.mission_id, row.video_path?.split('/').pop())}
                              className="px-3 py-1 bg-green-100 text-green-300 rounded-md hover:bg-green-200"
                            >
                              Скачать
                            </button>
                          </div>
                        </td>
                      );
                    }
                    
                    return (
                      <td key={col} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {col === 'class_name' ? classTranslations[row[col]] || row[col] : 
                         col === 'avg_speed_kmh' ? `${row[col]} км/ч` : 
                         col === 'detection_count' ? row[col] || 0 :
                         row[col]}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Пагинация */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Показано <span className="font-medium">
              {(pagination.page - 1) * pagination.limit + 1}
            </span> -{' '}
            <span className="font-medium">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            из <span className="font-medium">{pagination.total}</span> записей
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={`px-3 py-1 rounded-md ${
                pagination.page === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-100 text-indigo-300 hover:bg-indigo-200'
              }`}
            >
              Назад
            </button>

            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-1 rounded-md ${
                    pagination.page === pageNum
                      ? 'bg-indigo-600 text-white'
                      : 'bg-indigo-100 text-indigo-300 hover:bg-indigo-200'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className={`px-3 py-1 rounded-md ${
                pagination.page === pagination.totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-100 text-indigo-300 hover:bg-indigo-200'
              }`}
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