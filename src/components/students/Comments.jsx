import React, { useEffect, useState } from 'react';
import { addComment, addReply, fetchComments, likeComment, likeReply, rateVideo, reportContent } from '../constants/ApiRoute';


const VideoComments = ({ videoId, userId }) => {
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [newReplyText, setNewReplyText] = useState('');
  const [newRating, setNewRating] = useState(0);
  

  useEffect(() => {
    const getComments = async () => {
      try {
        const data = await fetchComments(videoId);
        setComments(data);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };
    getComments();
  }, [videoId]);

  const handleAddComment = async () => {
    try {
      await addComment(videoId, userId, newCommentText);
      setNewCommentText('');
      const updatedComments = await fetchComments(videoId);
      setComments(updatedComments);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      await likeComment(commentId);
      const updatedComments = await fetchComments(videoId);
      setComments(updatedComments);
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleAddReply = async (commentId) => {
    try {
      await addReply(commentId, userId, newReplyText);
      setNewReplyText('');
      const updatedComments = await fetchComments(videoId);
      setComments(updatedComments);
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const handleLikeReply = async (replyId, commentId) => {
    try {
      await likeReply(replyId, userId, commentId);
      const updatedComments = await fetchComments(videoId);
      setComments(updatedComments);
    } catch (error) {
      console.error('Error liking reply:', error);
    }
  };

  const handleRateVideo = async () => {
    try {
      await rateVideo(videoId, userId, newRating);
      setNewRating(0); // Reset rating input after submitting
    } catch (error) {
      console.error('Error rating video:', error);
    }
  };



  return (
    <div className="comments-section">
      <h2 className="text-xl font-bold mb-4">Comments</h2>

      {/* Add a comment */}
      <div className="add-comment mb-4">
        <textarea
          className="w-full p-2 border border-gray-300 rounded"
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          placeholder="Add a comment..."
        />
        <button
          className="mt-2 p-2 bg-blue-500 text-white rounded"
          onClick={handleAddComment}
        >
          Add Comment
        </button>
      </div>

      {/* Display comments */}
      {comments.length > 0 ? (
        comments.map((comment) => (
          <div key={comment.id} className="comment mb-4 border-b pb-4">
            <div className="comment-header flex justify-between items-center">
              <span className="font-semibold">{comment.user_name}</span>
              <button
                className="text-blue-500"
                onClick={() => handleLikeComment(comment.id)}
              >
                Like ({comment.likes})
              </button>
            </div>
            <p>{comment.text}</p>

            {/* Replies to comment */}
            <div className="replies ml-4 mt-2">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="reply flex justify-between items-center mb-2">
                  <span>{reply.user_name}: {reply.text}</span>
                  <button
                    className="text-blue-500"
                    onClick={() => handleLikeReply(reply.id, comment.id)}
                  >
                    Like ({reply.likes})
                  </button>
                </div>
              ))}

              {/* Add a reply */}
              <div className="add-reply mt-2">
                <textarea
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newReplyText}
                  onChange={(e) => setNewReplyText(e.target.value)}
                  placeholder="Add a reply..."
                />
                <button
                  className="mt-2 p-2 bg-green-500 text-white rounded"
                  onClick={() => handleAddReply(comment.id)}
                >
                  Add Reply
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p>No comments yet. Be the first to comment!</p>
      )}

      {/* Video Rating */}
      

     
    </div>
  );
};

export default VideoComments;
