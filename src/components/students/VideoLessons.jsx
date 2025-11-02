import React, { useState, useRef, useEffect } from "react";
import { AiOutlineFileText, AiOutlineClose } from 'react-icons/ai';
import {
  FaUser,
  FaSave,
  FaStar,
  FaChevronDown,
  FaChevronUp,
  FaSearch,
  FaArrowLeft,
  FaRegHeart,
} from "react-icons/fa";
import Comments from "./Comments";
import { FHOST } from "../constants/Functions";
import axios from "axios";
import { fetchRating, rateVideo, reportContent } from "../constants/ApiRoute";

const VideoLesson = ({ videoId ,handleGoBack}) => {
  console.log(videoId,"thsi is the video id")
  
  const [expandedVideo, setExpandedVideo] = useState(null);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [paidVideos, setPaidVideos] = useState([]);
  const [showPaymentPrompt, setShowPaymentPrompt] = useState(false);
  const [currentVideoPrice, setCurrentVideoPrice] = useState(0);
  const videoRef = useRef(null);
  const [videoDurations, setVideoDurations] = useState({});
  const [videoRating, setVideoRating] = useState(0);
  const [videos, setVideos] = useState([]);
  const [savedVideos, setSavedVideos] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [reportContentText, setReportContentText] = useState('');
  const userId=1
  const [comments, setComments] = useState([
    {
      id: 1,
      text: "Great video! Learned a lot about algebra.",
      likes: 3,
      timeAgo: "2 hours ago",
      user: { name: "John Doe", profilePicture: "https://via.placeholder.com/40" },
      replies: [
        {
          user: { name: "Jane Smith", profilePicture: "https://via.placeholder.com/40" },
          text: "I agree, this was really helpful!",
          likes: 2,
          timeAgo: "1 hour ago",
        },
      ],
    },
    {
      id: 2,
      text: "The video was a bit too fast for me.",
      likes: 1,
      timeAgo: "4 hours ago",
      user: { name: "Alice Brown", profilePicture: "https://via.placeholder.com/40" },
      replies: [],
    },
  ]);
  const [isOpen, setIsOpen] = useState(false);
  
 

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => {
    setIsOpen(false);
    setReportContentText('');
    setErrorMessage('');
  };
  useEffect(() => {
    // Fetch videos from the API
    axios
      .get(`${FHOST}/lessons/api/preview_videos`)
      .then((response) => {
        const videoData = response.data.videos || [];
        setVideos(videoData);
      })
      .catch((error) => console.error('Error fetching videos:', error));
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // For reporting, use lessons/api/reports/<video_id>/<user_id>
      await reportContent(videoId, userId, reportContentText);
      alert('Report submitted successfully!');
      handleClose();
    } catch (error) {
      setErrorMessage('Failed to submit the report. Please try again.');
    }
  };
  useEffect(() => {
    if (videoId) {
      console.log("video id present");
      console.log(videos);
  
      // Ensure videos is an array and check if it's nested
      const videoArray = Array.isArray(videos) && Array.isArray(videos[0]) ? videos[0] : videos;
  
      // Find the video that matches the passed videoId
      const videoToExpand = videoArray.find((video) => parseInt(video.id, 10) === parseInt(videoId, 10));
      console.log(videoToExpand, "this is the video to expand");
  
      if (videoToExpand) {
        setExpandedVideo(videoToExpand);
        setCurrentVideoPrice(videoToExpand.price);
      }
    }
  }, [videoId, videos]);
  
  

  const filteredVideos = videos.filter((video) => {
    const title = video?.title?.toLowerCase() || '';
    const description = video?.description?.toLowerCase() || '';
    const search = searchQuery.toLowerCase();

    return title.includes(search) || description.includes(search);
  });

  const handleExpandVideo = (video) => {
    setExpandedVideo(video);
    setShowPaymentPrompt(false);
    setCurrentVideoPrice(video.price);
  };

  const handleCollapseVideo = () => {
    setExpandedVideo(null);
    setCommentsVisible(false);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video && !video.paused) {
      const watchedFraction = video.currentTime / video.duration;
      if (watchedFraction >= 0.2 && !paidVideos.includes(expandedVideo.id)) {
        video.pause();
        setShowPaymentPrompt(true);
      }
    }
  };

  const handlePayment = async () => {
    // Simulate API call to process payment
    const paymentStatus = true; // Replace with actual API call
    if (paymentStatus) {
      setPaidVideos((prev) => [...prev, expandedVideo.id]);
      setShowPaymentPrompt(false);
      videoRef.current.play();
    } else {
      alert("Payment failed. Please try again.");
    }
  };

  const attachDuration = (videoElement, videoId) => {
    if (videoElement) {
      videoElement.onloadedmetadata = () => {
        const duration = videoElement.duration;
        setVideoDurations((prev) => ({
          ...prev,
          [videoId]: formatTime(duration),
        }));
      };
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const getVideoDuration = (videoId) => {
    return videoDurations[videoId] || "0:00";
  };

  

  const handleSaveVideo = () => {
    setSavedVideos((prev) => [...prev, expandedVideo.id]);
  };

 
  
  const handleRateVideo = async (rating) => {
    try {
      setVideoRating(rating);
      await rateVideo(videoId, userId, rating);
      setVideoRating(rating);
    } catch (error) {
      console.error('Error rating video:', error);
    }
  };
  const getVideoRating = async (videoId, userId) => {
    try {
      const rating = await fetchRating(videoId, userId);
      
      if (rating !== null) {
        console.log(`User's rating: ${rating}`);
        setVideoRating(rating);
      } else {
        console.log('User has not rated this video.');
      }
    } catch (error) {
      console.error('Failed to fetch the rating:', error);
    }
  };
  const handleReportContent = async () => {
    try {
      await reportContent(videoId, userId, reportContentText);
      setReportContentText(''); // Reset report content input
      alert('Content reported successfully!');
    } catch (error) {
      console.error('Error reporting content:', error);
    }
  };
  useEffect(() => {
    getVideoRating(videoId,userId)
  }, [videoId, userId]); // Rerun the effect if videoId or userId changes
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {!expandedVideo && (
        <div className="mb-6">
          <div className="flex items-center bg-white shadow-md rounded-lg p-2">
            <FaSearch className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search videos by title or description..."
              className="w-full outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}

      {expandedVideo && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg overflow-hidden">
            <button
              onClick={handleGoBack}
              className="flex items-center text-white bg-blue-800 p-4 w-full hover:text-gray-800"
            >
              <FaArrowLeft className="mr-2" />
              Back to Video feed
            </button>

            <div className="relative aspect-video bg-black">
              <video
                className="w-full h-full object-cover"
                src={`${expandedVideo.video_url}`}
                controls
                ref={videoRef}
                controlsList="nodownload" // Hide extra controls
                onTimeUpdate={handleTimeUpdate}
              ></video>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {expandedVideo.title}
              </h3>
              <p className="text-gray-600 mb-4">{expandedVideo.description}</p>
              <p className="text-gray-800 font-semibold">Price: ${expandedVideo.price}</p>
              <div className="flex space-x-4">

                <button
                  onClick={handleSaveVideo}
                  className="mt-4 bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <FaSave className="mr-2" />
                  Save Video
                </button>
                <button
                  onClick={handleOpen}
                  className="mt-4 bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <AiOutlineFileText size={24} />
                </button>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold text-gray-800 mb-2">Rate this video:</h4>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      className={`cursor-pointer ${star <= videoRating ? "text-yellow-500" : "text-gray-300"}`}
                      onClick={() => handleRateVideo(star)}
                    />
                  ))}
                </div>
              </div>
              {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                  <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                    {/* Close Icon */}
                    <button
                      onClick={handleClose}
                      className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    >
                      <AiOutlineClose size={20} />
                    </button>
                    <h2 className="text-lg font-semibold mb-4">Report content</h2>

                    {errorMessage && (
                      <p className="text-red-500 text-sm mb-2">{errorMessage}</p>
                    )}

                    <form >
                      <div className="mb-4">
                        <label
                          htmlFor="reportContent"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Content
                        </label>
                        <textarea
                          id="reportContent"
                          value={reportContentText}
                          onChange={(e) => setReportContentText(e.target.value)}
                          required
                          rows="5"
                          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        ></textarea>
                      </div>
                      <button
                        type="button" // Change from "submit" to "button"
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                        onClick={handleReportContent}
                      >
                        Submit
                      </button>
                    </form>
                  </div>
                </div>
              )}
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-800 mb-2">Comments</h4>
                  <button
                    onClick={() => setCommentsVisible(!commentsVisible)}
                    className="text-blue-600 bg-white hover:bg-gray-50 flex items-center"
                  >
                    {commentsVisible ? (
                      <FaChevronUp className="mr-2" />
                    ) : (
                      <FaChevronDown className="mr-2" />
                    )}
                    {commentsVisible ? "Hide Comments" : "Show Comments"}
                  </button>
                </div>

                {commentsVisible && (
                 <Comments
                 comments={comments}
                 videoId={videoId}
                 userId={1}
               />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800">Related Videos</h3>
            {videos
              .filter((video) => video.id !== expandedVideo.id)
              .map((video) => (
                <div
                  key={video.id}
                  className="bg-white rounded-lg shadow-lg p-4 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleExpandVideo(video)}
                >
                  <h4 className="text-lg font-semibold text-gray-800">
                    {video.title}
                  </h4>
                  <p className="text-gray-600">{video.teacher}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoLesson;
