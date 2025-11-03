import express from 'express';

const router = express.Router();

router.get('/summary', (req, res) => {
  // Mocked summary data
  res.json({
    totalJobs: 24,
    openJobs: 7,
    totalCandidates: 158,
    verifiedCandidates: 132,
  });
});

router.get('/activity', (req, res) => {
  const now = Date.now();
  // Mocked activity list
  const activities = [
    { id: 'a1', message: 'Posted new job: Senior React Engineer', time: new Date(now - 1000 * 60 * 10).toISOString() },
    { id: 'a2', message: '3 candidates applied to Backend Developer', time: new Date(now - 1000 * 60 * 45).toISOString() },
    { id: 'a3', message: 'Verified credentials for C-004', time: new Date(now - 1000 * 60 * 90).toISOString() },
    { id: 'a4', message: 'Closed job: QA Analyst', time: new Date(now - 1000 * 60 * 240).toISOString() },
  ];
  res.json(activities);
});

export default router;


