import axios from 'axios';
import { FHOST } from './Functions';

const apiBaseUrl = `${FHOST}/lessons/api`

// Fetch comments for a video
export const fetchComments = async (video_id) => {
  try {
    const response = await axios.get(`${apiBaseUrl}/comments/${video_id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
};

// Add a new comment to a video
export const addComment = async (video_id, user_id, text) => {
  try {
    const response = await axios.post(
      `${apiBaseUrl}/comments/${video_id}`,
      { text, user_id }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

// Like a comment
export const likeComment = async (comment_id) => {
  try {
    const response = await axios.post(`${apiBaseUrl}/comments/like/${comment_id}`);
    return response.data;
  } catch (error) {
    console.error("Error liking comment:", error);
    throw error;
  }
};

// Add a reply to a comment
export const addReply = async (comment_id, user_id, text) => {
  try {
    const response = await axios.post(
      `${apiBaseUrl}/replies/${comment_id}`,
      { text, user_id }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding reply:", error);
    throw error;
  }
};

// Like a reply to a comment
export const likeReply = async (reply_id, user_id, comment_id) => {
  try {
    const response = await axios.post(
      `${apiBaseUrl}/replies/like/${reply_id}/${user_id}`,
      { comment_id }
    );
    return response.data;
  } catch (error) {
    console.error("Error liking reply:", error);
    throw error;
  }
};

// Rate a video
export const rateVideo = async (video_id, user_id, rating) => {
  try {
    const response = await axios.post(
      `${apiBaseUrl}/ratings/${video_id}/${user_id}`,
      { rating }
    );
    return response.data;
  } catch (error) {
    console.error("Error rating video:", error);
    throw error;
  }
};
export const fetchRating = async (videoId, userId) => {
    try {
      const response = await axios.get(`${apiBaseUrl}/ratings/${videoId}/${userId}`);
      console.log('Rating fetched:', response.data.rating);
      return response.data.rating; // Return the fetched rating
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('No rating found for this video and user.');
        return null; // Explicitly return null when no rating is found
      } else {
        console.error('Error fetching rating:', error);
        throw error; // Rethrow the error for further handling
      }
    }
  };
  

// Report content (video or comment)
export const reportContent = async (video_id, user_id, content) => {
  try {
    const response = await axios.post(
      `${apiBaseUrl}/reports/${video_id}/${user_id}`,
      { content }
    );
    return response.data;
  } catch (error) {
    console.error("Error reporting content:", error);
    throw error;
  }
};
