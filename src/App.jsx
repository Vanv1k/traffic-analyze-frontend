import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import DroneSelector from './components/DroneSelector';
import DroneForm from './components/DroneForm';
import VideoUpload from './components/VideoUpload';
import DatabaseViewer from './components/DatabaseViewer';

function App() {
  const [selectedDrone, setSelectedDrone] = useState(null);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-blue-700 shadow-lg">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <Link to="/" className="text-white text-xl font-bold hover:text-blue-200 transition duration-200">
              Traffic Analysis
            </Link>
            <div className="space-x-6">
              <Link to="/add-drone" className="text-white hover:text-blue-200 transition duration-200">
                Add Drone
              </Link>
              <Link to="/db" className="text-white hover:text-blue-200 transition duration-200">
                View Database
              </Link>
            </div>
          </div>
        </nav>
        <div className="container mx-auto px-6 py-8">
          <Routes>
            <Route path="/" element={<div>
              <DroneSelector setSelectedDrone={setSelectedDrone} />
              {selectedDrone && <VideoUpload droneId={selectedDrone.drone_id} />}
            </div>} />
            <Route path="/add-drone" element={<DroneForm />} />
            <Route path="/db" element={<DatabaseViewer />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;