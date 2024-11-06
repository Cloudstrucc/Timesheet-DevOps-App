import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle, FileSpreadsheet, Loader } from 'lucide-react';

export default function TimesheetUploader() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(null);
  const [excelLink, setExcelLink] = useState(null);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setStatus(null);
    setExcelLink(null);

    const formData = new FormData();
    formData.append('workItems', file);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);

      if (response.ok) {
        const data = await response.json();
        setProgress(100);
        setStatus('success');
        setExcelLink(data.excelUrl);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      setStatus('error');
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Timesheet Work Items Upload</h1>
        <p className="text-gray-600">Upload your work items CSV to update the timesheet</p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6">
        <div className="text-center">
          <input
            type="file"
            accept=".csv"
            onChange={handleUpload}
            className="hidden"
            id="file-upload"
            disabled={uploading}
          />
          <label
            htmlFor="file-upload"
            className={`inline-flex items-center px-4 py-2 rounded-md text-white ${
              uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
            }`}
          >
            <Upload className="w-5 h-5 mr-2" />
            {uploading ? 'Uploading...' : 'Select CSV File'}
          </label>
        </div>

        {progress > 0 && (
          <div className="mt-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center mt-2 text-sm text-gray-600">
              {progress}% Complete
            </p>
          </div>
        )}
      </div>

      {status === 'error' && (
        <div className="mb-4 bg-red-50 p-4 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
            <div>
              <h3 className="text-red-800 font-medium">Error</h3>
              <p className="text-red-700">Failed to upload and process the work items. Please try again.</p>
            </div>
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="mb-4 bg-green-50 p-4 rounded-md">
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
            <div>
              <h3 className="text-green-800 font-medium">Success</h3>
              <p className="text-green-700">
                Work items uploaded and timesheet updated successfully.
                {excelLink && (
                  <a
                    href={excelLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-1" />
                    View Timesheet
                  </a>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {uploading && (
        <div className="flex justify-center items-center gap-2 text-gray-600">
          <Loader className="w-4 h-4 animate-spin" />
          Processing work items...
        </div>
      )}
    </div>
  );
}