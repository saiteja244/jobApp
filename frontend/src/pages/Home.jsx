import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">WorkPortal</h1>
        <div className="flex items-center gap-4">
          <Link to="/feed" className="text-sm text-gray-600 hover:text-blue-600">Feed</Link>
          <Link to="/jobs" className="text-sm text-gray-600 hover:text-blue-600">Jobs</Link>
          <Link to="/post-job" className="text-sm text-gray-600 hover:text-blue-600">Post a job</Link>
          <Link to="/network" className="text-sm text-gray-600 hover:text-blue-600">Network</Link>
          <Link to="/messages" className="text-sm text-gray-600 hover:text-blue-600">Messages</Link>
          <Link to="/profile" className="text-sm text-gray-600 hover:text-blue-600">{user?.name}</Link>
          <Link to="/ai" className="text-sm text-gray-600 hover:text-blue-600">AI Assistant</Link>
          <button
            onClick={logout}
            className="text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto mt-16 px-6 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Welcome to WorkPortal 👋
        </h2>
        <p className="text-gray-500 text-lg mb-8">
          Logged in as <strong>{user?.email}</strong>
        </p>
        <div className="flex justify-center flex-wrap gap-4">
          <Link to="/feed" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition">
            View Feed
          </Link>
          <Link to="/jobs" className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition">
            Browse Jobs
          </Link>
          <Link to="/post-job" className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition">
            Post a Job
          </Link>
          <Link to="/network" className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition">
            My Network
          </Link>
          <Link to="/ai" className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition">
            AI Assistant 🤖
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;