import React, { useState, useRef, useEffect } from "react";
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



const VideoLesson = () => {
  const initialvideos = [
    {
      id: 1,
      title: "Understanding Algebra Basics",
      description: "Learn the fundamentals of algebra in this comprehensive lesson.",
      teacher: "John Doe",
      price: 10, // Price in dollars
    },
    {
      id: 2,
      title: "Introduction to Geometry",
      description: "Explore the basics of shapes, angles, and spatial reasoning.",
      teacher: "Jane Smith",
      price: 15,
    },
    {
      id: 3,
      title: "Advanced Calculus Techniques",
      description: "Dive into advanced calculus concepts and applications.",
      teacher: "Alice Johnson",
      price: 20,
    },
    {
      id: 4,
      title: "Physics for Beginners",
      description: "Understand principles of motion, force, and energy.",
      teacher: "Robert Brown",
      price: 12,
    },
  ];
  const [expandedVideo, setExpandedVideo] = useState(null);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [paidVideos, setPaidVideos] = useState([]);
  const [showPaymentPrompt, setShowPaymentPrompt] = useState(false);
  const [currentVideoPrice, setCurrentVideoPrice] = useState(0);
  const videoRef = useRef(null);
  const [videoDurations, setVideoDurations] = useState({});
  const [videoRating, setVideoRating] = useState(0); // For rating
  const [videos, setVideos] = useState([initialvideos]);
  const [savedVideos, setSavedVideos] = useState([]); // For saved videos
  const [newComment, setNewComment] = useState(""); // For adding new comment
  const [errorMessage, setErrorMessage] = useState(""); // Error message handling
  const [isLoading, setIsLoading] = useState(true); // Loading state
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


  useEffect(() => {
    // Fetch videos from the backend
    const fetchVideos = async () => {
      try {
        const response = await fetch(`${FHOST}/lessons/api/videos`);
        const data = await response.json();
        if (response.ok) {
          setVideos(data.videos);
          setErrorMessage(""); // Clear any previous errors
        } else {
          setErrorMessage(data.message || "Failed to fetch videos");
        }
      } catch (error) {
        setErrorMessage("An error occurred while fetching videos");
        console.error(error);
      } finally {
        setIsLoading(false); // End loading state
      }
    };

    fetchVideos();
  }, []);

  const filteredVideos = videos.filter((video) => {
    const title = video?.title?.toLowerCase() || ''; // Ensure title exists
    const description = video?.description?.toLowerCase() || ''; // Ensure description exists
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
  let previewInterval = null; // To store the interval reference


  const handlePreviewStart = (videoElement) => {
    if (!videoElement.paused) {
      return; // Prevent starting a preview if payment is pending or video is playing
    }
    const previewDuration = 10; // Total preview duration in seconds
    const snippetCount = 5; // Number of snippets to show
    const snippetDuration = previewDuration / snippetCount; // Duration of each snippet
    const intervals = Array.from({ length: snippetCount }, (_, i) => 
      (videoElement.duration / snippetCount) * i
    ); // Define intervals across video
  
    let snippetIndex = 0;
    
    // Only play if not already playing
    if (videoElement.paused) {
      videoElement.currentTime = intervals[snippetIndex];
      videoElement.play();
    }
  
    // Set up interval to switch snippets
    previewInterval = setInterval(() => {
      snippetIndex += 1;
      if (snippetIndex >= intervals.length) {
        handlePreviewStop(videoElement); // Stop preview after showing all snippets
      } else {
        if (!videoElement.paused) {
          videoElement.currentTime = intervals[snippetIndex];
          videoElement.play();
        }
      }
    }, snippetDuration * 1000); // Convert seconds to milliseconds
  };
  
  const handlePreviewStop = (videoElement) => {
    clearInterval(previewInterval);
    previewInterval = null;
    if (videoElement) {
      videoElement.pause();
      videoElement.currentTime = 0; // Reset video to the beginning
    }
  };
  


const handleAddComment = (commentText) => {
    const newComment = {
      id: comments.length + 1,
      text: commentText,
      likes: 0,
      replies: [],
    };
    setComments((prev) => [...prev, newComment]);
  };

  const handleAddReply = (commentId, replyText) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              replies: [...comment.replies, { text: replyText, likes: 0 }],
            }
          : comment
      )
    );
  };

  const handleLikeComment = (commentId) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? { ...comment, likes: comment.likes + 1 }
          : comment
      )
    );
  };

  const handleLikeReply = (commentId, replyIndex) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              replies: comment.replies.map((reply, index) =>
                index === replyIndex
                  ? { ...reply, likes: reply.likes + 1 }
                  : reply
              ),
            }
          : comment
      )
    );
  };
  const handleSaveVideo = () => {
    setSavedVideos((prev) => [...prev, expandedVideo.id]);
  };

  const handleRateVideo = (rating) => {
    setVideoRating(rating);
  };

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

      {expandedVideo ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg overflow-hidden">
            <button
              onClick={handleCollapseVideo}
              className="flex items-center text-white bg-blue-800 p-4 w-full hover:text-gray-800"
            >
              <FaArrowLeft className="mr-2" />
              Back to Videos
            </button>

            <div className="relative aspect-video bg-black">
              <video
                className="w-full h-full object-cover"
                src={`http://127.0.0.1:5000/${expandedVideo.video_url}`}
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
              <button
                onClick={handleSaveVideo}
                className="mt-4 bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <FaSave className="mr-2" />
                Save Video
              </button>

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
                 handleLikeComment={handleLikeComment}
                 handleAddReply={handleAddReply}
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
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl"
              onClick={() => handleExpandVideo(video)}
            >
              <div
                className="relative aspect-video bg-black"
                onMouseEnter={(e) => handlePreviewStart(e.currentTarget.querySelector("video"))}
                onMouseLeave={(e) => handlePreviewStop(e.currentTarget.querySelector("video"))}
                >
                    {/* <button className="bg-black absolute bottom-0 left-0 w-fit z-10">Hide</button> */}
                <video
                    className="w-full h-full object-cover"
                    src={`http://127.0.0.1:5000/${video.video_url}`}
                    muted
                    loop={false} // Prevent looping for preview
                    // controls // Disable controls
                    controlsList="nodownload" // Hide extra controls
                    
                    ref={(el) => attachDuration(el, video.id)} // Attach to display duration
                ></video>
                    <div className="absolute bottom-2 right-2 bg-gray-900 bg-opacity-70 text-white text-sm px-2 py-1 rounded">
                        {getVideoDuration(video.id)}
                    </div>
              </div>
                <div className="p-4 relative">
                    {/* Video Title */}
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                        {video.title}
                    </h3>

                    {/* Teacher Profile */}
                    <div className="relative left-0 bottom-0 flex items-center space-x-2 bg-gray-900 bg-opacity-70 p-1 rounded-lg">
                        <FaUser className="text-white w-10 h-10 p-2 bg-gray-500 rounded-full" />
                        <div className="text-white">
                        <h3 className="font-semibold">{video.teacher}</h3>
                        <p className="text-sm">Expert Teacher</p>
                        </div>
                    </div>

                    {/* Price */}
                    
                </div>

            </div>
          ))}
        </div>
      )}

      {showPaymentPrompt && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Payment Required
            </h3>
            <p className="text-gray-600 mb-6">
              You need to pay ${currentVideoPrice} to continue watching this video.
            </p>
            <button
              onClick={handlePayment}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Pay Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoLesson;
