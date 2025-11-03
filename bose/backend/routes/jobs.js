import express from 'express';
import { v4 as uuid } from 'uuid';

const router = express.Router();

// In-memory mock store (persists during process lifetime)
let jobs = [
  { id: uuid(), title: 'Senior React Engineer', location: 'Remote', description: 'Build UI', status: 'active', applicantsCount: 5, createdAt: new Date().toISOString() },
  { id: uuid(), title: 'Backend Developer', location: 'NYC', description: 'Node.js services', status: 'draft', applicantsCount: 2, createdAt: new Date().toISOString() },
  { id: uuid(), title: 'QA Analyst', location: 'Austin, TX', description: 'Testing pipelines', status: 'closed', applicantsCount: 7, createdAt: new Date().toISOString() },
];

router.get('/my', (req, res) => {
  res.json(jobs);
});

router.post('/', (req, res) => {
  const { title, description, status, location } = req.body || {};
  if (!title) return res.status(400).json({ error: 'Title is required' });
  if (!description) return res.status(400).json({ error: 'Description is required' });
  if (!location) return res.status(400).json({ error: 'Location is required' });
  const normalizedStatus = ['active', 'closed', 'draft'].includes((status || '').toLowerCase())
    ? (status || '').toLowerCase()
    : 'draft';
  const job = {
    id: uuid(),
    title,
    description,
    location,
    status: normalizedStatus,
    applicantsCount: 0,
    createdAt: new Date().toISOString()
  };
  jobs.unshift(job);
  res.status(201).json(job);
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const idx = jobs.findIndex(j => j.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Job not found' });
  const updates = { ...req.body };
  if (updates.status) {
    const s = String(updates.status).toLowerCase();
    if (!['active', 'closed', 'draft'].includes(s)) return res.status(400).json({ error: 'Invalid status' });
    updates.status = s;
  }
  jobs[idx] = { ...jobs[idx], ...updates };
  res.json(jobs[idx]);
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const idx = jobs.findIndex(j => j.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Job not found' });
  const [removed] = jobs.splice(idx, 1);
  res.json(removed);
});

export default router;


