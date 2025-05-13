import React, { useState } from 'react';
import axios from 'axios';

function VideoUpload({ droneId }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [outputPath, setOutputPath] = useState('');
  const [missionId, setMissionId] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a video file.');
      return;
    }

    const formData = new FormData();
    formData.append('drone_id', droneId); // Убедимся, что droneId — это число
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }, // Явно указываем тип данных
      });
      setMessage(response.data.message);
      setOutputPath(response.data.output_path);
      setMissionId(response.data.mission_id);

      if (response.data.mission_id) {
        const videoUrl = `http://localhost:8000/processed-video/${response.data.mission_id}`;
        setVideoUrl(videoUrl);
        console.log('Video URL set to:', videoUrl); // Отладка
      }
    } catch (error) {
      setMessage('Error uploading video: ' + (error.response?.data?.detail || error.message));
      console.error('Error details:', error.response?.data || error);
    }
  };

  return (
    <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Video</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          accept=".mp4,.mov"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full p-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition duration-200"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-200 shadow-sm"
        >
          Upload
        </button>
      </form>
      {message && <p className="mt-4 text-gray-800">{message}</p>}
 {videoUrl && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Обработанное видео</h3>
          <video
            width="600"
            controls
            crossOrigin="anonymous"
            className="rounded-lg shadow-md"
            onError={() =>
              setMessage('Ошибка загрузки видео. Возможно, файл поврежден или сервер его не отдает.')
            }
          >
            <source src={videoUrl} type="video/mp4" />
            Ваш браузер не поддерживает воспроизведение видео.
          </video>
        </div>
      )}
    </div>
  );
}

export default VideoUpload;