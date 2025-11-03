import express from 'express';

const router = express.Router();

// in-memory store
let applicants = [
  {
    id: 'A-1001',
    jobId: 'J-1001',
    name: 'Ravi Menon',
    email: 'ravi@example.com',
    appliedAt: '2025-11-01T10:20:00Z',
    status: 'applied', // applied | shortlisted | rejected | hired
    resumeURL: 'https://example.com/resume/ravi.pdf',
  },
  {
    id: 'A-1002',
    jobId: 'J-1001',
    name: 'Aisha Khan',
    email: 'aisha@example.com',
    appliedAt: '2025-11-02T09:12:00Z',
    status: 'shortlisted',
    resumeURL: 'https://example.com/resume/aisha.pdf',
  },
  {
    id: 'A-1003',
    jobId: 'J-1002',
    name: 'Carlos Reyes',
    email: 'carlos@example.com',
    appliedAt: '2025-11-01T15:40:00Z',
    status: 'applied',
    resumeURL: 'https://example.com/resume/carlos.pdf',
  },
];

// list applicants for a job
router.get('/:jobId', (req, res) => {
  const list = applicants.filter((a) => a.jobId === req.params.jobId);
  res.json(list);
});

// update status
router.post('/:id/status', (req, res) => {
  const { status } = req.body || {};
  if (!['applied', 'shortlisted', 'rejected', 'hired'].includes(String(status))) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  const i = applicants.findIndex((a) => a.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Applicant not found' });
  applicants[i].status = status;
  res.json(applicants[i]);
});

export default router;


