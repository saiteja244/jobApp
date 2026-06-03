import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Messages = () => {
  const { user, logout } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchInbox();
  }, []);

  useEffect(() => {
    if (userId) {
      openConversation(userId);
    }
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchInbox = async () => {
    try {
      const res = await api.get('/messages/inbox');
      setConversations(res.data.conversations);
    } catch (err) {
      console.error('Inbox error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openConversation = async (otherUserId) => {
    try {
      const [convRes, userRes] = await Promise.all([
        api.get(`/messages/conversation/${otherUserId}`),
        api.get(`/auth/profile/${otherUserId}`),
      ]);
      setMessages(convRes.data.messages);
      setActiveUser(userRes.data.user);
    } catch (err) {
      console.error('Conversation error:', err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId) return;

    setSending(true);
    try {
      const res = await api.post('/messages/send', {
        recipientId: userId,
        content: newMessage.trim(),
      });
      setMessages((prev) => [...prev, res.data.message]);
      setNewMessage('');
      fetchInbox();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const handleSelectConversation = (conv) => {
    const otherId =
      conv.sender._id === user._id
        ? conv.recipient._id
        : conv.sender._id;
    navigate(`/messages/${otherId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">WorkPortal</h1>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm text-gray-600 hover:text-blue-600">Home</Link>
          <Link to="/jobs" className="text-sm text-gray-600 hover:text-blue-600">Jobs</Link>
          <Link to="/network" className="text-sm text-gray-600 hover:text-blue-600">Network</Link>
          <Link to="/profile" className="text-sm text-gray-600 hover:text-blue-600">{user?.name}</Link>
          <button onClick={logout} className="text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex h-[600px]">

          {/* SIDEBAR */}
          <div className="w-72 border-r border-gray-200 flex flex-col flex-shrink-0">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Messages</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading && <p className="text-sm text-gray-400 p-4">Loading...</p>}

              {!loading && conversations.length === 0 && (
                <div className="p-4 text-center">
                  <p className="text-sm text-gray-400">No conversations yet</p>
                  <Link to="/network" className="text-sm text-blue-600 hover:underline mt-2 block">
                    Connect with people →
                  </Link>
                </div>
              )}

              {conversations.map((conv) => {
                const other =
                  conv.sender._id === user._id ? conv.recipient : conv.sender;
                const isActive = userId === other._id;

                return (
                  <button
                    key={conv._id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition border-b border-gray-50 ${
                      isActive ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm flex-shrink-0">
                        {other.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 text-sm">{other.name}</p>
                        <p className="text-xs text-gray-400 truncate">{conv.content}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CHAT WINDOW */}
          <div className="flex-1 flex flex-col">
            {!userId && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-400 text-3xl mb-3">💬</p>
                  <p className="text-gray-400">Select a conversation to start messaging</p>
                  <Link to="/network" className="text-sm text-blue-600 hover:underline mt-2 block">
                    Go to Network to find people →
                  </Link>
                </div>
              </div>
            )}

            {userId && (
              <>
                {/* Chat header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">
                      {activeUser?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        {activeUser?.name || 'Loading...'}
                      </p>
                      <p className="text-xs text-gray-400">{activeUser?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 && (
                    <p className="text-center text-gray-400 text-sm mt-8">
                      No messages yet — say hello! 👋
                    </p>
                  )}

                  {messages.map((msg) => {
                    const isMine =
                      msg.sender._id === user._id ||
                      msg.sender === user._id;

                    return (
                      <div
                        key={msg._id}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                            isMine
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : 'bg-gray-100 text-gray-800 rounded-bl-none'
                          }`}
                        >
                          <p>{msg.content}</p>
                          <p className={`text-xs mt-1 ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message input */}
                <form onSubmit={handleSend} className="p-4 border-t border-gray-200 flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
                  >
                    {sending ? '...' : 'Send'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;