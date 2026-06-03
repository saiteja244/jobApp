const express = require('express');
const Job = require('../models/Job');
const { auth } = require('../middleware/auth');

const router = express.Router();

// ─── CREATE A JOB ─────────────────────────────────────────────────────────────
// POST /api/jobs
// Protected - only logged-in users can post jobs
router.post('/', auth, async (req, res) => {
  try {
    const { title, company, description, location, salary, type, skills } = req.body;

    // Validate required fields
    if (!title || !company || !description || !location) {
      return res.status(400).json({ message: 'Title, company, description and location are required' });
    }

    // Create the job - employer is the currently logged-in user
    // req.user._id comes from the auth middleware
    const job = new Job({
      title,
      company,
      description,
      location,
      salary,
      type,
      skills: skills || [],
      employer: req.user._id,
    });

    await job.save();

    res.status(201).json({ message: 'Job posted successfully', job });

  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── GET ALL JOBS ─────────────────────────────────────────────────────────────
// GET /api/jobs
// GET /api/jobs?search=react         ← search by keyword
// GET /api/jobs?type=remote          ← filter by job type
// GET /api/jobs?page=2&limit=10      ← pagination
// Public - no token needed
router.get('/', async (req, res) => {
  try {
    // Pull query params from URL - defaults if not provided
    const { search, type, page = 1, limit = 10 } = req.query;

    // Build a filter object - we add to it based on what was requested
    const filter = { isActive: true };

    // If search term provided, use MongoDB text search
    if (search) {
      filter.$text = { $search: search };
    }

    // If type filter provided, add it to the filter
    if (type) {
      filter.type = type;
    }

    // Calculate how many documents to skip for pagination
    // page=1 → skip 0, page=2 → skip 10, page=3 → skip 20
    const skip = (page - 1) * limit;

    // Find jobs matching our filter
    const jobs = await Job.find(filter)
      .populate('employer', 'name email')  // replace employer ObjectId with name+email
      .sort({ createdAt: -1 })             // newest jobs first
      .skip(skip)
      .limit(parseInt(limit));

    // Count total matching jobs (for frontend to know how many pages there are)
    const total = await Job.countDocuments(filter);

    res.json({
      jobs,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),  // total number of pages
    });

  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── GET ONE JOB ──────────────────────────────────────────────────────────────
// GET /api/jobs/:id
// :id is a URL parameter - e.g. /api/jobs/64abc123
// Public
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('employer', 'name email bio')
      .populate('applications.applicant', 'name email'); // also populate applicants

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({ job });

  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── APPLY FOR A JOB ──────────────────────────────────────────────────────────
// POST /api/jobs/:id/apply
// Protected
router.post('/:id/apply', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Prevent employer from applying to their own job
    if (job.employer.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot apply to your own job' });
    }

    // Check if user already applied
    // .some() returns true if at least one element matches the condition
    const alreadyApplied = job.applications.some(
      (app) => app.applicant.toString() === req.user._id.toString()
    );

    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Add the application to the job's applications array
    job.applications.push({
      applicant: req.user._id,
      coverLetter: req.body.coverLetter || '',
    });

    await job.save();

    res.json({ message: 'Application submitted successfully' });

  } catch (error) {
    console.error('Apply error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;