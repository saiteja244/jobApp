import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Jobs = () => {
  const { user, logout } = useAuth();

  // All jobs fetched from backend
  const [jobs, setJobs] = useState([]);

  // Search and filter state
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ─── FETCH JOBS ─────────────────────────────────────────────────────────────
  // This runs whenever page, search, or typeFilter changes
  useEffect(() => {
    fetchJobs();
  }, [page, typeFilter]); // dependencies - re-run when these change

  const fetchJobs = async () => {
    setLoading(true);
    setError('');
    try {
      // Build query string dynamically based on what filters are active
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 6);
      if (search) params.append('search', search);
      if (typeFilter) params.append('type', typeFilter);

      const response = await api.get(`/jobs?${params.toString()}`);
      setJobs(response.data.jobs);
      setTotalPages(response.data.pages);
    } catch (err) {
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  // Search only triggers on button click or Enter key
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // reset to first page on new search
    fetchJobs();
  };

  // Clear all filters and reload
  const handleClear = () => {
    setSearch('');
    setTypeFilter('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── NAVBAR ── */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">WorkPortal</h1>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm text-gray-600 hover:text-blue-600">Home</Link>
          <span className="text-sm text-gray-600">{user?.name}</span>
          <button
            onClick={logout}
            className="text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* ── PAGE HEADER ── */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Find Jobs</h2>
          <p className="text-gray-500 mt-1">Browse all available positions</p>
        </div>

        {/* ── SEARCH + FILTER BAR ── */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search input */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs, skills, companies..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Type filter dropdown */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All types</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
            <option value="remote">Remote</option>
          </select>

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            Search
          </button>

          {/* Only show Clear button if filters are active */}
          {(search || typeFilter) && (
            <button
              type="button"
              onClick={handleClear}
              className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition"
            >
              Clear
            </button>
          )}
        </form>

        {/* ── LOADING STATE ── */}
        {loading && (
          <div className="text-center py-16 text-gray-400">Loading jobs...</div>
        )}

        {/* ── ERROR STATE ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* ── EMPTY STATE ── */}
        {!loading && !error && jobs.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No jobs found</p>
            <p className="text-gray-300 text-sm mt-2">Try a different search or clear filters</p>
          </div>
        )}

        {/* ── JOB CARDS GRID ── */}
        {!loading && jobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}

        {/* ── PAGINATION ── */}
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

// ── JOB CARD COMPONENT ────────────────────────────────────────────────────────
// Separate component for each job card - keeps the code clean and readable
// Receives a single job object as a prop
const JobCard = ({ job }) => {
  // Map job types to colors so each type looks visually different
  const typeColors = {
    'full-time':  'bg-green-100 text-green-700',
    'part-time':  'bg-yellow-100 text-yellow-700',
    'contract':   'bg-purple-100 text-purple-700',
    'internship': 'bg-blue-100 text-blue-700',
    'remote':     'bg-teal-100 text-teal-700',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition">

      {/* Top row: title + type badge */}
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-800 text-base">{job.title}</h3>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${typeColors[job.type] || 'bg-gray-100 text-gray-600'}`}>
          {job.type}
        </span>
      </div>

      {/* Company + location */}
      <p className="text-sm text-blue-600 font-medium">{job.company}</p>
      <p className="text-sm text-gray-500 mt-1">📍 {job.location}</p>

      {/* Salary */}
      <p className="text-sm text-gray-500 mt-1">💰 {job.salary}</p>

      {/* Skills tags */}
      {job.skills && job.skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {job.skills.slice(0, 4).map((skill, index) => (
            <span
              key={index}
              className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md"
            >
              {skill}
            </span>
          ))}
          {/* If more than 4 skills, show "+N more" */}
          {job.skills.length > 4 && (
            <span className="text-xs text-gray-400">+{job.skills.length - 4} more</span>
          )}
        </div>
      )}

      {/* Footer: posted by + view button */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
        <span className="text-xs text-gray-400">
          Posted by {job.employer?.name || 'Unknown'}
        </span>
        <Link
          to={`/jobs/${job._id}`}
          className="text-sm text-blue-600 font-medium hover:underline"
        >
          View details →
        </Link>
      </div>
    </div>
  );
};

export default Jobs;