import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import DroneSelector from './components/DroneSelector';
import DroneForm from './components/DroneForm';
import VideoUpload from './components/VideoUpload';
import DatabaseViewer from './components/DatabaseViewer';
import Sidebar from './components/Sidebar';

function App() {
  const [selectedDrone, setSelectedDrone] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Боковое меню */}
        <Sidebar></Sidebar>
        
        {/* Основное содержимое */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Верхняя панель для мобильных */}
          <header className="bg-white shadow-sm md:hidden z-20">
            <div className="flex items-center justify-between px-4 py-3">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="text-indigo-600 hover:text-indigo-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <Link to="/" className="text-xl font-bold text-indigo-800">Traffic Analysis</Link>
              <div className="w-6"></div>
            </div>
          </header>
          {/* Контент */}
          <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
            <div className="max-w-6xl mx-auto">
              <Routes>
                <Route path="/" element={
                  <div className="space-y-8">
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6 border border-gray-100">
                      <DroneSelector setSelectedDrone={setSelectedDrone} />
                    </div>
                    {selectedDrone && (
                      <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6 border border-gray-100">
                        <VideoUpload droneId={selectedDrone.drone_id} />
                      </div>
                    )}
                  </div>
                } />
                
                <Route path="/add-drone" element={
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6 border border-gray-100">
                    <DroneForm />
                  </div>
                } />
                
                <Route path="/db" element={
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6 border border-gray-100">
                    <DatabaseViewer />
                  </div>
                } />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;