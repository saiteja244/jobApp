import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const JobDetail = () => {
  // useParams reads the :id from the URL
  // e.g. /jobs/64abc123 → params.id = "64abc123"
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Apply form state
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState('');

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const response = await api.get(`/jobs/${id}`);
      setJob(response.data.job);
    } catch (err) {
      setError('Job not found');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    setApplyError('');
    try {
      await api.post(`/jobs/${id}/apply`, { coverLetter });
      setApplySuccess(true); // show success message
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Application failed');
    } finally {
      setApplying(false);
    }
  };

  // Check if current user already applied
  const alreadyApplied = job?.applications?.some(
    (app) => app.applicant?._id === user?._id ||
             app.applicant === user?._id
  );

  // Check if current user is the employer
  const isEmployer = job?.employer?._id === user?._id ||
                     job?.employer === user?._id;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      Loading...
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Link to="/jobs" className="text-blue-600 hover:underline">← Back to jobs</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── NAVBAR ── */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">WorkPortal</h1>
        <Link to="/jobs" className="text-sm text-gray-600 hover:text-blue-600">
          ← Back to jobs
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* ── JOB HEADER ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{job.title}</h2>
              <p className="text-blue-600 font-medium mt-1">{job.company}</p>
            </div>
            <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full font-medium">
              {job.type}
            </span>
          </div>

          {/* Job meta info */}
          <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-gray-500">
            <div>📍 {job.location}</div>
            <div>💰 {job.salary}</div>
            <div>👤 Posted by {job.employer?.name}</div>
            <div>📅 {new Date(job.createdAt).toLocaleDateString()}</div>
          </div>

          {/* Skills */}
          {job.skills?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {job.skills.map((skill, i) => (
                <span key={i} className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── JOB DESCRIPTION ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Job Description</h3>
          {/* whitespace-pre-line preserves line breaks from the description */}
          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
            {job.description}
          </p>
        </div>

        {/* ── APPLY SECTION ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Apply for this position</h3>

          {/* Employer cannot apply to their own job */}
          {isEmployer && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-sm">
              You posted this job
            </div>
          )}

          {/* Already applied */}
          {!isEmployer && alreadyApplied && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              ✅ You have already applied for this job
            </div>
          )}

          {/* Application success message */}
          {applySuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              ✅ Application submitted successfully!
            </div>
          )}

          {/* Show apply form only if not employer, not applied, not just submitted */}
          {!isEmployer && !alreadyApplied && !applySuccess && (
            <form onSubmit={handleApply} className="space-y-4">
              {applyError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {applyError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cover letter <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={4}
                  placeholder="Tell the employer why you're a great fit..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={applying}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {applying ? 'Submitting...' : 'Submit application'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetail;