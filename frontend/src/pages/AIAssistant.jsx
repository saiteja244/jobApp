import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const AIAssistant = () => {
  const { user, logout } = useAuth();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchSuggestions();
    setMessages([
      {
        role: 'assistant',
        content: `Hi ${user?.name?.split(' ')[0] || 'there'}! 👋 I am your AI career assistant.\n\nI can help you with resume writing, interview preparation, salary negotiation, career switching, and more.\n\nWhat would you like help with today?`,
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchSuggestions = async () => {
    try {
      const res = await api.get('/ai/suggestions');
      setSuggestions(res.data.suggestions);
    } catch (err) {
      console.error('Suggestions error:', err);
    }
  };

  const sendMessage = async (messageText) => {
    const text = messageText || input.trim();
    if (!text || loading) return;

    const userMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: '...', isTyping: true },
    ]);

    try {
      const res = await api.post('/ai/chat', { message: text });

      setMessages((prev) => [
        ...prev.filter((m) => !m.isTyping),
        { role: 'assistant', content: res.data.response },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev.filter((m) => !m.isTyping),
        {
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const handleSuggestion = (suggestion) => {
    sendMessage(suggestion);
  };

  const renderContent = (content) => {
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* NAVBAR */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">WorkPortal</h1>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm text-gray-600 hover:text-blue-600">Home</Link>
          <Link to="/jobs" className="text-sm text-gray-600 hover:text-blue-600">Jobs</Link>
          <Link to="/feed" className="text-sm text-gray-600 hover:text-blue-600">Feed</Link>
          <Link to="/network" className="text-sm text-gray-600 hover:text-blue-600">Network</Link>
          <Link to="/messages" className="text-sm text-gray-600 hover:text-blue-600">Messages</Link>
          <Link to="/profile" className="text-sm text-gray-600 hover:text-blue-600">{user?.name}</Link>
          <button
            onClick={logout}
            className="text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* PAGE HEADER */}
        <div className="mb-6 text-center">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-3">
            🤖
          </div>
          <h2 className="text-2xl font-bold text-gray-800">AI Career Assistant</h2>
          <p className="text-gray-500 mt-1 text-sm">
            Get personalized career advice powered by AI
          </p>
        </div>

        {/* CHAT WINDOW */}
        <div className="bg-white rounded-xl border border-gray-200 flex flex-col h-[500px]">

          {/* MESSAGES AREA */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs mr-2 flex-shrink-0 mt-1">
                    AI
                  </div>
                )}

                <div
                  className={`max-w-lg px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {msg.isTyping ? (
                    <div className="flex gap-1 items-center h-4">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  ) : (
                    <div className="whitespace-pre-line">
                      {renderContent(msg.content)}
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs ml-2 flex-shrink-0 mt-1">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* SUGGESTION CHIPS */}
          {messages.length <= 1 && suggestions.length > 0 && (
            <div className="px-4 pb-3">
              <p className="text-xs text-gray-400 mb-2">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.slice(0, 4).map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestion(s)}
                    className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-100 transition border border-blue-100"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* INPUT */}
          <form
            onSubmit={handleSubmit}
            className="p-4 border-t border-gray-200 flex gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your career..."
              disabled={loading}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? '...' : 'Ask'}
            </button>
          </form>
        </div>

        {/* TOPIC CARDS */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: '📄', label: 'Resume Tips', msg: 'How do I improve my resume?' },
            { icon: '💼', label: 'Interviews', msg: 'How do I prepare for a tech interview?' },
            { icon: '💰', label: 'Salary', msg: 'How do I negotiate my salary?' },
            { icon: '🗺️', label: 'Career Path', msg: 'What skills should I learn for full stack development?' },
          ].map((topic, i) => (
            <button
              key={i}
              onClick={() => handleSuggestion(topic.msg)}
              className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-blue-300 hover:shadow-sm transition"
            >
              <div className="text-2xl mb-2">{topic.icon}</div>
              <p className="text-sm font-medium text-gray-700">{topic.label}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;