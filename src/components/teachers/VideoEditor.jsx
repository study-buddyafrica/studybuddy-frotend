import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaCut, FaDownload, FaExpand } from 'react-icons/fa';
import { FiScissors } from 'react-icons/fi';

const VideoEditor = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [startTrim, setStartTrim] = useState(0);
  const [endTrim, setEndTrim] = useState(10);
  const [duration, setDuration] = useState(0);
  const [videoSrc, setVideoSrc] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Video metadata loading
  useEffect(() => {
    const video = videoRef.current;
    const handleLoadedData = () => {
      setDuration(video.duration);
      setEndTrim(video.duration);
    };

    if (video) {
      video.addEventListener('loadeddata', handleLoadedData);
      return () => video.removeEventListener('loadeddata', handleLoadedData);
    }
  }, [videoSrc]);

  // Playback controls
  const handlePlayPause = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Timeline scrubbing
  const handleTimelineClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = percent * duration;
  };

  // Enhanced trim controls
  const handleTrimChange = (type, value) => {
    const time = parseFloat(value);
    if (type === 'start') {
      setStartTrim(Math.min(time, endTrim - 0.1));
    } else {
      setEndTrim(Math.max(time, startTrim + 0.1));
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space') handlePlayPause();
    };
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying]);

  return (
    <div className="min-h-screen bg-gray-50 font-josefin p-6">
      <div className={`max-w-6xl mx-auto ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-4' : ''}`}>
        {/* Header */}
        <h1 className="text-3xl font-lilita text-[#015575] mb-6">Video Editor</h1>

        {/* Video Container */}
        <div className="relative bg-gray-800 rounded-2xl overflow-hidden shadow-xl">
          {/* Video Preview */}
          <video
            ref={videoRef}
            className="w-full h-96 object-contain"
            onClick={handlePlayPause}
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {videoSrc && <source src={videoSrc} type="video/mp4" />}
          </video>

          {/* Overlay Controls */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={handlePlayPause}
              className="p-4 bg-[#015575] rounded-full shadow-lg hover:bg-[#01415e] transition"
            >
              {isPlaying ? (
                <FaPause className="h-8 w-8 text-white" />
              ) : (
                <FaPlay className="h-8 w-8 text-white" />
              )}
            </button>
          </div>

          {/* Timeline Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-90 p-4">
            <div className="relative h-12" onClick={handleTimelineClick}>
              {/* Progress Bar */}
              <div className="absolute inset-0 bg-gray-700 rounded-full">
                <div
                  className="bg-[#015575] h-full rounded-full"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>

              {/* Trim Markers */}
              <div
                className="absolute top-0 h-full bg-[#015575] bg-opacity-40"
                style={{
                  left: `${(startTrim / duration) * 100}%`,
                  width: `${((endTrim - startTrim) / duration) * 100}%`,
                }}
              />

              {/* Current Time Marker */}
              <div
                className="absolute top-0 w-2 h-full bg-white -ml-1"
                style={{ left: `${(currentTime / duration) * 100}%` }}
              />
            </div>

            {/* Time Display */}
            <div className="flex justify-between text-white mt-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Trim Controls */}
            <div className="space-y-4">
              <h3 className="text-xl font-lilita text-[#015575] flex items-center gap-2">
                <FiScissors /> Trim Controls
              </h3>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Start Time</label>
                <input
                  type="range"
                  min="0"
                  max={duration}
                  value={startTrim}
                  onChange={(e) => handleTrimChange('start', e.target.value)}
                  className="w-full range-slider"
                />
                <span className="text-sm">{formatTime(startTrim)}</span>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">End Time</label>
                <input
                  type="range"
                  min="0"
                  max={duration}
                  value={endTrim}
                  onChange={(e) => handleTrimChange('end', e.target.value)}
                  className="w-full range-slider"
                />
                <span className="text-sm">{formatTime(endTrim)}</span>
              </div>
            </div>

            {/* Advanced Controls */}
            <div className="space-y-4">
              <h3 className="text-xl font-lilita text-[#015575]">Tools</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Playback Speed</label>
                  <select
                    value={playbackRate}
                    onChange={(e) => {
                      videoRef.current.playbackRate = e.target.value;
                      setPlaybackRate(e.target.value);
                    }}
                    className="w-full p-2 border rounded-lg"
                  >
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                      <option key={speed} value={speed}>{speed}x</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Zoom</label>
                  <select
                    value={zoomLevel}
                    onChange={(e) => setZoomLevel(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  >
                    {[0.5, 0.75, 1, 1.25, 1.5].map((level) => (
                      <option key={level} value={level}>{level}x</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 mt-4">
                <button className="flex-1 bg-[#015575] text-white py-2 rounded-lg hover:bg-[#01415e] transition flex items-center justify-center gap-2">
                  <FaCut /> Split
                </button>
                <button className="flex-1 bg-[#015575] text-white py-2 rounded-lg hover:bg-[#01415e] transition flex items-center justify-center gap-2">
                  <FaDownload /> Export
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="mt-6 text-center">
          <label className="inline-block bg-[#015575] text-white px-6 py-3 rounded-xl hover:bg-[#01415e] transition cursor-pointer">
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoSrc(URL.createObjectURL(e.target.files[0]))}
              className="hidden"
            />
            Upload Video
          </label>
        </div>
      </div>
    </div>
  );
};

// Helper function to format time
const formatTime = (seconds) => {
  if (!seconds) return '00:00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [h, m, s].map((v) => (v < 10 ? `0${v}` : v)).join(':');
};

export default VideoEditor;