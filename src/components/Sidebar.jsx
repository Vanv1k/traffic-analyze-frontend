import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  return (
    <div className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-200 ease-in-out w-64 bg-indigo-800 shadow-xl z-30`}>
      <div className="flex flex-col h-full p-4">
        <div className="flex items-center justify-between p-4 border-b border-indigo-600">
          <Link to="/" className="text-white text-2xl font-bold hover:text-indigo-100 transition duration-200">
            <span className="block">Traffic</span>
            <span className="block">Analysis</span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-white hover:text-indigo-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <nav className="flex-1 mt-8 space-y-1">
          <Link 
            to="/" 
            className="flex items-center px-4 py-3 text-white hover:bg-indigo-700 rounded-lg transition-all duration-200 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Главная
          </Link>
          
          <Link 
            to="/add-drone" 
            className="flex items-center px-4 py-3 text-white hover:bg-indigo-700 rounded-lg transition-all duration-200 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Добавить дрон
          </Link>
          
          <Link 
            to="/db" 
            className="flex items-center px-4 py-3 text-white hover:bg-indigo-700 rounded-lg transition-all duration-200 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
            База данных
          </Link>
        </nav>
        
        <div className="p-4 border-t border-indigo-600">
          <div className="text-indigo-200 text-sm font-medium">v1.0.0</div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
