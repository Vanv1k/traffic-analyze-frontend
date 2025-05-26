import React, { useState } from 'react';
import axios from 'axios';

function VideoUpload({ droneId }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');
  const [fileName, setFileName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Пожалуйста, выберите видео файл');
      return;
    }

    setIsProcessing(true);
    setMessage('');
    setVideoUrl('');
    setFileName(file.name);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('drone_id', droneId);
    formData.append('file', file);

    try {
      const uploadResponse = await axios.post('http://localhost:8000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });

      setMessage('Видео загружено. Начата обработка...');
      
      if (uploadResponse.data.mission_id) {
        trackProcessing(uploadResponse.data.mission_id);
      }
    } catch (error) {
      setMessage('Ошибка загрузки: ' + (error.response?.data?.detail || error.message));
      setIsProcessing(false);
    }
  };

  const trackProcessing = async (missionId) => {
    try {
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress = Math.min(progress + Math.random() * 10, 95);
        setUploadProgress(progress);
      }, 1000);

      const checkVideo = async () => {
        try {
          const videoUrl = `http://localhost:8000/processed-video/${missionId}`;
          const response = await axios.head(videoUrl);
          
          if (response.status === 200) {
            clearInterval(progressInterval);
            setUploadProgress(100);
            setTimeout(() => {
              setVideoUrl(videoUrl);
              setIsProcessing(false);
              setMessage('Обработка завершена!');
            }, 500);
          } else {
            setTimeout(checkVideo, 3000);
          }
        } catch (error) {
          setTimeout(checkVideo, 3000);
        }
      };

      checkVideo();
    } catch (error) {
      setMessage('Ошибка при проверке статуса обработки');
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Загрузка видео</h2>
        <p className="text-gray-600 mt-1">Загрузите видео для анализа трафика</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Видео файл (MP4, MOV)
          </label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col w-full h-32 border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-lg cursor-pointer transition duration-200">
              <div className="flex flex-col items-center justify-center pt-7">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="pt-1 text-sm text-gray-600">
                  {file ? file.name : 'Перетащите файл или кликните для выбора'}
                </p>
              </div>
              <input
                type="file"
                accept=".mp4,.mov"
                onChange={(e) => setFile(e.target.files[0])}
                className="opacity-0"
              />
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isProcessing || !file}
          className={`w-full py-3 px-4 rounded-lg shadow-sm text-white font-medium focus:outline-none transition duration-200 ${
            isProcessing || !file
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isProcessing ? 'Обработка...' : 'Загрузить видео'}
        </button>

        {isProcessing && (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Прогресс: {uploadProgress}%</span>
              <span>{fileName}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">
                {uploadProgress < 100 ? (
                  <>
                    <span className="inline-block animate-pulse">Обработка видео</span>
                    <span className="animate-pulse delay-100">.</span>
                    <span className="animate-pulse delay-200">.</span>
                    <span className="animate-pulse delay-300">.</span>
                  </>
                ) : (
                  'Финальные приготовления...'
                )}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Это может занять несколько минут в зависимости от длины видео
              </p>
            </div>
          </div>
        )}

        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.includes('Ошибка') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
            }`}
          >
            {message}
          </div>
        )}
      </form>

      {videoUrl && (
        <div className="mt-8 animate-fade-in">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Результат обработки</h3>
            <p className="text-sm text-gray-600">Анализ трафика завершен</p>
          </div>
          <div className="bg-black rounded-lg overflow-hidden shadow-lg">
            <video
              controls
              autoPlay
              muted
              className="w-full"
              onError={() =>
                setMessage('Ошибка воспроизведения видео. Попробуйте обновить страницу.')
              }
            >
              <source src={videoUrl} type="video/mp4" />
              Ваш браузер не поддерживает воспроизведение видео.
            </video>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoUpload;