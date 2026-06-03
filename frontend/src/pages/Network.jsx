import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Network = () => {
  const { user, logout } = useAuth();

  const [users, setUsers] = useState([]);
  const [pending, setPending] = useState([]);
  const [myConnections, setMyConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [usersRes, pendingRes, connectionsRes] = await Promise.all([
        api.get('/connections/users'),
        api.get('/connections/pending'),
        api.get('/connections/my'),
      ]);

      setUsers(usersRes.data.users);
      setPending(pendingRes.data.pending);
      setMyConnections(connectionsRes.data.connections);
    } catch (err) {
      console.error('Network fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (userId) => {
    try {
      await api.post(`/connections/request/${userId}`);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send request');
    }
  };

  const handleAccept = async (connectionId) => {
    try {
      await api.put(`/connections/accept/${connectionId}`);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">WorkPortal</h1>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm text-gray-600 hover:text-blue-600">Home</Link>
          <Link to="/jobs" className="text-sm text-gray-600 hover:text-blue-600">Jobs</Link>
          <Link to="/post-job" className="text-sm text-gray-600 hover:text-blue-600">Post a job</Link>
          <Link to="/messages" className="text-sm text-gray-600 hover:text-blue-600">Messages</Link>
          <Link to="/profile" className="text-sm text-gray-600 hover:text-blue-600">{user?.name}</Link>
          <button onClick={logout} className="text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Network</h2>
          <p className="text-gray-500 mt-1">Connect with other professionals</p>
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {[
            { key: 'browse', label: `Browse (${users.length})` },
            { key: 'pending', label: `Requests (${pending.length})` },
            { key: 'connected', label: `Connected (${myConnections.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition -mb-px ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading && <div className="text-center py-16 text-gray-400">Loading...</div>}

        {/* BROWSE TAB */}
        {!loading && activeTab === 'browse' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.length === 0 && (
              <p className="text-gray-400 col-span-2 text-center py-8">No other users yet</p>
            )}
            {users.map((u) => (
              <UserCard key={u._id} user={u} onConnect={handleConnect} />
            ))}
          </div>
        )}

        {/* PENDING TAB */}
        {!loading && activeTab === 'pending' && (
          <div className="space-y-4">
            {pending.length === 0 && (
              <p className="text-gray-400 text-center py-8">No pending requests</p>
            )}
            {pending.map((req) => (
              <div key={req._id} className="bg-white rounded-xl border border-gray-200 p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {req.requester.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{req.requester.name}</p>
                    <p className="text-sm text-gray-500">{req.requester.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleAccept(req._id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  Accept
                </button>
              </div>
            ))}
          </div>
        )}

        {/* CONNECTED TAB */}
        {!loading && activeTab === 'connected' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myConnections.length === 0 && (
              <p className="text-gray-400 col-span-2 text-center py-8">
                No connections yet — go to Browse to connect with people
              </p>
            )}
            {myConnections.map((person) => (
              <div key={person._id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                      {person.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{person.name}</p>
                      <p className="text-sm text-gray-500">{person.email}</p>
                    </div>
                  </div>
                  <Link
                    to={`/messages/${person._id}`}
                    className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Message
                  </Link>
                </div>
                {person.bio && (
                  <p className="text-sm text-gray-500 mb-2">{person.bio}</p>
                )}
                {person.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {person.skills.map((skill, i) => (
                      <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// USER CARD COMPONENT
const UserCard = ({ user, onConnect }) => {
  const renderButton = () => {
    if (user.connectionStatus === 'accepted') {
      return (
        <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
          ✓ Connected
        </span>
      );
    }
    if (user.connectionStatus === 'pending' && user.iRequested) {
      return (
        <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-medium">
          Pending...
        </span>
      );
    }
    if (user.connectionStatus === 'pending' && !user.iRequested) {
      return (
        <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
          Wants to connect
        </span>
      );
    }
    return (
      <button
        onClick={() => onConnect(user._id)}
        className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition font-medium"
      >
        + Connect
      </button>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-800">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        {renderButton()}
      </div>
      {user.bio && (
        <p className="text-sm text-gray-500 mb-2 line-clamp-2">{user.bio}</p>
      )}
      {user.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {user.skills.slice(0, 3).map((skill, i) => (
            <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md">
              {skill}
            </span>
          ))}
          {user.skills.length > 3 && (
            <span className="text-xs text-gray-400">+{user.skills.length - 3} more</span>
          )}
        </div>
      )}
    </div>
  );
};

export default Network;