import React, { useState, useEffect } from "react";
import VideoFeed from "./VideoFeed";
import VideoLesson from "./VideoLessons";
import { FaPlay, FaSearch, FaFilter, FaBookOpen, FaClock, FaStar } from "react-icons/fa";
import { FHOST } from "../constants/Functions";
import axios from "axios";

const VideoApp = ({ userInfo, darkMode }) => {
  const [currentComponent, setCurrentComponent] = useState("videoFeed");
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherVideos();
  }, []);

  useEffect(() => {
    filterVideos();
  }, [videos, searchTerm, selectedSubject, selectedTeacher]);

  const fetchTeacherVideos = async () => {
    try {
      // Backend provides preview videos at lessons/api/preview_videos
      const response = await axios.get(`${FHOST}/lessons/api/preview_videos`);
      setVideos(response.data.videos || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const filterVideos = () => {
    let filtered = videos;

    if (searchTerm) {
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.teacher_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSubject) {
      filtered = filtered.filter(video => video.subject === selectedSubject);
    }

    if (selectedTeacher) {
      filtered = filtered.filter(video => video.teacher_name === selectedTeacher);
    }

    setFilteredVideos(filtered);
  };

  const handleViewFullLesson = (videoId) => {
    setSelectedVideoId(videoId);
    setCurrentComponent("fullLesson");
  };

  const handleGoBack = () => {
    setCurrentComponent("videoFeed");
    setSelectedVideoId(null);
  };

  // Get unique subjects and teachers for filters
  const subjects = [...new Set(videos.map(video => video.subject))];
  const teachers = [...new Set(videos.map(video => video.teacher_name))];

  if (currentComponent === "fullLesson") {
    return (
      <div className="h-screen bg-white">
        <VideoLesson videoId={selectedVideoId} handleGoBack={handleGoBack} darkMode={darkMode} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">Video Content from Teachers</h1>
          <p className="text-lg text-gray-600">
            Access educational videos created by qualified teachers across various subjects
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search videos, teachers, or subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-4 py-3 rounded-lg border bg-white border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            className="px-4 py-3 rounded-lg border bg-white border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Teachers</option>
            {teachers.map(teacher => (
              <option key={teacher} value={teacher}>{teacher}</option>
            ))}
          </select>
        </div>

        {/* Video Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-xl mb-2">No videos found</p>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <div 
                key={video.id} 
                className="rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer bg-white hover:bg-gray-50"
                onClick={() => handleViewFullLesson(video.id)}
              >
                <div className="relative">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <FaPlay className="text-white text-4xl" />
                  </div>
                  <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                    {video.duration}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{video.title}</h3>
                  <p className="text-sm mb-3 line-clamp-2 text-gray-600">
                    {video.description}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-blue-600">
                      {video.teacher_name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {video.subject}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <FaStar className="text-yellow-500 mr-1" />
                      <span className="text-gray-600">
                        {video.rating}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <FaClock className="mr-1" />
                      <span className="text-gray-600">
                        {video.views} views
                      </span>
                    </div>
                  </div>

                  <div className="text-xs mt-2 text-gray-500">
                    Uploaded: {new Date(video.upload_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-12 p-6 rounded-xl bg-gray-50">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Video Library Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{videos.length}</div>
              <div className="text-sm text-gray-500">Total Videos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{subjects.length}</div>
              <div className="text-sm text-gray-500">Subjects</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{teachers.length}</div>
              <div className="text-sm text-gray-500">Teachers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {videos.reduce((total, video) => total + video.views, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Total Views</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoApp;
