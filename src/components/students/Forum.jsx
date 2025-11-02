import React, { useState } from "react";
import { FaChevronCircleDown, FaChevronCircleUp } from "react-icons/fa";
import { HiOutlineHeart, HiHeart } from "react-icons/hi";

const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});

  const handleAddPost = () => {
    if (newPost.trim() || selectedImage) {
      setPosts([
        ...posts,
        {
          id: Date.now(),
          author: {
            name: "John Doe",
            role: "Teacher",
            profileImage: "https://via.placeholder.com/50",
          },
          content: newPost,
          image: selectedImage,
          replies: [],
        },
      ]);
      setNewPost("");
      setSelectedImage(null);
    }
  };

  const handleAddReply = (postId, replyText, replyImage = null) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              replies: [
                ...post.replies,
                {
                  id: Date.now(),
                  author: {
                    name: "Jane Smith",
                    role: "Student",
                    profileImage: "https://via.placeholder.com/50",
                  },
                  content: replyText,
                  image: replyImage,
                  likes: 0,
                  replies: [],
                },
              ],
            }
          : post
      )
    );
  };

  const handleLikeReply = (postId, replyId) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              replies: post.replies.map((reply) =>
                reply.id === replyId
                  ? { ...reply, likes: reply.likes + 1 }
                  : reply
              ),
            }
          : post
      )
    );
  };

  const handleImageUpload = (e, setImage) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const toggleReplies = (postId) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Forum</h2>

      {/* New Post Input */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Ask a question or share something..."
          className="w-full p-2 border rounded mb-2"
        />
        <div className="flex items-center justify-between">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, setSelectedImage)}
            className="text-sm"
          />
          <button
            onClick={handleAddPost}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Post
          </button>
        </div>
      </div>

      {/* Forum Posts */}
      {posts.map((post) => (
        <div key={post.id} className="bg-white p-4 rounded-lg shadow mb-6">
          {/* Post Author Info */}
          <div className="flex items-center mb-4">
            <img
              src={post.author.profileImage}
              alt={post.author.name}
              className="w-10 h-10 rounded-full mr-3"
            />
            <div>
              <p className="font-bold">{post.author.name}</p>
              <p className="text-sm text-gray-500">{post.author.role}</p>
            </div>
          </div>
          <div className="mb-4">
            {post.image && (
              <img
                src={post.image}
                alt="Post"
                className="w-full h-40 object-cover rounded mb-2"
              />
            )}
            <p className="text-gray-700">{post.content}</p>
          </div>

          {/* Toggle Replies Button */}
          {post.replies.length > 0 && (
            <button
              onClick={() => toggleReplies(post.id)}
              className="text-blue-600 bg-white hover:bg-gray-50 hover:underline mb-1 p-2 flex justify-between"
            >
              {expandedReplies[post.id] ? <><FaChevronCircleUp className="text-xl"/> <p className="text-sm">Hide Replies ({post.replies.length})</p> </> : <><FaChevronCircleDown className="text-xl"/><p className="text-sm">Show Replies ({post.replies.length})</p> </> } 
            </button>
          )}

          {/* Replies */}
          <div
            className={`space-y-4 transition-all duration-300 ${
              expandedReplies[post.id] ? "block" : "hidden"
            } ml-8`}
          >
            {post.replies.map((reply) => (
              <div
                key={reply.id}
                className="bg-gray-50 p-2 rounded-lg shadow"
              >
                {/* Reply Author Info */}
                <div className="flex items-center mb-1">
                  <img
                    src={reply.author.profileImage}
                    alt={reply.author.name}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <div>
                    <p className="font-semibold">{reply.author.name}</p>
                    <p className="text-xs text-gray-500">
                      {reply.author.role}
                    </p>
                  </div>
                </div>
                {reply.image && (
                  <img
                    src={reply.image}
                    alt="Reply"
                    className="w-full h-20 object-cover rounded mb-1"
                  />
                )}
                <p className="text-gray-700 justify-start flex ml-3 text-sm">{reply.content}</p>
                <div className="flex items-center justify-between text-sm mt-1">
                  <button
                    onClick={() => handleLikeReply(post.id, reply.id)}
                    className="flex p-1 items-center space-x-1 w-fit bg-white hover:bg-gray-50 text-gray-500 hover:text-red-500"
                  >
                    {reply.likes > 0 ? <HiHeart /> : <HiOutlineHeart />}
                    <span>{reply.likes > 0 ? reply.likes : "Like"}</span>
                  </button>
                  <button
                    onClick={() =>
                      handleAddReply(post.id, "Another nested reply")
                    }
                    className="text-blue-600 w-fit hidden hover:underline bg-white hover:bg-gray-50"
                  >
                    Reply
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Reply Input */}
          <div className="mt-4 ml-8">
            <textarea
              placeholder="Write a reply..."
              className="w-full p-2 border rounded mb-2"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAddReply(post.id, e.target.value);
                  e.target.value = "";
                }
              }}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleImageUpload(e, (image) =>
                  handleAddReply(post.id, "", image)
                )
              }
              className="text-sm"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Forum;
