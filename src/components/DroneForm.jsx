import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function DroneForm() {
  const [droneName, setDroneName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post('http://localhost:8000/drones', { 
        drone_name: droneName, 
        description 
      });
      navigate('/');
    } catch (error) {
      console.error('Error creating drone:', error);
      setIsSubmitting(false);
    }
  };

  return (
  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4" style={{ minHeight: 'calc(100dvh - 160px)' }}>
      <div className="max-w-md mx-auto my-8"> 
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
            <h2 className="text-2xl font-bold text-white">Добавить новый дрон</h2>
            <p className="text-blue-100 mt-1">Заполните информацию о дроне</p>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название дрона <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={droneName}
                  onChange={e => setDroneName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="DJI Mavic 3"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                rows="4"
                placeholder="Технические характеристики, особенности..."
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${
                  isSubmitting 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                }`}
              >
                {isSubmitting ? 'Создание...' : 'Создать дрон'}
              </button>
            </div>
          </form>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
            <button 
              onClick={() => navigate('/')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Вернуться к списку
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DroneForm;