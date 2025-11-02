import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { FHOST } from '../constants/Functions';
import { FaShare, FaPause, FaHeart, FaExpand, FaCog } from 'react-icons/fa';

const VideoFeed = ({ onViewFullLesson }) => {
  const [videos, setVideos] = useState([
    {
      id: 1,
      video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      username: 'User1',
      caption: 'This is a sample video 1',
      video_id: '1',
    },
    {
      id: 2,
      video_url: 'https://www.w3schools.com/html/movie.mp4',
      username: 'User2',
      caption: 'This is a sample video 2',
      video_id: '2',
    },
    {
      id: 3,
      video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      username: 'User3',
      caption: 'This is a sample video 3',
      video_id: '3',
    },
  ]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const videoRefs = useRef([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [showPauseIcon, setShowPauseIcon] = useState(false);
  const [showQualityOptions, setShowQualityOptions] = useState(null);

  const fetchVideos = useCallback(async (page) => {
    if (!hasMore || loading) return;
    setLoading(true);
    try {
      const response = await axios.get(`${FHOST}/lessons/api/preview_videos?page=${page}`);
      const newVideos = response.data.videos;
      setVideos((prev) => [...prev, ...newVideos]);
      setTotalPages(response.data.total_pages);
      setHasMore(page < response.data.total_pages);
    } catch (error) {
      console.error('Error fetching video feed:', error);
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading]);

  useEffect(() => {
    fetchVideos(page);
  }, [page, fetchVideos]);

  const togglePlayPause = useCallback((index) => {
    const videoElement = videoRefs.current[index];
    if (videoElement) {
      if (videoElement.paused) {
        videoElement.play();
        setShowPauseIcon(false);
        setCurrentVideo(index);
      } else {
        videoElement.pause();
        setShowPauseIcon(true);
        setTimeout(() => setShowPauseIcon(false), 1000);
      }
    }
  }, []);

  /*
  const changeQuality = useCallback((index, quality) => {
    const videoElement = videoRefs.current[index];
    if (videoElement) {
      const baseUrl = videos[index].video_url.split('.')[0];
      videoElement.src = `${baseUrl}_${quality}.mp4`;
      videoElement.load();

      videoElement.oncanplay = () => {
        videoElement.play();
      };
    }
  }, [videos]);
  */

  return (
    <div className="relative w-full h-screen bg-black overflow-y-scroll snap-y snap-mandatory scroll-smooth">
      {videos.map((video, index) => (
        <div
          className="flex justify-center items-center w-full h-screen bg-gray-900 relative mb-4 rounded-lg border border-gray-700 shadow-lg snap-start"
          key={video.id}
          onClick={() => togglePlayPause(index)}
        >
          <video
            ref={(el) => (videoRefs.current[index] = el)}
            className="w-full h-full object-contain"
            src={video.video_url}
            controls={false}
            loop
          />
          {currentVideo === index && showPauseIcon && (
            <div className="absolute inset-0 flex justify-center items-center">
              <FaPause className="text-white text-6xl bg-black bg-opacity-50 p-4 rounded-full" />
            </div>
          )}
          <div className="absolute bottom-20 right-2 flex flex-col items-center space-y-4 text-white">
            <button className="text-3xl hover:text-red-500">
              <FaHeart />
            </button>
            <button className="text-3xl hover:text-green-500" onClick={() => onViewFullLesson(video.video_id)}>
              <FaShare />
            </button>
            <button className="text-3xl hover:text-blue-500" onClick={(e) => {
              e.stopPropagation();
              videoRefs.current[index].requestFullscreen();
            }}>
              <FaExpand />
            </button>
            <button
              className="text-3xl hover:text-gray-400"
              onClick={(e) => {
                e.stopPropagation();
                setShowQualityOptions(showQualityOptions === index ? null : index);
              }}
            >
              <FaCog />
            </button>
            {showQualityOptions === index && (
              <div className="absolute bottom-10 right-10 bg-gray-700 p-2 rounded-md">
                <button className="text-white block">720p</button>
                <button className="text-white block">480p</button>
                <button className="text-white block">360p</button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoFeed;
