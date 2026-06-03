import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Feed = () => {
  const { user, logout, loading: authLoading } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [newContent, setNewContent] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      fetchPosts();
    }
  }, [page, authLoading]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/posts?page=${page}&limit=10`);
      setPosts(res.data.posts);
      setTotalPages(res.data.pages);
    } catch (err) {
      console.error('Feed error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    setPosting(true);
    try {
      const res = await api.post('/posts', { content: newContent.trim() });
      setPosts((prev) => [res.data.post, ...prev]);
      setNewContent('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post');
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await api.put(`/posts/${postId}/like`);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? {
                ...p,
                likes: res.data.liked
                  ? [...p.likes, user._id]
                  : p.likes.filter(
                      (id) => id?.toString() !== user._id?.toString()
                    ),
              }
            : p
        )
      );
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const handleComment = async (postId, content) => {
    try {
      const res = await api.post(`/posts/${postId}/comment`, { content });
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, comments: [...p.comments, res.data.comment] }
            : p
        )
      );
    } catch (err) {
      alert('Failed to comment');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* NAVBAR */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">WorkPortal</h1>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm text-gray-600 hover:text-blue-600">Home</Link>
          <Link to="/jobs" className="text-sm text-gray-600 hover:text-blue-600">Jobs</Link>
          <Link to="/feed" className="text-sm text-blue-600 font-medium">Feed</Link>
          <Link to="/network" className="text-sm text-gray-600 hover:text-blue-600">Network</Link>
          <Link to="/messages" className="text-sm text-gray-600 hover:text-blue-600">Messages</Link>
          <Link to="/profile" className="text-sm text-gray-600 hover:text-blue-600">
            {user?.name}
          </Link>
          <button
            onClick={logout}
            className="text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">

        {/* CREATE POST BOX */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <form onSubmit={handlePost}>
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Share something with your network..."
                rows={3}
                className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div className="flex justify-end mt-3">
              <button
                type="submit"
                disabled={posting || !newContent.trim()}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {posting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="text-center py-16 text-gray-400">
            Loading feed...
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && posts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400">
              No posts yet — be the first to share something!
            </p>
          </div>
        )}

        {/* POSTS LIST */}
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              currentUser={user}
              onLike={handleLike}
              onDelete={handleDelete}
              onComment={handleComment}
            />
          ))}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── POST CARD COMPONENT ───────────────────────────────────────────────────────
const PostCard = ({ post, currentUser, onLike, onDelete, onComment }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Safely convert any id to string for comparison
  const authorId = post.author?._id?.toString()
    || post.author?.toString()
    || '';
  const currentUserId = currentUser?._id?.toString() || '';

  const liked = currentUserId
    ? post.likes.some((id) => id?.toString() === currentUserId)
    : false;

  const isAuthor = currentUserId && authorId
    ? authorId === currentUserId
    : false;

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    await onComment(post._id, commentText.trim());
    setCommentText('');
    setSubmittingComment(false);
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  // If post is broken, render nothing
  if (!post || !post._id) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">

      {/* POST HEADER */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
            {post.author?.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-medium text-gray-800 text-sm">
              {post.author?.name || 'Unknown'}
            </p>
            <p className="text-xs text-gray-400">{timeAgo(post.createdAt)}</p>
          </div>
        </div>
        {isAuthor && (
          <button
            onClick={() => onDelete(post._id)}
            className="text-xs text-gray-400 hover:text-red-500 transition"
          >
            Delete
          </button>
        )}
      </div>

      {/* POST CONTENT */}
      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line mb-4">
        {post.content}
      </p>

      {/* TAGS */}
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag, i) => (
            <span
              key={i}
              className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* LIKE + COMMENT BAR */}
      <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
        <button
          onClick={() => onLike(post._id)}
          className={`flex items-center gap-1.5 text-sm transition ${
            liked
              ? 'text-blue-600 font-medium'
              : 'text-gray-400 hover:text-blue-600'
          }`}
        >
          👍 {post.likes?.length || 0}
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-600 transition"
        >
          💬 {post.comments?.length || 0}
        </button>
      </div>

      {/* COMMENTS SECTION */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
          {post.comments?.length === 0 && (
            <p className="text-xs text-gray-400">No comments yet</p>
          )}
          {post.comments?.map((comment, i) => (
            <div key={i} className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs flex-shrink-0">
                {comment.author?.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="bg-gray-50 rounded-lg px-3 py-2 flex-1">
                <p className="text-xs font-medium text-gray-700">
                  {comment.author?.name || 'Unknown'}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}

          {/* ADD COMMENT FORM */}
          <form onSubmit={handleCommentSubmit} className="flex gap-2 mt-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={submittingComment || !commentText.trim()}
              className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {submittingComment ? '...' : 'Post'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Feed;