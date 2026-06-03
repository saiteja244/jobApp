const express = require('express');
const { auth } = require('../middleware/auth');

const router = express.Router();

const mockResponses = [
  {
    keywords: ['resume', 'cv'],
    response: `Here are key tips to improve your resume:

1. **Keep it to 1-2 pages** — recruiters spend 6 seconds on average
2. **Start bullets with action verbs** — "Built", "Led", "Reduced", "Improved"
3. **Add numbers wherever possible** — "Increased sales by 40%" beats "Improved sales"
4. **Tailor it for each job** — mirror keywords from the job description
5. **Put your most recent experience first** — reverse chronological order
6. **Skills section matters** — list technical skills clearly at the top

Would you like tips on a specific section like education, projects, or experience?`,
  },
  {
    keywords: ['interview', 'prepare', 'preparation'],
    response: `Here is how to prepare for a tech interview:

**Before the interview:**
- Research the company — products, culture, recent news
- Practice common questions: "Tell me about yourself", "Why this company?"
- Review your resume — be ready to explain every line

**Technical preparation:**
- Practice DSA problems on LeetCode (arrays, strings, trees, graphs)
- Review system design basics for senior roles
- Do 2-3 mock interviews out loud

**On the day:**
- Arrive/join 5 minutes early
- Think out loud — interviewers want to see your process
- Ask clarifying questions before coding
- It is okay to say "I am not sure, but here is how I would approach it"

What type of interview are you preparing for — frontend, backend, or full stack?`,
  },
  {
    keywords: ['salary', 'negotiate', 'negotiation', 'pay', 'compensation'],
    response: `Salary negotiation tips that actually work:

1. **Never give a number first** — ask "What is the budget for this role?"
2. **Research market rates** — use Glassdoor, Levels.fyi, LinkedIn Salary
3. **Negotiate the whole package** — base, bonus, equity, remote days, learning budget
4. **Use silence** — after stating your number, stay quiet
5. **Always negotiate** — 85% of employers expect it, it never hurts to ask
6. **Get it in writing** — verbal offers mean nothing

A good script: "I am very excited about this role. Based on my research and experience, I was expecting something closer to X. Is there flexibility there?"

What stage are you at — offer received or preparing in advance?`,
  },
  {
    keywords: ['career', 'switch', 'change', 'transition'],
    response: `Switching careers into tech is very achievable. Here is a realistic roadmap:

**Phase 1 — Learn (3-6 months)**
- Pick one path: frontend, backend, data, or mobile
- Use free resources: freeCodeCamp, The Odin Project, CS50
- Build 2-3 real projects (not tutorials)

**Phase 2 — Build credibility (2-3 months)**
- Put projects on GitHub
- Deploy them live (Vercel, Netlify — free)
- Write about what you built on LinkedIn

**Phase 3 — Apply strategically**
- Target startups first — they care less about degrees
- Apply to 10-15 roles per week
- Reach out directly to engineers at companies you like

Your non-tech background is actually an advantage — domain knowledge in finance, healthcare, or education is rare in tech.

What field are you coming from?`,
  },
  {
    keywords: ['skills', 'learn', 'roadmap', 'frontend', 'backend', 'fullstack', 'full stack'],
    response: `Here is a focused learning roadmap:

**Frontend path:**
HTML → CSS → JavaScript → React → TypeScript → Next.js

**Backend path:**
JavaScript/Python → Node.js/Django → Databases (SQL + MongoDB) → REST APIs → Auth → Deployment

**Full Stack (what you are building now!):**
Both paths above + Git + Docker basics + Cloud (AWS/Vercel)

**Most important advice:**
Build projects from day one. Do not spend months just watching tutorials.
Every concept you learn, immediately apply it to something real.

You are already on the right track building WorkPortal — this is exactly how you learn best.

Which specific technology would you like a deeper roadmap for?`,
  },
  {
    keywords: ['job', 'find', 'search', 'apply', 'hunting', 'offer'],
    response: `Job search strategy that works in 2024:

**Quality over quantity:**
- 10 targeted applications beats 100 spray-and-pray
- Customize your cover letter for each role (takes 10 mins)

**Where to find jobs:**
- LinkedIn (set "Open to Work" privately)
- Company career pages directly
- AngelList/Wellfound for startups
- Referrals — ask your network, 40% of hires come from referrals

**The application funnel:**
100 applications → 15 phone screens → 5 technical rounds → 1-2 offers

**Timeline expectations:**
- Junior roles: 2-4 months average
- Mid roles: 1-3 months
- Senior roles: 1-2 months (fewer roles but more targeted)

What level are you applying for — junior, mid, or senior?`,
  },
  {
    keywords: ['linkedin', 'profile', 'network', 'networking'],
    response: `How to make your LinkedIn work for you:

**Profile essentials:**
- Professional photo (increases views by 14x)
- Headline beyond just job title — "React Developer | Building products users love"
- Summary that tells your story in 3-4 sentences
- All experience sections filled with bullet points and numbers

**Content strategy:**
- Post once a week about something you built or learned
- Comment meaningfully on 5 posts per day
- Share your project launches with a short demo

**Networking that does not feel weird:**
- Connect with people after events or online interactions
- Send a short note: "Saw your post about X, really resonated — would love to connect"
- Follow up once, then let it go

**For job searching:**
- Message recruiters directly: "I applied for X role, wanted to flag my interest"
- This alone gets you 3x more responses

Is there a specific part of your LinkedIn you want help improving?`,
  },
];

const defaultResponse = `I am your AI career assistant. I can help you with:

- **Resume writing** — how to structure and improve it
- **Interview preparation** — technical and behavioral
- **Salary negotiation** — how to get what you deserve
- **Career switching** — realistic roadmaps into tech
- **Skills and learning** — what to learn next
- **Job searching** — strategy and where to look
- **LinkedIn and networking** — building your presence

Just ask me anything about your career and I will give you specific, actionable advice.

What would you like help with today?`;

// POST /api/ai/chat
router.post('/chat', auth, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const lowerMessage = message.toLowerCase();

    const match = mockResponses.find((item) =>
      item.keywords.some((keyword) => lowerMessage.includes(keyword))
    );

    await new Promise((resolve) => setTimeout(resolve, 800));

    const response = match ? match.response : defaultResponse;

    res.json({ response });

  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/ai/suggestions
router.get('/suggestions', auth, (req, res) => {
  const suggestions = [
    'How do I improve my resume?',
    'How should I prepare for a tech interview?',
    'How do I negotiate my salary?',
    'What skills should I learn for full stack development?',
    'How do I switch careers into tech?',
    'How do I find a job faster?',
    'How do I improve my LinkedIn profile?',
  ];

  res.json({ suggestions });
});

module.exports = router;