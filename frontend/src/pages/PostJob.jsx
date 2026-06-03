import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';

const PostJob = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { account, connecting, connectWallet, postJobOnChain } = useWeb3();

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    location: '',
    salary: '',
    type: 'full-time',
    skills: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('form');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const skillsArray = formData.skills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s);

      setStep('paying');
      const txHash = await postJobOnChain(formData.title, formData.company);

      await api.post('/jobs', {
        ...formData,
        skills: skillsArray,
        paymentTxHash: txHash,
        paymentVerified: true,
      });

      setStep('done');
      setTimeout(() => navigate('/jobs'), 2000);

    } catch (err) {
      setStep('form');
      if (err.code === 4001) {
        setError('Transaction cancelled. You need to approve the payment in MetaMask.');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to post job');
      }
    } finally {
      setLoading(false);
    }
  };

  if (step === 'done') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center max-w-md">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Job posted successfully!</h2>
          <p className="text-gray-500 text-sm">Payment confirmed on blockchain. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">WorkPortal</h1>
        <div className="flex items-center gap-4">
          <Link to="/jobs" className="text-sm text-gray-600 hover:text-blue-600">Jobs</Link>
          <Link to="/profile" className="text-sm text-gray-600 hover:text-blue-600">{user?.name}</Link>
          <button
            onClick={logout}
            className="text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Post a Job</h2>
          <p className="text-gray-500 mt-1">Requires a payment of 0.01 ETH via MetaMask</p>
        </div>

        {/* WALLET CONNECTION BANNER */}
        <div className={`rounded-xl border p-4 mb-6 flex justify-between items-center ${
          account
            ? 'bg-green-50 border-green-200'
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div>
            <p className={`text-sm font-medium ${
              account ? 'text-green-700' : 'text-yellow-700'
            }`}>
              {account ? '✓ Wallet connected' : '⚠ Wallet not connected'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {account
                ? `${account.slice(0, 6)}...${account.slice(-4)}`
                : 'Connect MetaMask to pay for job posting'}
            </p>
          </div>
          {!account && (
            <button
              onClick={connectWallet}
              disabled={connecting}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-600 disabled:opacity-50 transition"
            >
              {connecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {step === 'paying' && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              Waiting for MetaMask confirmation...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Frontend Developer"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="e.g. TechCorp"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Hyderabad / Remote"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="remote">Remote</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salary <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder="e.g. ₹8–12 LPA"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Required skills
                <span className="text-gray-400 font-normal"> (comma separated)</span>
              </label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="e.g. React, Node.js, MongoDB"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                placeholder="Describe the role, responsibilities, requirements..."
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 border border-gray-200">
              ⛓ Posting this job requires a blockchain payment of{' '}
              <strong>0.01 ETH</strong> via MetaMask. This prevents spam and
              verifies your listing.
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading || !account || step === 'paying'}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {step === 'paying'
                  ? 'Confirming payment...'
                  : 'Pay 0.01 ETH & Post Job'}
              </button>
              <Link
                to="/jobs"
                className="flex-1 text-center bg-gray-100 text-gray-600 py-2 rounded-lg font-medium hover:bg-gray-200 transition"
              >
                Cancel
              </Link>
            </div>

            {!account && (
              <p className="text-xs text-center text-yellow-600">
                ⚠ Connect your wallet above before posting
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostJob;