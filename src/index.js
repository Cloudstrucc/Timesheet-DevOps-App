import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import TimesheetUploader from './components/TimesheetUploader';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <div className="min-h-screen bg-gray-50">
      <TimesheetUploader />
    </div>
  </React.StrictMode>
);